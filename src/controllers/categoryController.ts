import { Request, Response } from "express";
import { Category } from "../types/category";
import { getAllActiveCategories } from "../services/categoryService";

export const getActiveCategories = async (req: Request, res: Response) => {
    try {
        const categories = await getAllActiveCategories();
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

