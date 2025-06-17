import express from "express";
import { registerStore, getStoreById, updateStore, deleteStore } from "../controllers/storeController";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = express.Router();

router.post('/', authenticateToken, registerStore);
router.get('/:id', getStoreById);
router.put('/:id', updateStore);
router.delete('/:id', deleteStore);

export default router;