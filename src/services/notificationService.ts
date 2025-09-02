import pool from "../config/db";
import type { Notification } from '../types/notification';

export const createNotification = async (notificationData: Notification) => {
    const result = await pool.query(
        'INSERT INTO notification (app_user_id, title, content, type) VALUES ($1, $2, $3, $4) RETURNING *',
        [notificationData.user_id, notificationData.title, notificationData.content, notificationData.type]
    );
    return result.rows[0];
};

export const getNotificationsByUserId = async (userId: number) => {
    const result = await pool.query(
        'SELECT * FROM notification WHERE app_user_id = $1',
        [userId]
    );
    return result.rows;
};

export const markNotificationAsRead = async (notificationId: number) => {
    const result = await pool.query(
        'UPDATE notification SET is_read = $1 WHERE id = $2 RETURNING *',
        [true, notificationId]
    );
    return result.rows[0];
};

export const markAllNotificationsAsRead = async (userId: number) => {
    const result = await pool.query(
        'UPDATE notification SET is_read = $1 WHERE app_user_id = $2 RETURNING *',
        [true, userId]
    );
    return result.rows;
};

export const deleteNotification = async (notificationId: number) => {
    const result = await pool.query(
        'DELETE FROM notification WHERE id = $1 RETURNING *',
        [notificationId]
    );
    return result.rows[0];
};
