import pool from "../config/db";
import { ActiveCategory, Category, UpdateCategory } from "../types/category";

// User
export const getAllActiveCategories = async (): Promise<ActiveCategory[]> => { 
    const result = await pool.query(
        'SELECT id, name, slug, description, image_url FROM category WHERE is_active = true'
    );
    return result.rows;
}

// Admin
export const createACategory = async (category: Category): Promise<Category> => {
    const result = await pool.query(
        'INSERT INTO category (name, slug, parent_id, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [category.name, category.slug, category.parent_id, category.description, category.image_url]
    );
    return result.rows[0];
}

export const getAllCategories = async () => {
    const result = await pool.query(
        'SELECT * FROM category'
    );
    return result.rows;
}


export const updateCategory = async (category: UpdateCategory) => {
    const result = await pool.query(
        'UPDATE category SET name = $1, slug = $2, parent_id = $3, description = $4, image_url = $5, is_active = $6 WHERE id = $7 RETURNING *',
        [category.name, category.slug, category.parent_id, category.description, category.image_url, category.is_active, category.id]
    );
    return result.rows[0];
}

export const deleteCategory = async (id: number) => {
    const result = await pool.query(
        'DELETE FROM category WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
}