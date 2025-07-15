import { Request, Response } from "express";
import { Category, UpdateCategory } from "../types/category";
import {
  getAllActiveCategories,
  createACategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} from "../services/categoryService";
import { searchProductsByCategory } from "../services/categoryService";

import { Product } from "../types/product";

export const getActiveCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getAllActiveCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin
export const createCategory = async (req: Request, res: Response) => {
  try {
    const category: Category = req.body;

    // Validate the category data
    if (
      !category.name ||
      !category.slug ||
      !category.description ||
      !category.image_url
    ) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Create the category
    const newCategory = await createACategory(category);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateACategory = async (req: Request, res: Response) => {
  try {
    const category = req.body;
    // Validate the category data
    if (
      !req.params.id ||
      !category.name ||
      !category.slug ||
      !category.description ||
      !category.image_url
    ) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Update the category
    const updatedCategory = await updateCategory({id: parseInt(req.params.id), ...category});
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteACategory = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try{
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid category ID" });
            return;
        }

        const deletedCategory = await deleteCategory(id);
        if (!deletedCategory) {
            res.status(404).json({ error: "Category not found" })
            return;
        }

        res.status(200).json({ message: "Category deleted successfully", category: deletedCategory });
    }catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    const categoryId: number = Number(req.params.categoryId);
    const limit: number = Number(req.query.limit) || 20;
    const offset: number = Number(req.query.offset) || 0;

    if (isNaN(categoryId) || categoryId <= 0) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
    }

    try {
        const products: Product[] = await searchProductsByCategory(categoryId, limit, offset);
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products by category', err);
        res.status(500).json({ error: 'Error fetching products by category' });
    }
}