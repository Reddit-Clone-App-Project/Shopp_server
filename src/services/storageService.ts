import pool from "../config/db";
import { NewStorage, Storage, UpdateStorage } from "../types/admin";

export const createStorage = async (storage: NewStorage) => {
    const result = await pool.query(
        'INSERT INTO storage (email, password, shipping_unit, location) VALUES ($1, $2, $3, $4) RETURNING id, email, shipping_unit, location',
        [storage.email, storage.password, storage.shipping_unit, storage.location]
    );
    return result.rows[0];
};

export const getStorageById = async (storageId: number): Promise<Storage | undefined> => {
    const result = await pool.query(
        'SELECT * FROM storage WHERE id = $1',
        [storageId]
    );
    return result.rows[0];
};


export const updateStorageById = async (storage: UpdateStorage): Promise<UpdateStorage | undefined>  => {
    const result = await pool.query(
        'UPDATE storage SET email = $1, location = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, location',
        [storage.email, storage.location, storage.storageId]
    );
    return result.rows[0];
};


export const deleteStorageById = async (storageId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM storage WHERE id = $1',
        [storageId]
    );
    return result.rowCount;
};