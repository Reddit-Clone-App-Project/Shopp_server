import { Request, Response } from "express";
import pool from '../config/db';
import { Product, ProductCard, VariantDataType } from "../types/product";
import { getHotProducts, getProductProfile, getReviews, getReviewsByStar, getReviewsThatHaveComment, getReviewsThatHaveImage, searchProducts, getSearchSuggestions, createProduct, createProductVariant, getCategoryId } from "../services/productsService";
import { checkStoreOwner } from "../services/storeService";
import { bucket } from "../config/gcs";

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

// Helper function remains the same
const uploadFileToGCS = async (file: Express.Multer.File, userId: number): Promise<string> => {
    const key = `Products images/${userId}/${Date.now()}_${file.originalname}`;
    const gcsFile = bucket.file(key);

    await gcsFile.save(file.buffer, {
        resumable: false,
        contentType: file.mimetype,
    });

    return `https://storage.googleapis.com/${bucket.name}/${key}`;
};


export const createAProduct = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (req.user?.id === undefined) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        const userId: number = req.user.id;

        const { store_id, name, description, category, price, weight, length, width, height, sku, variants: variantsJSON } = req.body;
        const files = req.files as Express.Multer.File[];

        const variants = variantsJSON ? JSON.parse(variantsJSON) : [];
        // if (!name || !category || !price || !store_id) {
        //     return res.status(400).json({ error: 'Missing required product data.' });
        // }

        if (!name) return res.status(400).json({ error: 'Product name is required.' });
        if (!category) return res.status(400).json({ error: 'Product category is required.' });
        if (!store_id) return res.status(400).json({ error: 'Store ID is missing or invalid.' });

        console.log('Parsed variants:', variants);
        if (variants.length === 0 && !price) {
            return res.status(400).json({ error: 'Product price is required when no variants are provided.' });
        }

        // --- Sort the files from req.files array ---
        let promotionImageFile: Express.Multer.File | undefined;
        const productImagesFiles: Express.Multer.File[] = [];
        // Use an object to group variant images by their index
        const variantImagesFiles: { [key: string]: Express.Multer.File[] } = {};

        for (const file of files) {
            if (file.fieldname === 'promotionImage') {
                promotionImageFile = file;
            } else if (file.fieldname === 'productImages') {
                productImagesFiles.push(file);
            } else if (file.fieldname.startsWith('variantImages_')) {
                // Extracts the index (e.g., '0' from 'variantImages_0')
                const index = file.fieldname.split('_')[1];
                if (!variantImagesFiles[index]) {
                    variantImagesFiles[index] = [];
                }
                variantImagesFiles[index].push(file);
            }
        }
        
        const isOwner: boolean = await checkStoreOwner(store_id, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'You must be the owner of the store!' });
        }

        console.log(category);
        const categoryId: number = await getCategoryId(client, category);

        // --- Image Upload Logic (using sorted files) ---
        let promotionImageUrl = '';
        if (promotionImageFile) {
            promotionImageUrl = await uploadFileToGCS(promotionImageFile, userId);
        }

        const productImagesUrls: string[] = [];
        for (const file of productImagesFiles) {
            const url = await uploadFileToGCS(file, userId);
            productImagesUrls.push(url);
        }

       const productData = {
            name,
            description,
            category: categoryId,
            store_id: Number(store_id), 
            price: Number(String(price).replace(',', '.')),
            weight, length, width, height, sku,
            promotionImage: promotionImageUrl,
            productImage: productImagesUrls,
            variant: [], 
        };
        
        const newProduct = await createProduct(client, productData, store_id);
        const productId: number = newProduct.id;
        
        // Handle variants
        const createdVariants = [];
        if (variantsJSON) {
            const variants = JSON.parse(variantsJSON);
            if (Array.isArray(variants) && variants.length > 0) {
                for (let i = 0; i < variants.length; i++) {
                    const v = variants[i];
                    const variantImagesUrls: string[] = [];
                    const filesForVariant = variantImagesFiles[i] || [];

                    for (const file of filesForVariant) {
                        const url = await uploadFileToGCS(file, userId);
                        variantImagesUrls.push(url);
                    }

                    const variantProduct: VariantDataType = { 
                        ...v, 
                        product_id: productId,
                        variantImage: variantImagesUrls,
                        variantPrice: Number(String(v.variantPrice).replace(',', '.'))
                    };
                    const newVariant = await createProductVariant(client, variantProduct);
                    createdVariants.push(newVariant); 
                }
            }
        } else {
            const defaultVariantData = {
                product_id: productId,
                variantName: 'default',
                variantPrice: productData.price,
                variantWeight: weight,
                variantLength: length,
                variantWidth: width,
                variantHeight: height,
                variantSku: sku,
                variantImage: [] 
            };
            const newVariant = await createProductVariant(client, defaultVariantData as VariantDataType);
            createdVariants.push(newVariant);
        }
        
        await client.query('COMMIT');
        res.status(201).json({
            product: newProduct,
            variants: createdVariants,
        });
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Error creating product' });
    } finally {
        client.release();
    }
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