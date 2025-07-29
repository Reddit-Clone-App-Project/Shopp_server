import express from 'express';
import { registerStorage, getProfileStorage, updateProfileStorage, deleteProfileStorage, loginStorage, logoutStorage } from '../controllers/storageController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateRegister, validateLogin } from '../middlewares/validator';

const router = express.Router();

router.post('/register', validateRegister, authLimiter, registerStorage);
router.post('/login', validateLogin, authLimiter, loginStorage);
router.post('/logout', logoutStorage);
router.get('/profile/me', authenticateToken, getProfileStorage);
router.put('/profile/me', authenticateToken, updateProfileStorage);
router.delete('/profile/me', authenticateToken, deleteProfileStorage);
export default router;