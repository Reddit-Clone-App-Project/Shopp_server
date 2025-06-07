import pool from '../config/db';

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
}