import express from 'express';
import { fetchUsers, registerUser, getProfile, updateProfile, deleteProfile, loginUser } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.get('/', fetchUsers);
router.post('/register', registerUser);
router.get('/:id', authenticateToken, getProfile);
router.put('/:id', authenticateToken, updateProfile);
router.delete('/:id', authenticateToken, deleteProfile);
router.post('/login', loginUser);

export default router;