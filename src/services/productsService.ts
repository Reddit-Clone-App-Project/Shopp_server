import { PoolClient } from "pg";
import pool from "../config/db";
import type { BasicProductVariant, CompleteProduct, NewProduct, UpdateProduct, UpdateProductVariant, VariantImage, UpdateVariantImage, Product, BasicProduct, ProductCard, ProductDataType, VariantDataType } from "../types/product";
import { Review } from "../types/store";
import { bucket } from "../config/gcs";

// This service get products for the home page
export const getHotProducts = async (limit: number = 20, offset: number = 0): Promise<ProductCard[]> => {
    const query = `
        SELECT
            p.id,
            p.name,
            p.bought,
            p.average_rating,
            -- Fetch the single promotion image
            (
                SELECT json_build_object('id', id, 'url', url, 'alt_text', alt_text)
                FROM public.product_image
                WHERE product_id = p.id AND is_promotion_image = true
                LIMIT 1
            ) AS promotion_image,
            -- Fetch basic store info
            json_build_object('id', s.id, 'name', s.name) AS store,
            -- Fetch the price from the first variant as the display price
            (
                SELECT MIN(price)
                FROM public.product_variant
                WHERE product_id = p.id
            ) AS price
        FROM 
            public.product p
        LEFT JOIN 
            public.store s ON p.store_id = s.id
        WHERE 
            p.is_active = true AND p.is_published = true
        ORDER BY 
            p.views DESC, p.bought DESC -- Order by views, then by sales
        LIMIT $1
        OFFSET $2;
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
};

export const getProductProfile = async (productId: number): Promise<Product> => {
        const query = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.created_at,
            p.updated_at,
            p.is_published,
            p.views,
            p.bought,
            p.total_reviews,
            p.average_rating,
            p.stars_5,
            p.stars_4,
            p.stars_3,
            p.stars_2,
            p.stars_1,
            p.have_comment,
            p.have_image,
            json_build_object(
                'id', s.id,
                'name', s.name,
                'profile_img', s.profile_img
            ) AS store,
            -- UPDATED: Category Hierarchy (as a JSON array)
            ch.category_hierarchy,
            (
                SELECT
                    json_build_object(
                        'id', pi_promo.id,
                        'url', pi_promo.url,
                        'alt_text', pi_promo.alt_text
                    )
                FROM public.product_image pi_promo
                WHERE pi_promo.product_id = p.id AND pi_promo.is_promotion_image = true
                LIMIT 1
            ) AS promotion_image,
            (
                SELECT
                    json_agg(
                        json_build_object(
                            'id', pv.id,
                            'variant_name', pv.variant_name,
                            'price', pv.price,
                            'stock_quantity', pv.stock_quantity,
                            'sku', pv.sku,
                            'images', (
                                SELECT
                                    json_agg(json_build_object('id', pi_variant.id, 'url', pi_variant.url, 'alt_text', pi_variant.alt_text))
                                FROM public.product_image pi_variant
                                WHERE pi_variant.product_variant_id = pv.id
                            ),
                            'discounts', (
                                SELECT
                                    json_agg(json_build_object('id', d.id, 'name', d.name, 'discount_type', d.discount_type, 'discount_value', d.discount_value, 'start_at', d.start_at, 'end_at', d.end_at))
                                FROM public.discount d
                                JOIN public.product_discount pd ON d.id = pd.discount_id
                                WHERE pd.product_variant_id = pv.id AND d.status = 'active' AND d.discount_where = 'product'
                            )
                        )
                    )
                FROM public.product_variant pv
                WHERE pv.product_id = p.id
            ) AS variants,
            (
                SELECT
                    json_agg(json_build_object('id', pi_product.id, 'url', pi_product.url, 'alt_text', pi_product.alt_text))
                FROM public.product_image pi_product
                WHERE pi_product.product_id = p.id
                  AND pi_product.product_variant_id IS NULL
                  AND pi_product.is_promotion_image = false
            ) AS product_images
        FROM
            public.product p
        LEFT JOIN public.store s ON p.store_id = s.id
        -- UPDATED: Using LEFT JOIN LATERAL to run a recursive query for each product's category
        LEFT JOIN LATERAL (
            WITH RECURSIVE category_path AS (
                -- Anchor: The product's direct category
                SELECT id, name, slug, parent_id, 0 as level
                FROM public.category
                WHERE id = p.category_id

                UNION ALL

                -- Recursive Member: The parent of the previous category
                SELECT c_parent.id, c_parent.name, c_parent.slug, c_parent.parent_id, cp.level + 1
                FROM public.category c_parent
                JOIN category_path cp ON c_parent.id = cp.parent_id
            )
            -- Aggregate the entire path into a single JSON array, ordered by level
            SELECT json_agg(
                       json_build_object(
                           'id', id,
                           'name', name,
                           'slug', slug
                       ) ORDER BY level ASC
                   ) AS category_hierarchy
            FROM category_path
        ) ch ON true
        WHERE
            p.id = $1
    `;

    const result = await pool.query(query, [productId]);
    return result.rows[0];
};

