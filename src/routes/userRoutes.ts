import express from 'express';
import { fetchUsers } from '../controllers/userController';
import { registerUser } from '../controllers/userController';

const router = express.Router();

router.get('/', fetchUsers);
router.post('/register', registerUser);

export default router;