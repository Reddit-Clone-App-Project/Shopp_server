import pool from '../config/db';
import { Shipping } from '../types/shipping';

export const createShipping = async (shipping: Shipping) => {
    const result = await pool.query(
        'INSERT INTO shipping (price, shipping_days, shipping_type, order_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [shipping.price, shipping.shipping_days, shipping.shipping_type, shipping.order_id]
    );
    return result.rows[0];
};

export const deleteShippingByOrderId = async (orderId: number) => {
    const result = await pool.query(
        'DELETE FROM shipping WHERE order_id = $1 RETURNING *',
        [orderId]
    );
    return result.rows[0];
};
