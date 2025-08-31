import express from 'express';
import { getOrderDetailByOrderId, getOrdersByUserId, removeOrderById } from '../controllers/orderController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.get('/', authenticateToken, getOrdersByUserId);
router.get('/:id', authenticateToken, getOrderDetailByOrderId);
router.delete('/:id', authenticateToken, removeOrderById);

export default router;