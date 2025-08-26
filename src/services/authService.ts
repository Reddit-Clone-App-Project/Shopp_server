import pool from '../config/db';
import validator from 'validator';

// User
export const validationUser = async (eOrP: string): Promise<{id: number, databasePassword: string, role: string} | undefined> => {
    let result: any;
    if (validator.isEmail(eOrP)) {
        result = await pool.query(
            'SELECT id, password, role FROM app_user WHERE email = $1',
            [eOrP]
        );
    } else if (validator.isMobilePhone(eOrP.replace(/[\s-()]/g, ''), 'any', { strictMode: false })) {
        result = await pool.query(
            'SELECT id, password, role FROM app_user WHERE phone_number = $1',
            [eOrP]
        );
    }

    return {id: result.rows[0]?.id, databasePassword: result.rows[0]?.password, role: result.rows[0]?.role};
};

export const assignRefreshTokenToDB = async (id: number, refreshToken: string): Promise<void> => {
    await pool.query(
        'UPDATE app_user SET refresh_token = $1 WHERE id = $2',
        [refreshToken, id]
    );
};

export const getUserByRefreshToken = async (refresh_token: string): Promise<string | undefined> => {
    const result = await pool.query(
        'SELECT * FROM app_user WHERE refresh_token = $1',
        [refresh_token]
    );
    return result.rows[0];
};

export const removeRefreshTokenFromDB = async (refresh_token: string): Promise<void> => {
    await pool.query(
        'UPDATE app_user SET refresh_token = NULL WHERE refresh_token = $1',
        [refresh_token]
    );
};

// Admin
export const validationAdmin = async (email: string): Promise<{id: number, databasePassword: string} | undefined> => {
    const result = await pool.query(
        'SELECT id, password FROM admin WHERE email = $1',
        [email]
    );
    return {id: result.rows[0]?.id, databasePassword: result.rows[0]?.password};
};

export const assignRefreshTokenToDBAdmin = async (id: number, refreshToken: string): Promise<void> => {
    await pool.query(
        'UPDATE admin SET refresh_token = $1 WHERE id = $2',
        [refreshToken, id]
    );
};

export const getAdminByRefreshToken = async (refresh_token: string): Promise<string | undefined> => {
    const result = await pool.query(
        'SELECT * FROM admin WHERE refresh_token = $1',
        [refresh_token]
    );
    return result.rows[0];
};

export const removeRefreshTokenFromDBAdmin = async (refresh_token: string): Promise<void> => {
    await pool.query(
        'UPDATE admin SET refresh_token = NULL WHERE refresh_token = $1',
        [refresh_token]
    );
};

// Shipper
export const validationShipper = async (email: string): Promise<{id: number, databasePassword: string} | undefined> => {
    const result = await pool.query(
        'SELECT id, password FROM shipper WHERE email = $1',
        [email]
    );
    return {id: result.rows[0]?.id, databasePassword: result.rows[0]?.password};
};

export const assignRefreshTokenToDBShipper = async (id: number, refreshToken: string): Promise<void> => {
    await pool.query(
        'UPDATE shipper SET refresh_token = $1 WHERE id = $2',
        [refreshToken, id]
    );
};

export const getShipperByRefreshToken = async (refresh_token: string): Promise<string | undefined> => {
    const result = await pool.query(
        'SELECT * FROM shipper WHERE refresh_token = $1',
        [refresh_token]
    );
    return result.rows[0];
};

export const removeRefreshTokenFromDBShipper = async (refresh_token: string): Promise<void> => {
    await pool.query(
        'UPDATE shipper SET refresh_token = NULL WHERE refresh_token = $1',
        [refresh_token]
    );
};

// Storage
export const validationStorage = async (email: string): Promise<{id: number, databasePassword: string} | undefined> => {
    const result = await pool.query(
        'SELECT id, password FROM storage WHERE email = $1',
        [email]
    );
    return {id: result.rows[0]?.id, databasePassword: result.rows[0]?.password};
};

export const assignRefreshTokenToDBStorage = async (id: number, refreshToken: string): Promise<void> => {
    await pool.query(
        'UPDATE storage SET refresh_token = $1 WHERE id = $2',
        [refreshToken, id]
    );
};

export const getStorageByRefreshToken = async (refresh_token: string): Promise<string | undefined> => {
    const result = await pool.query(
        'SELECT * FROM storage WHERE refresh_token = $1',
        [refresh_token]
    );
    return result.rows[0];
};

export const removeRefreshTokenFromDBStorage = async (refresh_token: string): Promise<void> => {
    await pool.query(
        'UPDATE storage SET refresh_token = NULL WHERE refresh_token = $1',
        [refresh_token]
    );
};