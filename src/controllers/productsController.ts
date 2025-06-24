import { Request, Response } from "express";
import pool from "../config/db";
import { Product, ProductImage, ProductVariant, UpdateProduct, UpdateProductImage, UpdateProductVariant } from "../types/product";
import { createProduct, updateProduct, createProductVariant, updateProductVariant, createProductImage, updateProductImage } from "../services/productsService";

export const createAProduct = async (req: Request, res: Response) => {
    const { name, image_id, description, store_id, category_id } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

    } catch (error) {
        await client.query('ROLLBACK');
    } finally {
        client.release();
    }
    
}