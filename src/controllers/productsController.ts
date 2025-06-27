import { Request, Response } from "express";
import pool from "../config/db";
import { CompleteProduct, Product, ProductImage, ProductVariant, UpdateProduct, UpdateProductImage, UpdateProductVariant } from "../types/product";
import { getProductProfile, createProduct, updateProduct, createProductVariant, updateProductVariant, createProductImage, updateProductImage } from "../services/productsService";

export const getProductById = async (req: Request, res: Response) => {
    const productId = Number(req.params.id);

    try {
        const product: CompleteProduct | undefined = await getProductProfile(productId);
        if (!product) {
            res.status(404).json({ error: 'Product not found!' });
            return;
        };

        res.status(200).json(product);

    } catch (err) {
        console.log('Error cannot get product profile', err);
        res.status(500).json({ error: 'Error cannot get product profile' });
    };
};

export const createAProduct = async (req: Request, res: Response) => {
    const { name, image_id, description, store_id, category_id } = req.body;

    try {
        const newProduct: Product = await createProduct({name, image_id, description, store_id, category_id});
        res.status(201).json(newProduct);

    } catch (err) {
        console.error('Error in the creation of the store:', err);
        res.status(500).json({error: 'Error in the creation of the store'});
    };
};

export const AddVariant = async (res: Response, req: Request) => {

};