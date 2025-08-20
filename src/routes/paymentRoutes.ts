import express from 'express';
import { authenticateToken } from '../middlewares/authenticateToken';
import { createCheckoutSession } from '../controllers/paymentController';

const router = express.Router();

router.post('/create-checkout-session', authenticateToken, createCheckoutSession);

export default router;