import express from 'express';
import { createCategory, deleteACategory, getActiveCategories, getCategories, getProductsByCategory, updateACategory } from '../controllers/categoryController';
import { authorizeRole } from '../middlewares/authorizationRole';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.get('/active', getActiveCategories);
router.get('/products/:categoryId', getProductsByCategory);

// Admin routes
router.post('/', authenticateToken, authorizeRole(['admin']), createCategory);
router.get('/', authenticateToken, authorizeRole(['admin']), getCategories);
router.put('/:id', authenticateToken, authorizeRole(['admin']), updateACategory); 
router.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteACategory);

export default router;