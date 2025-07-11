import pool from "../config/db";
import type { BasicProductVariant, CompleteProduct, NewProduct, UpdateProduct, UpdateProductVariant, VariantImage, UpdateVariantImage, Product, BasicProduct } from "../types/product";

// This service get products for the home page
export const getHotProducts = async (limit: number = 20, offset: number = 0): Promise<Product[]> => {
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
            p.sku,
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
                                WHERE (pd.product_variant_id = pv.id OR pd.product_id = p.id) AND d.is_active = true AND d.status = 'active'
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
            p.is_active = true
        ORDER BY
            p.views DESC
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
            p.sku,
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
                                WHERE (pd.product_variant_id = pv.id OR pd.product_id = p.id) AND d.is_active = true AND d.status = 'active'
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

export const createProduct = async (product: NewProduct): Promise<BasicProduct> => {
    const result = await pool.query(
        'INSERT INTO product (name, description, store_id, category_id) VALUES ($1, $2, $3, $4) RETURNING id, name, description, store_id, category_id',
        [product.name, product.description, product.store_id, product.category_id]
    );
    return result.rows[0];
}

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

export const createProductVariant = async (variant: BasicProductVariant) => {
    const result = await pool.query(
        'INSERT INTO product_variant (id, product_id, variant_name, price, stock_quantity, weight, sku) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [variant.id, variant.product_id, variant.variant_name, variant.price, variant.stock_quantity, variant.weight, variant.sku]
    );
    return result.rows[0].id;
};

export const updateProductVariant = async (variantId: number, variant: UpdateProductVariant): Promise<number> => {
    const result = await pool.query(
        'UPDATE product_variant SET variant_name = $1, price = $2, stock_quantity = $3, weight = $4, is_available = $5 WHERE id = $6 RETURNING id',
        [variant.variant_name, variant.price, variant.stock_quantity, variant.weight, variant.is_available, variantId]
    );
    return result.rows[0].id;
};

export const createProductImage = async (image: VariantImage): Promise<number> => {
    const result = await pool.query(
        'INSERT INTO product_image (variant_id, url, alt_text) VALUES ($1, $2, $3) RETURNING id',
        [image.variant_id, image.url, image.alt_text]
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
