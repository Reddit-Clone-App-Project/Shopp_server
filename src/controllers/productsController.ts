import { Request, Response } from "express";
import pool from '../config/db';
// import {Product, VariantImage, BasicProductVariant, UpdatedProduct, UpdateProduct, UpdateVariantImage, UpdateProductVariant, BasicProduct } from "../types/product";
// import { getProductProfile, createProduct, updateProduct, createProductVariant, updateProductVariant, createProductImage, updateProductImage, getStoreId, getProductId, deleteProduct, deleteVariant, deleteVariantImage, getHotProducts } from "../services/productsService";
import { Product } from "../types/product";
import { getHotProducts, getProductProfile, getReviews, getReviewsByStar, getReviewsThatHaveComment, getReviewsThatHaveImage, searchProducts, getSearchSuggestions } from "../services/productsService";
import { checkStoreOwner } from "../services/storeService";

export const getHot = async (req: Request, res: Response) => {
    const limit: number = Number(req.query.limit) || 20;
    const offset: number = Number(req.query.offset) || 0;

    try {
        const products: Product[] = await getHotProducts(limit, offset);
        res.status(200).json(products);
    } catch (err) {
        console.error('Error cannot get hot products', err);
        res.status(500).json({ error: 'Error cannot get hot products' });
    };

}

