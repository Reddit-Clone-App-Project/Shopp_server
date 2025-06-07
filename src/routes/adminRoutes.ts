import express from 'express';
import { fetchUsers } from '../controllers/adminController';

const router = express.Router();

router.get('/users', fetchUsers);

export default router;