import express from "express";
// import { addVariant, addVariantImage, createAProduct, deleteImage, deleteProductProfile, deleteVariantProfile, getHot, getProductById, updateAProduct, updateVariant, updateVariantImage } from "../controllers/productsController";
import { fetchSuggestions, createAProduct, getHot, getProductById, getProductReviews, getProductReviewsByStar, getProductReviewsHaveComment, getProductReviewsHaveImage, searchForProducts } from "../controllers/productsController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorizeRole } from "../middlewares/authorizationRole";

const router = express.Router();

// Search
router.get('/suggestions', fetchSuggestions);
router.get('/search', searchForProducts);


router.get('/hot', getHot);



router.get('/:id', getProductById);
router.post('/create', authenticateToken, authorizeRole(['seller', 'admin']), createAProduct);
/*
router.put('/:id', authenticateToken, authorizeRole(['seller', 'admin']), updateAProduct);
router.post('/variant', authenticateToken, authorizeRole(['seller', 'admin']), addVariant);
router.put('/variant/:id', authenticateToken, authorizeRole(['seller', 'admin']), updateVariant);
router.post('/variant/image', authenticateToken, authorizeRole(['seller', 'admin']), addVariantImage);
router.put('/variant/image/:id', authenticateToken, authorizeRole(['seller', 'admin']), updateVariantImage);
router.delete('/:id', authenticateToken, authorizeRole(['seller', 'admin']), deleteProductProfile);
router.delete('/variant/:id', authenticateToken, authorizeRole(['seller', 'admin']), deleteVariantProfile);
router.delete('/variant/image/:id', authenticateToken, authorizeRole(['seller', 'admin']), deleteImage);
*/

// !Review
router.get('/:id/reviews', getProductReviews);
router.get('/:id/reviews/rating/:rating', getProductReviewsByStar);
router.get('/:id/reviews/comment', getProductReviewsHaveComment);
router.get('/:id/reviews/image', getProductReviewsHaveImage);


export default router;