import express from 'express';
import { authenticateToken } from '../middlewares/authenticateToken';
import { getAllUserVoucher } from '../controllers/voucherController';

const router = express.Router();

router.get('/me/vouchers', authenticateToken, getAllUserVoucher);

export default router;