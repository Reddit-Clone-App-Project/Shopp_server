import pool from "../config/db";
import { ProductCard } from "../types/product";
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

export const getStoresOwned = async (userId: number) => {
    const result = await pool.query(
        'SELECT s.* FROM store_user su JOIN store s ON su.store_id = s.id WHERE su.app_user_id = $1 AND su.role = \'owner\'',
        [userId]
    );
    return result.rows;
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
export const getStoreTrendingProducts = async (
  storeId: number,
  limit: number = 4,
  offset: number = 0
): Promise<ProductCard[]> => {
  const query = `
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
    WHERE 
        p.is_active = true 
        AND p.is_published = true
        AND p.store_id = $1
    ORDER BY
        p.views DESC, p.bought DESC -- Order by most viewed, then most bought
    LIMIT $2
    OFFSET $3;
  `;

  const result = await pool.query(query, [storeId, limit, offset]);
  return result.rows;
};

export const getStoreProducts = async (
  storeId: number,
  limit: number = 20, 
  offset: number = 0
): Promise<ProductCard[]> => {
  const query = `
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
    WHERE 
        p.is_active = true 
        AND p.is_published = true
        AND p.store_id = $1
    ORDER BY
        p.bought DESC, p.created_at DESC -- Order by most popular, then newest
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

