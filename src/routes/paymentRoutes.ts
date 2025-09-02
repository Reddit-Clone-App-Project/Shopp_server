import express from 'express';
import { authenticateToken } from '../middlewares/authenticateToken';
import { createCheckoutSession, createSingleProductCheckout } from '../controllers/paymentController';

const router = express.Router();

router.post('/create-checkout-session', authenticateToken, createCheckoutSession);
router.post('/create-checkout-session/single-item', authenticateToken, createSingleProductCheckout);

export default router;