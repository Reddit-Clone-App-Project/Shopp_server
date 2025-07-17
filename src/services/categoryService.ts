import pool from "../config/db";
import { ActiveCategory, Category, UpdateCategory } from "../types/category";
import { Product } from "../types/product";

// User
export const getAllActiveCategories = async (): Promise<ActiveCategory[]> => { 
    const result = await pool.query(
        'SELECT id, name, slug, description, image_url FROM category WHERE is_active = true'
    );
    return result.rows;
}

// Admin
export const createACategory = async (category: Category): Promise<Category> => {
    const result = await pool.query(
        'INSERT INTO category (name, slug, parent_id, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [category.name, category.slug, category.parent_id, category.description, category.image_url]
    );
    return result.rows[0];
}

export const getAllCategories = async () => {
    const result = await pool.query(
        'SELECT * FROM category'
    );
    return result.rows;
}


export const updateCategory = async (category: UpdateCategory) => {
    const result = await pool.query(
        'UPDATE category SET name = $1, slug = $2, parent_id = $3, description = $4, image_url = $5, is_active = $6 WHERE id = $7 RETURNING *',
        [category.name, category.slug, category.parent_id, category.description, category.image_url, category.is_active, category.id]
    );
    return result.rows[0];
}

export const deleteCategory = async (id: number) => {
    const result = await pool.query(
        'DELETE FROM category WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
}

export const searchProductsByCategory = async (categoryId: number, limit: number = 20, offset: number = 0): Promise<Product[]> => {
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
            p.category_id = $1
            AND p.is_active = true
        ORDER BY
            p.views DESC,
            p.bought DESC,
            p.average_rating DESC,
            p.created_at DESC
        LIMIT $2
        OFFSET $3;
    `;

    const result = await pool.query(query, [categoryId, limit, offset]);
    return result.rows;
};