export const getProductById = async (req: Request, res: Response) => {
    const productId: number = Number(req.params.id);

    try {
        const product: Product | undefined = await getProductProfile(productId);
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

/*
export const createAProduct = async (req: Request, res: Response) => {
    const { name, description, price, store_id, category_id, sku, images, variants} = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to update a store.' });
            return;
        };

        const userId: number = req.user?.id;
        const checkOwner: boolean = await checkStoreOwner(store_id, userId);
        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };
        // Create the product
        const newProduct: BasicProduct = await createProduct({name, description, store_id, category_id});
        
        if(variants.length > 0){
            await 
        }

        await client.query('COMMIT');
        res.status(201).json(newProduct);
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in the creation of the store:', err);
        res.status(500).json({error: 'Error in the creation of the store'});
    } finally {
        client.release();
    };
};

export const updateAProduct = async (req: Request, res: Response) => {
    const productId: number = Number(req.params.id);
    const data: UpdateProduct = req.body;
    const { store_id } = data;

    try {
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to update a store.' });
            return;
        };

        const userId: number = req.user?.id;
        const checkOwner: boolean = await checkStoreOwner(store_id, userId);
        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const updatedProduct: UpdatedProduct = await updateProduct(productId, data);

        if (!updatedProduct) {
            res.status(404).json({ error: 'Store not found' });
            return;
        };

        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error('Error in the update of the product:', err);
        res.status(500).json({error: 'Error in the update of the product'});
    };
};

export const addVariant = async (req: Request, res: Response) => {
    const data: BasicProductVariant = req.body;
    const { product_id } = data;
    
    try {
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to update a store.' });
            return;
        };

        const userId: number = req.user?.id;
        const store_id: number = await getStoreId(product_id);
        const checkOwner: boolean = await checkStoreOwner(store_id, userId);
        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const variantId: number = await createProductVariant(data);

        if (!variantId) {
            res.status(404).json({ error: 'Product not found' });
            return;
        };

        res.status(201).json(variantId);
    } catch (err) {
        console.error('Error in the creation of the product variant:', err);
        res.status(500).json({error: 'Error in the creation of the product variant'});
    };
};

export const updateVariant = async (req: Request, res: Response) => {
    const variantId: number = Number(req.params.id);
    const data: UpdateProductVariant = req.body;
    const { product_id } = data;

    try {
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to update a store.' });
            return;
        };

        const userId: number = req.user?.id;
        const store_id: number = await getStoreId(product_id);
        const checkOwner: boolean = await checkStoreOwner(store_id, userId);
        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const updatedVariantId: number = await updateProductVariant(variantId, data);

        if (!updatedVariantId) {
            res.status(404).json({ error: 'Variant not found' });
            return;
        };

        res.status(200).json(updatedVariantId); 
    } catch (err) {
        console.error('Error in the update of the product variant:', err);
        res.status(500).json({error: 'Error in the update of the product variant'});
    };
};

export const addVariantImage = async (req: Request, res: Response) => {
    const data: VariantImage = req.body;
    const { variant_id } = data;
    
    try {
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to update a store.' });
            return;
        };

        const userId: number = req.user?.id;
        const product_id: number = await getProductId(variant_id);
        const store_id: number = await getStoreId(product_id);
        const checkOwner: boolean = await checkStoreOwner(store_id, userId);
        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const imageId: number = await createProductImage(data);

        if (!imageId) {
            res.status(404).json({ error: 'Product not found' });
            return;
        };

        res.status(201).json(imageId);
    } catch (err) {
        console.error('Error in the creation of the variant image:', err);
        res.status(500).json({error: 'Error in the creation of the variant image'});
    };
};

export const updateVariantImage = async (req: Request, res: Response) => {
    const imageId: number = Number(req.params.id);
    const data: UpdateVariantImage = req.body;
    const { variant_id } = data;

    try {
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to update a store.' });
            return;
        };

        const userId: number = req.user?.id;
        const product_id: number = await getProductId(variant_id);
        const store_id: number = await getStoreId(product_id);
        const checkOwner: boolean = await checkStoreOwner(store_id, userId);
        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const updatedImageId: number = await updateProductImage(imageId, data);

        if (!updatedImageId) {
            res.status(404).json({ error: 'Variant Photo not found' });
            return;
        };

        res.status(200).json(updatedImageId); 
    } catch (err) {
        console.error('Error in the update of the variant image:', err);
        res.status(500).json({error: 'Error in the update of the variant image'});
    };
};

export const deleteProductProfile = async ( req: Request, res: Response ) => {
    const productId: number = Number(req.params.id);
    const storeId: number = req.body.store_id;
    try {
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to delete a product.' });
            return;
        };

        const userId = req.user?.id;
        const checkOwner: boolean = await checkStoreOwner(storeId, userId);

        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const deleteCount: number | null = await deleteProduct(productId);

        if (deleteCount === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        };

        res.status(200).json({ messagge: 'Product deleted successfully!' });
    } catch (err) {
        console.error("Error cannot delete product", err);
        res.status(500).json({ error: "Error cannot delete product" });
    };
};

export const deleteVariantProfile = async ( req: Request, res: Response ) => {
    const variantId: number = Number(req.params.id);
    const product_id: number = req.body.product_id;
    try {
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to delete a variant product.' });
            return;
        };

        const userId = req.user?.id;
        const store_id: number = await getStoreId(product_id);
        const checkOwner: boolean = await checkStoreOwner(store_id, userId);

        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const deleteCount: number | null = await deleteVariant(variantId);

        if (deleteCount === 0) {
            res.status(404).json({ error: 'Variant not found' });
            return;
        };

        res.status(200).json({ messagge: 'Variant deleted successfully!' });
    } catch (err) {
        console.error("Error cannot delete variant", err);
        res.status(500).json({ error: "Error cannot delete variant" });
    };
};

export const deleteImage = async ( req: Request, res: Response ) => {
    const imageId: number = Number(req.params.id);
    const variant_id: number = req.body.variant_id;
    try {
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to delete an image.' });
            return;
        };

        const userId: number = req.user?.id;
        const product_id: number = await getProductId(variant_id);
        const store_id: number = await getStoreId(product_id);
        const checkOwner: boolean = await checkStoreOwner(store_id, userId);
        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const deleteCount: number | null = await deleteVariantImage(imageId);

        if (deleteCount === 0) {
            res.status(404).json({ error: 'Image not found' });
            return;
        };

        res.status(200).json({ messagge: 'Image deleted successfully!' });
    } catch (err) {
        console.error("Error cannot delete image", err);
        res.status(500).json({ error: "Error cannot delete image" });
    };
};

*/

// Review
export const getProductReviews = async (req: Request, res: Response) => {
    const productId: number = Number(req.params.id);
    const limit: number = Number(req.query.limit) || 25;
    const offset: number = Number(req.query.offset) || 0;

    try {
        const reviews = await getReviews(productId, limit, offset);
        res.status(200).json(reviews);
    } catch (err) {
        console.error("Error fetching product reviews", err);
        res.status(500).json({ error: "Error fetching product reviews" });
    }
}

export const getProductReviewsByStar = async (req: Request, res: Response) => {
    const productId: number = Number(req.params.id);
    const limit: number = Number(req.query.limit) || 25;
    const offset: number = Number(req.query.offset) || 0;
    const rating: number = Number(req.params.rating);

    try {
        const reviews = await getReviewsByStar(productId, limit, offset, rating);
        res.status(200).json(reviews);
    } catch (err) {
        console.error("Error fetching product reviews by star", err);
        res.status(500).json({ error: "Error fetching product reviews by star" });
    }
};

export const getProductReviewsHaveComment = async (req: Request, res: Response) => {
    const productId: number = Number(req.params.id);
    const limit: number = Number(req.query.limit) || 25;
    const offset: number = Number(req.query.offset) || 0;

    try {
        const reviews = await getReviewsThatHaveComment(productId, limit, offset);
        res.status(200).json(reviews);
    } catch (err) {
        console.error("Error fetching product reviews with comments", err);
        res.status(500).json({ error: "Error fetching product reviews with comments" });
    }
};

export const getProductReviewsHaveImage = async (req: Request, res: Response) => {
    const productId: number = Number(req.params.id);
    const limit: number = Number(req.query.limit) || 25;
    const offset: number = Number(req.query.offset) || 0;

    try {
        const reviews = await getReviewsThatHaveImage(productId, limit, offset);
        res.status(200).json(reviews);
    } catch (err) {
        console.error("Error fetching product reviews with images", err);
        res.status(500).json({ error: "Error fetching product reviews with images" });
    }
};

export const searchForProducts = async (req: Request, res: Response): Promise<void> => {
    const query = req.query.q as string;
    const limit: number = Number(req.query.limit) || 20;
    const offset: number = Number(req.query.offset) || 0;

    if (!query) {
        // Use return to exit the function early
        res.status(400).json({ error: 'Search query is required' });
        return; 
    }

    try {
        const products: Product[] = await searchProducts(query, limit, offset);
        res.status(200).json(products);
    } catch (err) {
        console.error('Error searching for products', err);
        res.status(500).json({ error: 'Error searching for products' });
    }
};


export const fetchSuggestions = async (req: Request, res: Response): Promise<void> => {
    const prefix = req.query.q as string;

    if (!prefix) {
        // Return an empty array if there's no query
        res.json([]);
        return;
    }

    try {
        const suggestions = await getSearchSuggestions(prefix);
        res.json(suggestions);
    } catch (err) {
        console.error("Error fetching suggestions", err);
        res.status(500).json({ error: "Could not fetch suggestions" });
    }
};