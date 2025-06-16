import pool from "../config/db";
import { Store, StoreAddress, StoreOwner } from "../types/store";

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