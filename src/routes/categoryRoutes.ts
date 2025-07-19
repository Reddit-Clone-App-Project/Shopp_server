import express from "express";
import {
  createCategory,
  deleteACategory,
  getActiveCategories,
  getCategories,
  getProductsByCategory,
  updateACategory,
} from "../controllers/categoryController";
import { authorizeRole } from "../middlewares/authorizationRole";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = express.Router();

router.get("/active", getActiveCategories);
// Get products by category with optional filtering and sorting
// Query params: limit, offset, sortBy, minPrice, maxPrice, rating
// sortBy options: 'Most Popular' (default), 'Newest', 'Most Bought', 'Price: Low to High', 'Price: High to Low'
router.get("/products/:categoryId", getProductsByCategory);

// Admin routes
router.post("/", authenticateToken, authorizeRole(["admin"]), createCategory);
router.get("/", authenticateToken, authorizeRole(["admin"]), getCategories);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  updateACategory
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  deleteACategory
);

export default router;
