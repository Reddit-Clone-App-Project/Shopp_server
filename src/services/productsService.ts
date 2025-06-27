import pool from "../config/db";
import { CompleteProduct, Product, ProductImage, ProductVariant, UpdateProduct, UpdateProductImage, UpdateProductVariant, NewProduct } from "../types/product";

export const getProductProfile = async (productId: number): Promise<CompleteProduct | undefined> => {
        const productResult = await pool.query(
            'SELECT id, name, image_id, description, store_id, category_id FROM product WHERE id = $1',
            [productId]
        );
        const variantResult = await pool.query(
            'SELECT color, variant, price, stock_quantity, weight, dimension, is_available, sku FROM product_variant WHERE product_id = $1',
            [productId]
        );
        return {
            ...productResult.rows[0],
            variant: variantResult.rows[0], 
        };
};

export const createProduct = async (product: NewProduct): Promise<Product> => {
    const result = await pool.query(
        'INSERT INTO product (name, image_id, description, store_id, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, image_id, description, store_id, category_id',
        [product.name, product.image_id, product.description, product.store_id, product.category_id]
    );
    return result.rows[0];
}

export const updateProduct = async (productId: number, product: UpdateProduct) => {
    const result = await pool.query(
        'UPDATE product SET name = $1, image_id = $2, description = $3, is_active = $4 WHERE id = $5 RETURNING id, name, image_id, description, is_active',
        [product.name, product.image_id, product.description, product.is_active, productId]
    );
    return result.rows[0];
};

export const createProductVariant = async (variant: ProductVariant) => {
    const result = await pool.query(
        'INSERT INTO product_variant (product_id, color, variant, price, stock_quantity, weight, dimension, is_available, sku) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [variant.product_id, variant.color, variant.variant, variant.price, variant.stock_quantity, variant.weight, variant.dimension, variant.is_available, variant.sku]
    );
    return result.rows[0].id;
};

export const updateProductVariant = async (variantId: number, variant: UpdateProductVariant) => {
    const result = await pool.query(
        'UPDATE product_variant SET color = $1, variant = $2, price = $3, stock_quantity = $4, weight = $5, dimension = $6, is_available = $7 WHERE id = $8 RETURNING id',
        [variant.color, variant.variant, variant.price, variant.stock_quantity, variant.weight, variant.dimension, variant.is_available, variantId]
    );
    return result.rows[0].id;
};

export const createProductImage = async (image: ProductImage) => {
    const result = await pool.query(
        'INSERT INTO product_image (product_id, variant_id, url, alt_text, position) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [image.product_id, image.variant_id, image.url, image.alt_text, image.position]
    );
    return result.rows[0].id;
};

export const updateProductImage = async (imageId: number, image: UpdateProductImage) => {
    const result = await pool.query(
        'UPDATE product_image SET url = $1, alt_text = $2, position = $3 WHERE id = $4 RETURNING id',
        [image.url, image.alt_text, image.position, imageId]
    );
    return result.rows[0].id;
};