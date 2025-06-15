import express from 'express';
import { registerStorage, getProfileStorage, updateProfileStorage, deleteProfileStorage, loginStorage, logoutStorage } from '../controllers/storageController';
import { authenticateToken } from '../middlewares/authenticateToken';
const router = express.Router();

router.post('/register', registerStorage);
router.post('/login', loginStorage);
router.post('/logout', logoutStorage);
router.get('/profile/:id', authenticateToken, getProfileStorage);
router.put('/profile/:id', authenticateToken, updateProfileStorage);
router.delete('/profile/:id', authenticateToken, deleteProfileStorage);
export default router;