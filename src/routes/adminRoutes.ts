import express from 'express';
import { fetchUsers, registerAdmin, getProfileAdmin, updateProfileAdmin, deleteProfileAdmin, loginAdmin, logoutAdmin } from '../controllers/adminController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/profile/:id', authenticateToken, getProfileAdmin);
router.put('/profile/:id', authenticateToken, updateProfileAdmin);
router.delete('/profile/:id', authenticateToken, deleteProfileAdmin);
router.get('/users', authenticateToken, fetchUsers);


export default router;