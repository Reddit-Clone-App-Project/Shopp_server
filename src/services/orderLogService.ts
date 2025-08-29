import pool from '../config/db';
import { OrderLog } from '../types/orderLog';

export const createOrderLog = async (orderLog: OrderLog) => {
    const result = await pool.query(
        'INSERT INTO order_log (order_id, storage_id, shipper_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [orderLog.order_id, orderLog.storage_id, orderLog.shipper_id, orderLog.status]
    );
    return result.rows[0];
};

