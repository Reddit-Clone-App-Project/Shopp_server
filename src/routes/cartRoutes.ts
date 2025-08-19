import express from 'express';
import { getCart, addItem, removeItem, updateItemQuantity, removeAllItems } from '../controllers/cartController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCart);
router.post('/', addItem);
router.delete('/', removeItem);
router.delete('/all', removeAllItems);
router.put('/', updateItemQuantity);

export default router;
