import express from 'express';
import { authenticateToken } from '../middlewares/authenticateToken';
import { createANotification, deleteAUserNotification, getUserNotifications, markAllUserNotificationAsRead, markAUserNotificationAsRead } from '../controllers/notificationController';

const router = express.Router();

router.get('/', authenticateToken, getUserNotifications);
router.put('/mark-all-as-read', authenticateToken, markAllUserNotificationAsRead);
router.put('/:id/mark-as-read', authenticateToken, markAUserNotificationAsRead);
router.delete('/:id', authenticateToken, deleteAUserNotification);

export default router;