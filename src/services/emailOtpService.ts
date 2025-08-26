import pool from '../config/db';
import { sendEmail } from './emailService';

const generateNumericOtp = (length: number = 6): string => {
    return Math.random().toString().slice(2, 2 + length).padEnd(length, '0');
};

export const sendOtpByEmail = async (userId: number, userEmail: string) => {
    const otp = generateNumericOtp();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // OTP is valid for 10 minutes

    await pool.query(
        'UPDATE app_user SET otp = $1, otp_expires_at = $2 WHERE id = $3',
        [otp, expirationTime, userId]
    );

    const emailHtml = `
        <h1>Your One-Time Password</h1>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
    `;

    await sendEmail(userEmail, 'Your OTP for Shopp', emailHtml);
};

export const verifyEmailOtp = async (userId: number, otp: string): Promise<boolean> => {
    const result = await pool.query(
        'SELECT otp, otp_expires_at FROM app_user WHERE id = $1',
        [userId]
    );

    const user = result.rows[0];

    if (!user || user.otp !== otp || new Date() > user.otp_expires_at) {
        return false;
    }

    // Clear the OTP after successful verification
    await pool.query(
        'UPDATE app_user SET otp = NULL, otp_expires_at = NULL WHERE id = $1',
        [userId]
    );

    return true;
};