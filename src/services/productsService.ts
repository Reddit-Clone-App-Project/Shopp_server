import pool from "../config/db";
import { CompleteProduct, Product, VariantImage, ProductVariant, UpdateProduct, UpdateVariantImage, UpdateProductVariant, NewProduct, UpdatedProduct } from "../types/product";

export const getProductProfile = async (productId: number): Promise<CompleteProduct | undefined> => {
        const productResult = await pool.query(
            'SELECT id, name, image_id, description, store_id, category_id FROM product WHERE id = $1',
            [productId]
        );
        const variantResult = await pool.query(
            'SELECT color, variant, price, stock_quantity, weight, dimension, is_available, sku FROM product_variant WHERE product_id = $1',
            [productId]
        );

        if (productResult.rows.length === 0) return undefined;

        return {
            ...productResult.rows[0],
            variant: variantResult.rows[0] || null, 
        };
};

export const createProduct = async (product: NewProduct): Promise<Product> => {
    const result = await pool.query(
        'INSERT INTO product (name, image_id, description, store_id, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, image_id, description, store_id, category_id',
        [product.name, product.image_id, product.description, product.store_id, product.category_id]
    );
    return result.rows[0];
}

export const updateProduct = async (productId: number, product: UpdateProduct): Promise<UpdatedProduct> => {
    const result = await pool.query(
        'UPDATE product SET name = $1, image_id = $2, description = $3, is_active = $4 WHERE id = $5 RETURNING id, name, image_id, description, is_active',
        [product.name, product.image_id, product.description, product.is_active, productId]
    );
    return result.rows[0];
};

export const getStoreId = async (product_id: number): Promise<number> =>{
    const result = await pool.query(
        'SELECT store_id FROM product WHERE id = $1',
        [product_id]
    );

    if (result.rows.length === 0) {
        throw new Error("Product not found");
    };

    return result.rows[0].store_id;
};

export const getProductId = async (variant_id: number): Promise<number> =>{
    const result = await pool.query(
        'SELECT product_id FROM product_variant WHERE id = $1',
        [variant_id]
    );
    return result.rows[0].product_id;
};

export const createProductVariant = async (variant: ProductVariant) => {
    const result = await pool.query(
        'INSERT INTO product_variant (product_id, color, variant, price, stock_quantity, weight, dimension, is_active, sku) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [variant.product_id, variant.color, variant.variant, variant.price, variant.stock_quantity, variant.weight, variant.dimension, variant.is_active, variant.sku]
    );
    return result.rows[0].id;
};

export const updateProductVariant = async (variantId: number, variant: UpdateProductVariant): Promise<number> => {
    const result = await pool.query(
        'UPDATE product_variant SET color = $1, variant = $2, price = $3, stock_quantity = $4, weight = $5, dimension = $6, is_active = $7 WHERE id = $8 RETURNING id',
        [variant.color, variant.variant, variant.price, variant.stock_quantity, variant.weight, variant.dimension, variant.is_active, variantId]
    );
    return result.rows[0].id;
};

export const createProductImage = async (image: VariantImage): Promise<number> => {
    const result = await pool.query(
        'INSERT INTO product_image (variant_id, url, alt_text, position) VALUES ($1, $2, $3, $4) RETURNING id',
        [image.variant_id, image.url, image.alt_text, image.position]
    );
    return result.rows[0].id;
};

export const updateProductImage = async (imageId: number, image: UpdateVariantImage): Promise<number> => {
    const result = await pool.query(
        'UPDATE product_image SET url = $1, alt_text = $2, position = $3 WHERE id = $4 RETURNING id',
        [image.url, image.alt_text, image.position, imageId]
    );
    return result.rows[0].id;
};

export const deleteProduct = async (productId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM product WHERE id = $1',
        [productId]
    );
    return result.rowCount;
};

export const deleteVariant = async (variantId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM product_variant WHERE id = $1',
        [variantId]
    );
    return result.rowCount;
};

export const deleteVariantImage = async (imageId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM product_image WHERE id = $1',
        [imageId]
    );
    return result.rowCount;
};