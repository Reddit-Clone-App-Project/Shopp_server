import pool from '../config/db';
import { User, NewUser, UpdateUser } from '../types/users';

export const createUser = async (user: NewUser) => {
    const result = await pool.query(
        'INSERT INTO app_user (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
        [user.email, user.password, user.role]
    );
    return result.rows[0];
};

export const getUserById = async (userId: number): Promise<User | undefined> => {
    const result = await pool.query(
        'SELECT * FROM app_user WHERE id = $1',
        [userId]
    );
    return result.rows[0];
};

export const updateUserById = async (user: UpdateUser): Promise<UpdateUser | undefined>  => {
    const result = await pool.query(
        'UPDATE app_user SET full_name = $1, date_of_birth = $2, profile_img = $3, updated_at = NOW() WHERE id = $4 RETURNING id, full_name, date_of_birth, profile_img',
        [user.fullname, user.birthdate, user.avatarImg, user.userId]
    );
    return result.rows[0];
};


export const deleteUserById = async (userId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM app_user WHERE id = $1',
        [userId]
    );
    return result.rowCount;
};




