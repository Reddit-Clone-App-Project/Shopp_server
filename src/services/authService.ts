import pool from '../config/db';

// User
export const validationUser = async (email: string): Promise<string | undefined> => {
    const result = await pool.query(
        'SELECT password FROM app_user WHERE email = $1',
        [email]
    );
    return result.rows[0]?.password;
};

export const assignRefreshTokenToDB = async (email: string, refreshToken: string): Promise<void> => {
    await pool.query(
        'UPDATE app_user SET refresh_token = $1 WHERE email = $2',
        [refreshToken, email]
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
export const validationAdmin = async (email: string): Promise<string | undefined> => {
    const result = await pool.query(
        'SELECT password FROM admin WHERE email = $1',
        [email]
    );
    return result.rows[0]?.password;
};

export const assignRefreshTokenToDBAdmin = async (email: string, refreshToken: string): Promise<void> => {
    await pool.query(
        'UPDATE admin SET refresh_token = $1 WHERE email = $2',
        [refreshToken, email]
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
export const validationShipper = async (email: string): Promise<string | undefined> => {
    const result = await pool.query(
        'SELECT password FROM shipper WHERE email = $1',
        [email]
    );
    return result.rows[0]?.password;
};

export const assignRefreshTokenToDBShipper = async (email: string, refreshToken: string): Promise<void> => {
    await pool.query(
        'UPDATE shipper SET refresh_token = $1 WHERE email = $2',
        [refreshToken, email]
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
export const validationStorage = async (email: string): Promise<string | undefined> => {
    const result = await pool.query(
        'SELECT password FROM storage WHERE email = $1',
        [email]
    );
    return result.rows[0]?.password;
};

export const assignRefreshTokenToDBStorage = async (email: string, refreshToken: string): Promise<void> => {
    await pool.query(
        'UPDATE storage SET refresh_token = $1 WHERE email = $2',
        [refreshToken, email]
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