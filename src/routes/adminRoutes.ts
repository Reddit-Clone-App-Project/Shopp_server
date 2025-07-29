import express from 'express';
import { fetchUsers, registerAdmin, getProfileAdmin, updateProfileAdmin, deleteProfileAdmin, loginAdmin, logoutAdmin } from '../controllers/adminController';
import { getAllStores } from '../controllers/storeController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authorizeRole } from '../middlewares/authorizationRole';
import { authLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/register', authLimiter, registerAdmin);
router.post('/login', authLimiter, loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/profile/me', authenticateToken, authorizeRole(['admin']), getProfileAdmin);
router.put('/profile/me', authenticateToken, authorizeRole(['admin']), updateProfileAdmin);
router.delete('/profile/me', authenticateToken, authorizeRole(['admin']), deleteProfileAdmin);
router.get('/users', authenticateToken, authorizeRole(['admin']), fetchUsers);
router.get('/stores', authenticateToken, authorizeRole(['admin']), getAllStores);



export default router;