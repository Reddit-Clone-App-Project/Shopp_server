import pool from "../config/db";
import { ActiveCategory, Category, UpdateCategory } from "../types/category";
import { Product } from "../types/product";

// User
export const getAllActiveCategories = async (): Promise<ActiveCategory[]> => {
  const result = await pool.query(
    "SELECT id, name, slug, image_url FROM category WHERE is_active = true"
  );
  return result.rows;
};

// Admin
export const createACategory = async (
  category: Category
): Promise<Category> => {
  const result = await pool.query(
    "INSERT INTO category (name, slug, parent_id, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
    [category.name, category.slug, category.parent_id, category.image_url]
  );
  return result.rows[0];
};

export const getAllCategories = async () => {
  const result = await pool.query("SELECT * FROM category");
  return result.rows;
};

export const updateCategory = async (category: UpdateCategory) => {
  const result = await pool.query(
    "UPDATE category SET name = $1, slug = $2, parent_id = $3, image_url = $4, is_active = $5 WHERE id = $6 RETURNING *",
    [
      category.name,
      category.slug,
      category.parent_id,
      category.image_url,
      category.is_active,
      category.id,
    ]
  );
  return result.rows[0];
};

export const deleteCategory = async (id: number) => {
  const result = await pool.query(
    "DELETE FROM category WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// Define an interface for the search options for type safety
interface CategorySearchOptions {
  categoryId: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export const searchProductsByCategory = async (
  options: CategorySearchOptions
): Promise<Product[]> => {
  const {
    categoryId,
    limit = 20,
    offset = 0,
    sortBy = "Most Popular",
    minPrice,
    maxPrice,
    rating,
  } = options;

  const params: any[] = [];
  let paramIndex = 1;

  // This rewritten query uses CTEs for performance, similar to searchProducts.
  let query = `
    WITH variants_agg AS (
      -- CTE 1: Pre-aggregate all variant data, including their images and discounts
      SELECT
        pv.product_id,
        json_agg(
          json_build_object(
            'id', pv.id, 'variant_name', pv.variant_name, 'price', pv.price, 
            'stock_quantity', pv.stock_quantity, 'sku', pv.sku,
            'images', (
              SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'alt_text', pi.alt_text)) 
              FROM public.product_image pi WHERE pi.product_variant_id = pv.id
            ),
            'discounts', (
              SELECT json_agg(json_build_object('id', d.id, 'name', d.name, 'discount_type', d.discount_type, 'discount_value', d.discount_value, 'start_at', d.start_at, 'end_at', d.end_at)) 
              FROM public.discount d JOIN public.product_discount pd ON d.id = pd.discount_id 
              WHERE pd.product_variant_id = pv.id AND d.status = 'active' AND d.discount_where = 'product'
            )
          )
        ) AS variants
      FROM public.product_variant pv
      GROUP BY pv.product_id
    ),
    product_images_agg AS (
      -- CTE 2: Pre-aggregate product-level images
      SELECT 
        pi.product_id,
        json_agg(json_build_object('id', pi.id, 'url', pi.url, 'alt_text', pi.alt_text)) as product_images
      FROM public.product_image pi
      WHERE pi.product_variant_id IS NULL AND pi.is_promotion_image = false
      GROUP BY pi.product_id
    ),
    promo_image_agg AS (
      -- CTE 3: Get the single promotion image for each product
      SELECT DISTINCT ON (product_id)
        product_id,
        json_build_object('id', id, 'url', url, 'alt_text', alt_text) as promotion_image
      FROM public.product_image
      WHERE is_promotion_image = true
    )
    SELECT
      p.id, p.name, p.description, p.created_at, p.updated_at, p.is_published,
      p.views, p.bought, p.total_reviews, p.average_rating, p.stars_5, p.stars_4,
      p.stars_3, p.stars_2, p.stars_1, p.have_comment, p.have_image,
      json_build_object('id', s.id, 'name', s.name, 'profile_img', s.profile_img) AS store,
      ch.category_hierarchy,
      promo.promotion_image,
      v.variants,
      pi.product_images
    FROM public.product p
    LEFT JOIN public.store s ON p.store_id = s.id
    LEFT JOIN variants_agg v ON p.id = v.product_id
    LEFT JOIN product_images_agg pi ON p.id = pi.product_id
    LEFT JOIN promo_image_agg promo ON p.id = promo.product_id
    LEFT JOIN LATERAL (
      WITH RECURSIVE category_path AS (
          SELECT id, name, slug, parent_id, 0 as level FROM public.category WHERE id = p.category_id
          UNION ALL
          SELECT c.id, c.name, c.slug, c.parent_id, cp.level + 1 FROM public.category c JOIN category_path cp ON c.id = cp.parent_id
      )
      SELECT json_agg(json_build_object('id', id, 'name', name, 'slug', slug) ORDER BY level ASC) AS category_hierarchy
      FROM category_path
    ) ch ON true
  `;

  // --- Dynamic WHERE Clause ---
  const whereClauses: string[] = [];
  whereClauses.push(`p.category_id = $${paramIndex++}`);
  params.push(categoryId);
  whereClauses.push(`p.is_active = true`);

  if (rating) {
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
    whereClauses.push(
      `EXISTS (SELECT 1 FROM public.product_variant pv WHERE pv.product_id = p.id AND ${priceConditions.join(
        " AND "
      )})`
    );
  }
  query += ` WHERE ${whereClauses.join(" AND ")}`;

  // --- Dynamic ORDER BY Clause ---
  let orderByClause = "";
  switch (sortBy) {
    case "Newest":
      orderByClause = "ORDER BY p.created_at DESC";
      break;
    case "Most Bought":
      orderByClause = "ORDER BY p.bought DESC";
      break;
    case "Price: Low to High":
      orderByClause = `ORDER BY (SELECT MIN(price) FROM public.product_variant WHERE product_id = p.id) ASC NULLS LAST`;
      break;
    case "Price: High to Low":
      orderByClause = `ORDER BY (SELECT MIN(price) FROM public.product_variant WHERE product_id = p.id) DESC NULLS LAST`;
      break;
    case "Most Popular":
    default:
      orderByClause = `ORDER BY p.views DESC, p.bought DESC, p.average_rating DESC, p.created_at DESC`;
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
