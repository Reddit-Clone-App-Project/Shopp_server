import express from 'express';
import { fetchUsers, registerAdmin, getProfileAdmin, updateProfileAdmin, deleteProfileAdmin, loginAdmin, logoutAdmin } from '../controllers/adminController';
import { getAllStores } from '../controllers/storeController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/profile/me', authenticateToken, getProfileAdmin);
router.put('/profile/me', authenticateToken, updateProfileAdmin);
router.delete('/profile/me', authenticateToken, deleteProfileAdmin);
router.get('/users', authenticateToken, fetchUsers);
router.get('/stores', authenticateToken, getAllStores);



export default router;