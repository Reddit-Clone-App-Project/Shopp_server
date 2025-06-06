import express from 'express';
import { fetchUsers, registerUser, getProfile, updateProfile, deleteProfile } from '../controllers/userController';

const router = express.Router();

router.get('/', fetchUsers);
router.post('/register', registerUser);
router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile)

export default router;