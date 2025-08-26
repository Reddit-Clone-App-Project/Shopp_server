import express from 'express';
import { registerShipper, getProfileShipper, updateProfileShipper, deleteProfileShipper, loginShipper, logoutShipper } from '../controllers/shipperController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateRegister } from '../middlewares/validator';

const router = express.Router();

router.post('/register', validateRegister, authLimiter, registerShipper);
router.post('/login', authLimiter, loginShipper);
router.post('/logout', logoutShipper);
router.get('/profile/me', authenticateToken, getProfileShipper);
router.put('/profile/me', authenticateToken, updateProfileShipper);
router.delete('/profile/me', authenticateToken, deleteProfileShipper);
export default router;