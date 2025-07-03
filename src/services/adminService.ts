import pool from "../config/db";
import { NewAdmin, Admin, UpdateAdmin } from "../types/admin";

export const getAllUsers = async () => {
    const result = await pool.query('SELECT * FROM app_user');
    return result.rows;
};

export const createAdmin = async (admin: NewAdmin) => {
    const result = await pool.query(
        'INSERT INTO admin (full_name, email, password, date_of_birth, emp_role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, date_of_birth, emp_role',
        [admin.fullname, admin.email, admin.password, admin.birthdate, admin.role]
    );
    return result.rows[0];
};

export const getAdminById = async (adminId: number): Promise<Admin | undefined> => {
    const result = await pool.query(
        'SELECT * FROM admin WHERE id = $1',
        [adminId]
    );
    return result.rows[0];
};

export const updateAdminById = async (admin: UpdateAdmin): Promise<UpdateAdmin | undefined>  => {
    const result = await pool.query(
        'UPDATE admin SET full_name = $1, date_of_birth = $2, employee_img = $3, updated_at = NOW() WHERE id = $4 RETURNING id, full_name, date_of_birth, employee_img',
        [admin.fullname, admin.birthdate, admin.avatarImg, admin.adminId]
    );
    return result.rows[0];
};


export const deleteAdminById = async (adminId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM admin WHERE id = $1',
        [adminId]
    );
    return result.rowCount;
};