export const getCategoryId = async (client: PoolClient, name: string): Promise<number> => {
    const result = await client.query(
        'SELECT id FROM category WHERE name = $1',
        [name]

    );
    return result.rows[0].id;
}


export const createProduct = async (client: PoolClient, data: ProductDataType, store_id: number) => {
    
    const product = await client.query(
        'INSERT INTO product (name, description, store_id, category_id) VALUES ($1, $2, $3, $4) RETURNING id, name, description, store_id, category_id',
        [data.name, data.description, store_id, data.category]
    );

    const productId = product.rows[0].id;

    // Handle promotion image
    if (data.promotionImage) {
        await client.query(
            'INSERT INTO product_image (product_id, url, is_promotion_image) VALUES ($1, $2, $3)',
            [productId, data.promotionImage, true]
        );
    };

    // Handle other product images
    if (Array.isArray(data.productImage) && data.productImage.length > 0) {
        for (const url of data.productImage) {
            await client.query(
                'INSERT INTO product_image (product_id, url, is_promotion_image) VALUES ($1, $2, $3)',
                [productId, url, false]
            );
        };
    };
    
    return product.rows[0];
};

export const createProductVariant = async (client: PoolClient, variant: VariantDataType & { product_id: number }) => {
    const length = Number(variant.variantLength);
    const width  = Number(variant.variantWidth);
    const height = Number(variant.variantHeight);
    const dimension = [length, width, height].every(v => Number.isFinite(v) && v > 0)
        ? length * width * height
        : 0;

    const newVariant = await client.query(
        'INSERT INTO product_variant (product_id, variant_name, price, weight, dimension, sku) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, product_id, variant_name, price, weight, dimension',
        // Ensure price is treated as a number
        [variant.product_id, variant.variantName, Number(variant.variantPrice), variant.variantWeight, dimension, variant.variantSku]
    );

    const newVariantId = newVariant.rows[0].id;

    // This part is already correct for handling URLs
    if (Array.isArray(variant.variantImage) && variant.variantImage.length > 0) {
        for (const url of variant.variantImage) {
            if (url && typeof url === 'string' && url.trim() !== '') {
                await client.query(
                    'INSERT INTO product_image (product_id, product_variant_id, url) VALUES ($1, $2, $3)',
                    [variant.product_id, newVariantId, url]
                );
            }
        }
    }

    return newVariant.rows[0];
};

export const updateProduct = async (productId: number, product: UpdateProduct): Promise<UpdateProduct> => {
    const result = await pool.query(
        'UPDATE product SET name = $1, description = $2, is_active = $3 WHERE id = $4 RETURNING id, name, description, is_active',
        [product.name, product.description, product.is_active, productId]
    );
    return result.rows[0];
};

export const getStoreId = async (product_id: number): Promise<number> =>{
    const result = await pool.query(
        'SELECT store_id FROM product WHERE id = $1',
        [product_id]
    );

    if (result.rows.length === 0) {
        throw new Error("Product not found");
    };

    return result.rows[0].store_id;
};

export const getProductId = async (variant_id: number): Promise<number> =>{
    const result = await pool.query(
        'SELECT product_id FROM product_variant WHERE id = $1',
        [variant_id]
    );
    return result.rows[0].product_id;
};

export const updateProductVariant = async (variantId: number, variant: UpdateProductVariant): Promise<number> => {
    const result = await pool.query(
        'UPDATE product_variant SET variant_name = $1, price = $2, stock_quantity = $3, weight = $4, is_available = $5 WHERE id = $6 RETURNING id',
        [variant.variant_name, variant.price, variant.stock_quantity, variant.weight, variant.is_available, variantId]
    );
    return result.rows[0].id;
};


export const updateProductImage = async (imageId: number, image: UpdateVariantImage): Promise<number> => {
    const result = await pool.query(
        'UPDATE product_image SET url = $1, alt_text = $2 WHERE id = $3 RETURNING id',
        [image.url, image.alt_text, imageId]
    );
    return result.rows[0].id;
};

export const deleteProduct = async (productId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM product WHERE id = $1',
        [productId]
    );
    return result.rowCount;
};

export const deleteVariant = async (variantId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM product_variant WHERE id = $1',
        [variantId]
    );
    return result.rowCount;
};

export const deleteVariantImage = async (imageId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM product_image WHERE id = $1',
        [imageId]
    );
    return result.rowCount;
};

// Rating and review
export const getReviews = async (productId: number, limit: number = 25, offset: number = 0): Promise<Review[]> => {
    const result = await pool.query(
        `SELECT review.*, app_user.username, app_user.profile_img FROM review JOIN app_user ON review.app_user_id = app_user.id WHERE review.product_id = $1 ORDER BY review.created_at DESC LIMIT $2 OFFSET $3`,
        [productId, limit, offset]
    );
    return result.rows;
}

