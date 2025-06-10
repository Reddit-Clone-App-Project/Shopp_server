import express from 'express';
import { registerShipper, getProfileShipper, updateProfileShipper, deleteProfileShipper, loginShipper, logoutShipper } from '../controllers/shipperController';
import { authenticateToken } from '../middlewares/authenticateToken';
const router = express.Router();

router.post('/register', registerShipper);
router.post('/login', loginShipper);
router.get('/logout', logoutShipper);
router.get('/profile/:id', authenticateToken, getProfileShipper);
router.put('/profile/:id', authenticateToken, updateProfileShipper);
router.delete('/profile/:id', authenticateToken, deleteProfileShipper);
export default router;