import express from 'express';
import { authenticateToken } from '../middlewares/authenticateToken';
import { fetchStoreConversations, fetchUserConversations, findOrCreateConversationController } from '../controllers/chatController';

const router = express.Router();

router.get('/', authenticateToken, fetchUserConversations);
router.get('/store', authenticateToken, fetchStoreConversations);
router.post('/find-or-create', authenticateToken, findOrCreateConversationController);

export default router;