export const getReviewsByStar = async (productId: number, limit: number = 25, offset:number = 0, rating: number): Promise<Review[]> => {
    const result = await pool.query(
        `SELECT review.*, app_user.username, app_user.profile_img FROM review JOIN app_user ON review.app_user_id = app_user.id WHERE review.product_id = $1 AND review.rating = $2 ORDER BY review.created_at DESC LIMIT $3 OFFSET $4`,
        [productId, rating, limit, offset]
    );
    return result.rows;
}

export const getReviewsThatHaveComment = async (productId: number, limit: number = 25, offset: number = 0): Promise<Review[]> => {
    const result = await pool.query(
        `SELECT review.*, app_user.username, app_user.profile_img FROM review JOIN app_user ON review.app_user_id = app_user.id WHERE review.product_id = $1 AND review.comment IS NOT NULL ORDER BY review.created_at DESC LIMIT $2 OFFSET $3`,
        [productId, limit, offset]
    );
    return result.rows;
}

export const getReviewsThatHaveImage = async (productId: number, limit: number = 25, offset: number = 0): Promise<Review[]> => {
    const result = await pool.query(
        `SELECT review.*, app_user.username, app_user.profile_img FROM review JOIN app_user ON review.app_user_id = app_user.id WHERE review.product_id = $1 AND review.img_url IS NOT NULL ORDER BY review.created_at DESC LIMIT $2 OFFSET $3`,
        [productId, limit, offset]
    );
    return result.rows;
}

// Define an interface for the search options for type safety
interface SearchOptions {
  searchTerm: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export const searchProducts = async (options: SearchOptions): Promise<ProductCard[]> => {
  const {
    searchTerm,
    limit = 20,
    offset = 0,
    sortBy = 'Relevance',
    minPrice,
    maxPrice,
    rating,
  } = options;

  const params: any[] = [searchTerm];
  let paramIndex = 2; // Start params at $2 since $1 is for the search term

  // This query is now much simpler and more performant
  let query = `
    SELECT
        p.id,
        p.name,
        p.bought,
        p.average_rating,
        (
            SELECT json_build_object('id', id, 'url', url, 'alt_text', alt_text)
            FROM public.product_image
            WHERE product_id = p.id AND is_promotion_image = true
            LIMIT 1
        ) AS promotion_image,
        json_build_object('id', s.id, 'name', s.name) AS store,
        (
            SELECT MIN(price)
            FROM public.product_variant
            WHERE product_id = p.id
        ) AS price
    FROM 
        public.product p
    LEFT JOIN 
        public.store s ON p.store_id = s.id
  `;

  // --- Dynamic WHERE Clause ---
  const whereClauses: string[] = [];
  whereClauses.push(`p.fts @@ websearch_to_tsquery('english', $1)`);
  whereClauses.push(`p.is_active = true AND p.is_published = true`);

  if (rating !== undefined) {
    whereClauses.push(`p.average_rating >= $${paramIndex++}`);
    params.push(rating);
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceConditions: string[] = [];
    if (minPrice !== undefined) {
      priceConditions.push(`pv.price >= $${paramIndex++}`);
      params.push(minPrice);
    }
    if (maxPrice !== undefined) {
      priceConditions.push(`pv.price <= $${paramIndex++}`);
      params.push(maxPrice);
    }
    whereClauses.push(`EXISTS (SELECT 1 FROM public.product_variant pv WHERE pv.product_id = p.id AND ${priceConditions.join(' AND ')})`);
  }
  
  query += ` WHERE ${whereClauses.join(' AND ')}`;

  // --- Dynamic ORDER BY Clause ---
  let orderByClause = '';
  switch (sortBy) {
    case 'Newest':
      orderByClause = 'ORDER BY p.created_at DESC';
      break;
    case 'Most Bought':
      orderByClause = 'ORDER BY p.bought DESC';
      break;
    case 'Price: Low to High':
      orderByClause = `ORDER BY (SELECT MIN(price) FROM public.product_variant WHERE product_id = p.id) ASC NULLS LAST`;
      break;
    case 'Price: High to Low':
      orderByClause = `ORDER BY (SELECT MIN(price) FROM public.product_variant WHERE product_id = p.id) DESC NULLS LAST`;
      break;
    case 'Relevance':
    default:
      // $1 is always the search term for ranking
      orderByClause = `ORDER BY ts_rank(p.fts, websearch_to_tsquery('english', $1)) DESC`;
      break;
  }
  query += ` ${orderByClause}`;

  // --- Pagination ---
  query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  // Execute the final query
  const result = await pool.query(query, params);
  return result.rows;
};

export const getSearchSuggestions = async (prefix: string, limit: number = 10): Promise<string[]> => {
    const query = `
        SELECT DISTINCT name
        FROM product
        WHERE name ILIKE $1 -- Use ILIKE for a case-insensitive search
        LIMIT $2;
    `;
    
    const result = await pool.query(query, [prefix + '%', limit]);
    
    return result.rows.map(row => row.name);
};