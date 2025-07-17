import pool from "../config/db";
import { Product } from "../types/product";
import { StoreData, StoreAddress, StoreOwner, StoreInfo, RatingStats, Review, StoreUpdate, StoreInfoUpdate } from "../types/store";
import { PoolClient } from "pg";

export const createAddress = async (address: StoreAddress, client: PoolClient) => {
    const result = await client.query(
        'INSERT INTO address (full_name, phone_number, country, province, city, postal_code, address_line1, address_line2) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [address.full_name, address.phone_number, address.country, address.province, address.city, address.postal_code, address.address_line1, address.address_line2]
    );
    return result.rows[0].id;
};

export const createStore = async (store: StoreData, address_id: number, client: PoolClient) => {
    const result = await client.query(
        'INSERT INTO store (name, address_id, phone_number, email, express_shipping, fast_shipping, economical_shipping, bulky_shipping) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, phone_number',
        [store.storeName, address_id, store.storePhone, store.storeEmail, store.expressShipping, store.fastShipping, store.economicalShipping, store.bulkyShipping]
    );
    return result.rows[0];
};

export const createOwner = async (owner: StoreOwner, client: PoolClient) => {
    const result = await client.query(
        'INSERT INTO store_user (store_id, app_user_id, role) VALUES ($1, $2, $3)',
        [owner.store_id, owner.app_user_id, owner.role]
    );
};

export const getStores = async () => {
    const result = await pool.query(
        'SELECT id, name, profile_img FROM store',
    );
    return result.rows;
};

export const getStoreProfile = async (storeId: number): Promise<StoreInfo | undefined> => {
    const result = await pool.query(
        'SELECT id, name, address_id, profile_img, phone_number, email, express_shipping, fast_shipping, economical_shipping, bulky_shipping, created_at FROM store WHERE id = $1',
        [storeId]
    );
    return result.rows[0];
};  

export const getStoreAddressById = async (addressId: number): Promise<StoreAddress | undefined> => {
    const result = await pool.query(
        'SELECT full_name, phone_number, country, province, city, postal_code, address_line1, address_line2 FROM address WHERE id = $1',
        [addressId]
    );
    return result.rows[0];
};

export const getRatingStats = async (storeId: number): Promise<RatingStats> => {
    const result = await pool.query(
        'SELECT AVG(rating) AS average_rating, COUNT(*) AS total_reviews FROM review WHERE store_id = $1',
        [storeId]
    );
    return {
        average_rating: Number(result.rows[0].average_rating) || 0,
        total_reviews: Number(result.rows[0].total_reviews) || 0,
    };
};

export const getRecentReviews = async (storeId: number, limit: number): Promise<Review[]> => {
    const result = await pool.query(
        `SELECT r.*, u.username, u.profile_img
            FROM review r
            JOIN app_user u ON r.app_user_id = u.id
            WHERE r.store_id = $1
            ORDER BY r.created_at DESC
            LIMIT $2`,
    [storeId, limit]
    );
    return result.rows;
};

export const checkStoreOwner = async (storeId: number, ownerId: number): Promise<boolean> => {
    const result = await pool.query(
        'SELECT app_user_id FROM store_user WHERE store_id = $1',
       [storeId] 
    );
    const trueOwnerId = result.rows[0]?.app_user_id;
    if (trueOwnerId === ownerId) {
        return true;
    } else {
        return false;
    };
};

export const updateStoreProfile = async (store: StoreUpdate): Promise<StoreInfoUpdate> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            'UPDATE store SET name = $1, profile_img = $2, phone_number = $3, email = $4, express_shipping = $5, fast_shipping = $6, economical_shipping = $7, bulky_shipping = $8 WHERE id = $9',
            [store.storeName, store.storeProfile_img, store.storePhone, store.storeEmail, store.expressShipping, store.fastShipping, store.economicalShipping, store.bulkyShipping, store.storeId]
        );

        const result = await client.query(
            'SELECT address_id FROM store WHERE id = $1', 
            [store.storeId]
        );
        const address_id: number = result.rows[0]?.address_id;

        if (address_id && store.address) {
        await client.query(
          'UPDATE address SET full_name = $1, phone_number = $2, country = $3, province = $4, city = $5, postal_code = $6, address_line1 = $7, address_line2 = $8 WHERE id = $9',
          [
            store.address.full_name,
            store.address.phone_number,
            store.address.country,
            store.address.province,
            store.address.city,
            store.address.postal_code,
            store.address.address_line1,
            store.address.address_line2,
            address_id
          ]
        );
        }
        await client.query('COMMIT');
        const storeResult = await client.query(
            'SELECT id, name, address_id, profile_img, phone_number, email, express_shipping, fast_shipping, economical_shipping, bulky_shipping FROM store WHERE id = $1',
            [store.storeId]
        );
        const addressResult = await client.query(
            'SELECT full_name, phone_number, country, province, city, postal_code, address_line1, address_line2 FROM address WHERE id = $1',
            [address_id]
        );
        return {
            ...storeResult.rows[0],
            address: addressResult.rows[0],
        }; 
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const deleteStoreProfile = async (storeId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM store WHERE id = $1',
        [storeId]
    );
    return result.rowCount;
};

// Product
export const getStoreTrendingProducts = async (storeId: number, limit: number = 4, offset: number=0): Promise<Product[]> => {
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
            p.is_active = true
            AND p.store_id = $1
        ORDER BY
            p.views DESC
        LIMIT $2
        OFFSET $3;
    `;

    const result = await pool.query(query, [storeId, limit, offset]);
    return result.rows;
};

export const getStoreProducts = async (storeId: number, limit: number = 5, offset: number = 0): Promise<Product[]> => {
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
            p.is_active = true
            AND p.store_id = $1
        ORDER BY
            p.bought DESC
        LIMIT $2
        OFFSET $3;
    `;

    const result = await pool.query(query, [storeId, limit, offset]);
    return result.rows;
};

// Discount for store
export const getDiscountsByStoreId = async (storeId: number) => {
    const result = await pool.query(
        "SELECT id, name, discount_type, discount_value, description, start_at, end_at FROM discount WHERE store_id = $1 AND discount_where = 'other' AND scope = 'optional' AND status = 'active'",
        [storeId]
    );
    return result.rows;
}

