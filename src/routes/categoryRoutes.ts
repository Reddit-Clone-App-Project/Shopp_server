import express from 'express';
import { getActiveCategories } from '../controllers/categoryController';

const router = express.Router();

router.get('/active', getActiveCategories);

export default router;