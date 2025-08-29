import pool from "../config/db";
import { NewOrder } from "../types/order";

export const createOrder = async (order: NewOrder) => {
    const result = await pool.query(
        'INSERT INTO order_table (app_user_id, address_id, status, payment_id, total_without_shipping, store_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [order.app_user_id, order.address_id, order.status, order.payment_id, order.total_without_shipping, order.store_id]
    );
    return result.rows[0];
};

export const getOrderById = async (orderId: number) => {
    const result = await pool.query(
        'SELECT * FROM order_table WHERE id = $1',
        [orderId]
    );
    return result.rows[0];
};

export const getAllOrdersByStoreId = async (storeId: number) => {
    const result = await pool.query(
        'SELECT * FROM order_table WHERE store_id = $1',
        [storeId]
    );
    return result.rows;
};

export const updateOrderStatusByPaymentId = async (paymentId: number, status: NewOrder['status']) => {
    const result = await pool.query(
        'UPDATE order_table SET status = $1 WHERE payment_id = $2 RETURNING *',
        [status, paymentId]
    );
    return result.rows;
}

export const updateOrderStatus = async (orderId: number, newStatus: NewOrder['status']) => {
    const result = await pool.query(
        'UPDATE order_table SET status = $1 WHERE id = $2 RETURNING *',
        [newStatus, orderId]
    );
    return result.rows[0];
};

export const deleteOrder = async (orderId: number) => {
    const result = await pool.query(
        'DELETE FROM order_table WHERE id = $1 RETURNING *',
        [orderId]
    );
    return result.rows[0];
};
