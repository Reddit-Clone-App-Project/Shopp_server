import express from 'express';
import { getOrderByStoreId, getOrderDetailByOrderId, getOrdersByUserId, removeOrderById, updateShippingUnitByOrderId } from '../controllers/orderController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authorizeRole } from '../middlewares/authorizationRole';

const router = express.Router();

router.get('/', authenticateToken, getOrdersByUserId);
router.get('/:storeId/all', authenticateToken, authorizeRole(['seller']), getOrderByStoreId);
router.get('/:id', authenticateToken, getOrderDetailByOrderId);

router.put('/:id/:storeId/shipping-unit', authenticateToken, authorizeRole(['seller']), updateShippingUnitByOrderId);

router.delete('/:id', authenticateToken, removeOrderById);

export default router;