import { Request, Response } from "express";
import pool from '../config/db';
import { Product, ProductCard, VariantDataType } from "../types/product";
import { getHotProducts, getProductProfile, getReviews, getReviewsByStar, getReviewsThatHaveComment, getReviewsThatHaveImage, searchProducts, getSearchSuggestions, createProduct, createProductVariant, getCategoryId } from "../services/productsService";
import { checkStoreOwner } from "../services/storeService";

export const getHot = async (req: Request, res: Response) => {
    const limit: number = Number(req.query.limit) || 20;
    const offset: number = Number(req.query.offset) || 0;

    try {
        const products: ProductCard[] = await getHotProducts(limit, offset);
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


export const createAProduct = async (req: Request, res: Response) => {
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to update a product.' });
            return;
        };

        const userId: number = req.user?.id;

        const { store_id, productData } = req.body;

        if (!productData) {
            res.status(400).json({ error: 'Missing productData' });
            return;
        }

        let {
            name,
            description,
            category,
            productImage,
            promotionImage,
            price,
            weight,
            length,
            width,
            height,
            express,
            fast,
            economical,
            bulky,
            sku,
            variant
        } = productData;


        const isOwner: boolean = await checkStoreOwner(store_id, userId);
        if (!isOwner) {
            res.status(403).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const categoryId: number = await getCategoryId(client, productData.category);
        productData.category = categoryId;
        productData.price = Number(String(productData.price).replace(',', '.'));
        productData.variant.variantPrice = Number(String(productData.price).replace(',', '.'));

        const newProduct  = await createProduct(client, productData, store_id);

        const productId: number = newProduct.id;

        let variants = [];
        if (Array.isArray(variant) && variant.length > 0) {
            for (const v of variant) {
                const variantProduct: VariantDataType = { ...v, product_id: productId };
                const newVariant = await createProductVariant(client, variantProduct);
                variants.push(newVariant); 
            };
        };
        
        await client.query('COMMIT');
        res.status(201).json({
            product: newProduct,
            variants,
        });
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating product:', err);
        res.status(500).json({error: 'Error creating product'});
    } finally {
        client.release();
    };
};

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
    const searchTerm = req.query.q as string;
    const limit: number = Number(req.query.limit) || 60;
    const offset: number = Number(req.query.offset) || 0;
    const sortBy = req.query.sortBy as string || 'Relevance';
    const minPrice = parseFloat(req.query.minPrice as string) || undefined;
    const maxPrice = parseFloat(req.query.maxPrice as string) || undefined;
    const rating = parseInt(req.query.rating as string) || undefined;

    if (!searchTerm) {
        // Use return to exit the function early
        res.status(400).json({ error: 'Search query is required' });
        return; 
    }

    try {
        const products: ProductCard[] = await searchProducts({searchTerm, limit, offset, sortBy, minPrice, maxPrice, rating});
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