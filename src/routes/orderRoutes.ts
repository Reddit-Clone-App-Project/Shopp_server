import express from 'express';
import { getOrderDetailByOrderId, getOrdersByUserId } from '../controllers/orderController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.get('/', authenticateToken, getOrdersByUserId);
router.get('/:id', authenticateToken, getOrderDetailByOrderId);

export default router;