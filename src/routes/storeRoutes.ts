import express from "express";
import { registerStore } from "../controllers/storeController";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = express.Router();

router.post('/', authenticateToken, registerStore);
/*router.get('/', getAllStores);
router.get('/:id', getStore);
router.put('/:id', updateStore);
router.delete('/:id', deleteStore);*/

export default router;