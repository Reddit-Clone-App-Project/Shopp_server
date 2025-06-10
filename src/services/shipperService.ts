import pool from "../config/db";
import { NewShipper, Shipper, UpdateShipper } from "../types/admin";

export const createShipper = async (shipper: NewShipper) => {
    const result = await pool.query(
        'INSERT INTO shipper (full_name, email, password, date_of_birth, shipping_unit, storage_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, date_of_birth, shipping_unit, storage_id',
        [shipper.fullname, shipper.email, shipper.password, shipper.birthdate, shipper.shipping_unit, shipper.storage_id]
    );
    return result.rows[0];
};

export const getShipperById = async (shipperId: number): Promise<Shipper | undefined> => {
    const result = await pool.query(
        'SELECT * FROM shipper WHERE id = $1',
        [shipperId]
    );
    return result.rows[0];
};

export const updateShipperById = async (shipper: UpdateShipper): Promise<UpdateShipper | undefined>  => {
    const result = await pool.query(
        'UPDATE shipper SET full_name = $1, date_of_birth = $2, employee_img = $3, updated_at = NOW() WHERE id = $4 RETURNING id, full_name, date_of_birth, employee_img',
        [shipper.fullname, shipper.birthdate, shipper.avatarImg, shipper.shipperId]
    );
    return result.rows[0];
};


export const deleteShipperById = async (shipperId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM shipper WHERE id = $1',
        [shipperId]
    );
    return result.rowCount;
};