import pool from "../config/db";
import { ActiveCategory, Category } from "../types/category";

// User
export const getAllActiveCategories = async (): Promise<ActiveCategory[]> => { 
    const result = await pool.query(
        'SELECT name, slug, description, image_url FROM category WHERE is_active = true'
    );
    return result.rows;
}

