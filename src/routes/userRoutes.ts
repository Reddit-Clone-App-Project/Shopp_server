import express from 'express';
import { registerUser, getProfile, updateProfile, uploadAvatar, deleteProfile, loginUser, logoutUser, getAddressesById, addAddress, removeAnAddress, updateAddress, setAddressIsDefaultToTrue } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateRegister, validateLogin } from '../middlewares/validator';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/register', validateRegister, authLimiter, registerUser);
router.post('/login', validateLogin, authLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', authenticateToken, getProfile);
router.put('/me', authenticateToken, updateProfile);
router.post('/me/avatar', authenticateToken, upload.single('avatar'), uploadAvatar);
router.delete('/me', authenticateToken, deleteProfile);

/*
    Address
*/
router.get('/me/address', authenticateToken, getAddressesById);
router.post('/me/address', authenticateToken, addAddress);
router.put('/me/address/:id', authenticateToken, updateAddress);
router.put('/me/address/default/:id', authenticateToken, setAddressIsDefaultToTrue);
router.delete('/me/address/:id', authenticateToken, removeAnAddress);


export default router;