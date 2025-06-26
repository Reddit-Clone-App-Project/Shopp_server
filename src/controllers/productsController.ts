import { Request, Response } from "express";
import pool from "../config/db";
import { CompleteProduct, Product, ProductImage, ProductVariant, UpdateProduct, UpdateProductImage, UpdateProductVariant } from "../types/product";
import { getProductProfile, createProduct, updateProduct, createProductVariant, updateProductVariant, createProductImage, updateProductImage } from "../services/productsService";

export const getProductById = async (req: Request, res: Response) => {
    const productId = Number(req.params.id);

    try {
        const product: CompleteProduct | undefined = await getProductProfile(productId);
        if (product === undefined) {
            res.status(404).json({error: 'Product not found!'})
        };
    } catch (err) {

    };
};

export const createAProduct = async (req: Request, res: Response) => {
    const { name, image_id, description, store_id, category_id } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

    } catch (error) {
        await client.query('ROLLBACK');
    } finally {
        client.release();
    };
    
};