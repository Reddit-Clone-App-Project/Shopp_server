import express from "express";
import { registerStore, getStoreById, updateStore, deleteStore, getStoreHotProducts, getStoreDiscounts, getStoreProductsBought, getStoreByOwnerId, getStoreProductsById, getStoresByUserId } from "../controllers/storeController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.post('/', authLimiter, authenticateToken, registerStore);
//! Seller routes
router.get('/my-store', authenticateToken, getStoreByOwnerId);
router.get('/involved-stores', authenticateToken, getStoresByUserId);

//! Buyer routes
router.get('/:id', getStoreById);
router.put('/:id', authenticateToken, updateStore);
router.delete('/:id', authenticateToken, deleteStore);

// Store products
router.get('/:id/products', getStoreProductsBought);
router.get('/:id/products/hot', getStoreHotProducts);
router.get('/:id/products/all', authenticateToken, getStoreProductsById);

// Discount routes
router.get('/:id/discounts', getStoreDiscounts);


export default router;