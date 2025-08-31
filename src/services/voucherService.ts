import pool from "../config/db";

export const getVoucherByUserId = async (userId: number, limit: number = 6, offset: number = 0) => {
    const result = await pool.query(
        'SELECT discount.id, discount.name, discount.discount_type, discount.discount_value, discount.start_at, discount.end_at, discount.status, discount.description, discount.discount_where, discount_user.quantity FROM discount JOIN discount_user ON discount.id = discount_user.discount_id WHERE discount_user.app_user_id = $1 LIMIT $2 OFFSET $3',
        [userId, limit, offset]
    )
    return result.rows;
}