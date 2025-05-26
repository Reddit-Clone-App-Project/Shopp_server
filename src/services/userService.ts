// !This file is an example and may not be functional without the rest of the application context.
import pool from '../config/db';

export const getAllUsers = async () => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
}