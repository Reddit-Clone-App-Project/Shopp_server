import pool from "../config/db";

export const getAllUsers = async () => {
    const result = await pool.query('SELECT * FROM app_user');
    return result.rows;
};