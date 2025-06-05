import express from 'express';
import { fetchUsers, registerUser, getProfile } from '../controllers/userController';

const router = express.Router();

router.get('/', fetchUsers);
router.post('/register', registerUser);
router.get('/:id', getProfile);

export default router;