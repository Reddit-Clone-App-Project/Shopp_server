import express from 'express';
import { getOrderByStoreId, getOrderDetailByOrderId, getOrdersByUserId, removeOrderById } from '../controllers/orderController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authorizeRole } from '../middlewares/authorizationRole';

const router = express.Router();

router.get('/', authenticateToken, getOrdersByUserId);
router.get('/all', authenticateToken, authorizeRole(['seller']), getOrderByStoreId);
router.get('/:id', authenticateToken, getOrderDetailByOrderId);
router.delete('/:id', authenticateToken, removeOrderById);

export default router;