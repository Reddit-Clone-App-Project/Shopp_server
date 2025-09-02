import express from 'express';
import { addToAWishlist, createAWishlist, deleteAWishlist, deleteFromAWishlist, getWishlist, getWishlistDetail } from '../controllers/wishlistController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.get('/', authenticateToken, getWishlist);
router.get('/:id', authenticateToken, getWishlistDetail);
router.post('/', authenticateToken, createAWishlist);
router.delete('/:id', authenticateToken, deleteAWishlist);
router.post('/:id/products', authenticateToken, addToAWishlist);
router.delete('/:id/products', authenticateToken, deleteFromAWishlist);

export default router;