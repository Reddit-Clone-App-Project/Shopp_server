import pool from '../config/db';
import { OrderItem } from '../types/order';

export const createOrderItem = async (orderItem: OrderItem) => {
    const { order_id, product_variant_id, quantity, price_at_purchase } = orderItem;
    const result = await pool.query(
        'INSERT INTO order_item (order_table_id, product_variant_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4) RETURNING *',
        [order_id, product_variant_id, quantity, price_at_purchase]
    );
    return result.rows[0];
};
