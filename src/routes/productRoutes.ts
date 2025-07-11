import express from "express";
// import { addVariant, addVariantImage, createAProduct, deleteImage, deleteProductProfile, deleteVariantProfile, getHot, getProductById, updateAProduct, updateVariant, updateVariantImage } from "../controllers/productsController";
import { getHot, getProductById } from "../controllers/productsController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorizeRole } from "../middlewares/authorizationRole";

const router = express.Router();

router.get('/hot', getHot);
router.get('/:id', getProductById);
/*
router.post('/create', authenticateToken, authorizeRole(['seller', 'admin']), createAProduct);
router.put('/:id', authenticateToken, authorizeRole(['seller', 'admin']), updateAProduct);
router.post('/variant', authenticateToken, authorizeRole(['seller', 'admin']), addVariant);
router.put('/variant/:id', authenticateToken, authorizeRole(['seller', 'admin']), updateVariant);
router.post('/variant/image', authenticateToken, authorizeRole(['seller', 'admin']), addVariantImage);
router.put('/variant/image/:id', authenticateToken, authorizeRole(['seller', 'admin']), updateVariantImage);
router.delete('/:id', authenticateToken, authorizeRole(['seller', 'admin']), deleteProductProfile);
router.delete('/variant/:id', authenticateToken, authorizeRole(['seller', 'admin']), deleteVariantProfile);
router.delete('/variant/image/:id', authenticateToken, authorizeRole(['seller', 'admin']), deleteImage);
*/
export default router;