import express from "express";
import { createAProduct, getProductById } from "../controllers/productsController";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = express.Router();

router.get('/:id', getProductById);
router.post('/create', authenticateToken, createAProduct);
router.put('/:id', authenticateToken, );
router.delete('/:id', authenticateToken, );

export default router;