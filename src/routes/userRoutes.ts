import express from 'express';
import { registerUser, getProfile, updateProfile, deleteProfile, loginUser, logoutUser } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', authenticateToken, getProfile);
router.put('/me', authenticateToken, updateProfile);
router.delete('/me', authenticateToken, deleteProfile);

export default router;