import express from "express";
import { registerStore, getStoreById, updateStore, deleteStore, getStoreDiscounts } from "../controllers/storeController";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = express.Router();

router.post('/', authenticateToken, registerStore);
router.get('/:id', getStoreById);
router.put('/:id', authenticateToken, updateStore);
router.delete('/:id', authenticateToken, deleteStore);

// Discount routes
router.get('/:id/discounts', getStoreDiscounts);

export default router;