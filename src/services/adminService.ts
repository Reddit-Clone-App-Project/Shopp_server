import pool from "../config/db";
import { } from "../types/admin";

export const getAllUsers = async () => {
    const result = await pool.query('SELECT * FROM app_user');
    return result.rows;
};