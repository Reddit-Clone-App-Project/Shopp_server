import express from 'express';
import { registerUser, getProfile, updateProfile, deleteProfile, loginUser, logoutUser, getAddressById } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', authenticateToken, getProfile);
router.put('/me', authenticateToken, updateProfile);
router.delete('/me', authenticateToken, deleteProfile);

/*
    Address
*/
router.get('/me/address', authenticateToken, getAddressById);


export default router;