import pool from '../config/db';

export const createPayment = async (userId: number, total: number) => {
    const result = await pool.query(
        'INSERT INTO payment (app_user_id, total) VALUES ($1, $2) RETURNING *',
        [userId, total]
    );
    return result.rows[0];
};

export const updatePaymentTransactionId = async (paymentId: number, transactionId: string) => {
    const result = await pool.query(
        'UPDATE payment SET transaction_id = $1 WHERE id = $2 RETURNING *',
        [transactionId, paymentId]
    );
    return result.rows[0];
};

export const deletePayment = async (paymentId: number) => {
    const result = await pool.query(
        'DELETE FROM payment WHERE id = $1 RETURNING *',
        [paymentId]
    );
    return result.rows[0];
};
