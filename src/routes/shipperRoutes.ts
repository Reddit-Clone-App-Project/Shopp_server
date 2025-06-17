import express from 'express';
import { registerShipper, getProfileShipper, updateProfileShipper, deleteProfileShipper, loginShipper, logoutShipper } from '../controllers/shipperController';
import { authenticateToken } from '../middlewares/authenticateToken';
const router = express.Router();

router.post('/register', registerShipper);
router.post('/login', loginShipper);
router.post('/logout', logoutShipper);
router.get('/profile/me', authenticateToken, getProfileShipper);
router.put('/profile/me', authenticateToken, updateProfileShipper);
router.delete('/profile/me', authenticateToken, deleteProfileShipper);
export default router;