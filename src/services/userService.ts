// !This file is an example and may not be functional without the rest of the application context.
import pool from '../config/db';

export const getAllUsers = async () => {
    const result = await pool.query('SELECT * FROM app_user');
    return result.rows;
};

type UserRole = "buyer" | "seller" | "admin";

type NewUser = {
  fullname: string;
  email: string;
  password: string;
  role: UserRole;
  birthdate: string;
};

export const createUser = async (user: NewUser) => {
    const result = await pool.query(
        'INSERT INTO app_user (full_name, email, password, role, date_of_birth) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role',
        [user.fullname, user.email, user.password, user.role, user.birthdate]
    );
    return result.rows[0];
};