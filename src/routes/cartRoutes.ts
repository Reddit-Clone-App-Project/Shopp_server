import express from 'express';
import { getCart, addItem, removeItem } from '../controllers/cartController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCart);
router.post('/', addItem);
router.delete('/', removeItem);

export default router;
