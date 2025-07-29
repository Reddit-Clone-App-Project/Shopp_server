import express from "express";
import { registerStore, getStoreById, updateStore, deleteStore, getStoreHotProducts, getStoreDiscounts, getStoreProductsBought, getStoreByOwnerId } from "../controllers/storeController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.post('/', authLimiter, authenticateToken, registerStore);
router.get('/:id', getStoreById);
router.get('/my-store', authenticateToken, getStoreByOwnerId)
router.put('/:id', authenticateToken, updateStore);
router.delete('/:id', authenticateToken, deleteStore);

// Store products
router.get('/:id/products', getStoreProductsBought);
router.get('/:id/products/hot', getStoreHotProducts);

// Discount routes
router.get('/:id/discounts', getStoreDiscounts);

export default router;