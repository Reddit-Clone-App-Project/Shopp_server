import express from 'express';
import { registerUser, getProfile, updateProfile, deleteProfile, loginUser, logoutUser } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/:id', authenticateToken, getProfile);
router.put('/:id', authenticateToken, updateProfile);
router.delete('/:id', authenticateToken, deleteProfile);

export default router;