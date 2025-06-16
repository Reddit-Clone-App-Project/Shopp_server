import pool from "../config/db";
import { Store, StoreAddress, StoreOwner, StoreInfo, RatingStats, Review } from "../types/store";

export const createAddress = async (address: StoreAddress) => {
    const result = await pool.query(
        'INSERT INTO address (full_name, phone_number, country, province, city, postal_code, address_line1, address_line2) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [address.full_name, address.phone_number, address.country, address.province, address.city, address.postal_code, address.address_line1, address.address_line2]
    );
    return result.rows[0].id;
};

export const createStore = async (store: Store) => {
    const result = await pool.query(
        'INSERT INTO store (name, address_id, email, phone_number) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone_number',
        [store.name, store.address_id, store.email, store.phone_number]
    );
    return result.rows[0];
};

export const createOwner = async (owner: StoreOwner ) => {
    const result = await pool.query(
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
        'SELECT id, name, address_id, profile_img, phone_number, email FROM store WHERE id = $1',
        [storeId]
    );
    return result.rows[0];
};  

export const getStoreAddressById = async (addressId: number): Promise<StoreAddress | undefined> => {
    const result = await pool.query(
        'SELECT full_name, phone_number, country, province, city, postal_code, address_line1, address_line2 WHERE id = $1',
        [addressId]
    );
    return result.rows[0];
};

export const getRatingStats = async (storeId: number): Promise<RatingStats | undefined> => {
    const result = await pool.query(
        'SELECT AVG(rating) AS average_rating, COUNT(*) AS total_reviews FROM review WHERE store_id = $1',
        [storeId]
    );
    return {
        average_rating: Number(result.rows[0].average_rating) || 0,
        total_reviews: Number(result.rows[0].total_reviews) || 0,
    };
};

export const getRecentReviews = async (storeId: number, limit: number): Promise<Review[] | undefined> => {
    const result = await pool.query(
        `SELECT r.id, r.user_id, r.rating, r.comment, u.fullname
            FROM review r
            JOIN app_user u ON r.user_id = u.id
            WHERE r.store_id = $1
            ORDER BY r.created_at DESC
            LIMIT $2`,
    [storeId, limit]
    );
    return result.rows;
}