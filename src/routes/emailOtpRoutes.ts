import express from 'express';
import { requestEmailOtp, verifyUserWithOtp } from '../controllers/emailOtpController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.post('/request-otp', authenticateToken, requestEmailOtp);
router.post('/verify-otp', authenticateToken, verifyUserWithOtp);

export default router;
