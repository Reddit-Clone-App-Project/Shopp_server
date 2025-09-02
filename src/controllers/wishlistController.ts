import { Request, Response } from "express";
import { addToWishlist, createWishlist, getWishlistByUserId, getWishlistDetailById, removeFromWishlist, removeWishlistById } from "../services/wishlistService";

export const getWishlist = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const wishlist = await getWishlistByUserId(userId);
        res.status(200).json(wishlist);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
};

export const getWishlistDetail = async (req: Request, res: Response) => {
    const wishlistId = parseInt(req.params.id);
    if (isNaN(wishlistId)) {
        res.status(400).json({ error: "Invalid wishlist ID" });
        return;
    }

    try {
        const wishlistDetail = await getWishlistDetailById(wishlistId);
        if (!wishlistDetail) {
            res.status(404).json({ error: "Wishlist not found" });
            return;
        }
        res.status(200).json(wishlistDetail);
    } catch (error) {
        console.error("Error fetching wishlist detail:", error);
        res.status(500).json({ error: "Failed to fetch wishlist detail" });
    }
};

export const createAWishlist = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { name } = req.body;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const newWishlist = await createWishlist(userId, name);
        res.status(201).json(newWishlist);
    } catch (error) {
        console.error("Error creating wishlist:", error);
        res.status(500).json({ error: "Failed to create wishlist" });
    }
};

export const deleteAWishlist = async (req: Request, res: Response) => {
    const wishlistId = parseInt(req.params.id);
    if (isNaN(wishlistId)) {
        res.status(400).json({ error: "Invalid wishlist ID" });
        return;
    }

    try {
        await removeWishlistById(wishlistId);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting wishlist:", error);
        res.status(500).json({ error: "Failed to delete wishlist" });
    }
};

export const addToAWishlist = async (req: Request, res: Response) => {
    const wishlistId = parseInt(req.params.id);
    const { productId } = req.body;

    if (isNaN(wishlistId) || !productId) {
        res.status(400).json({ error: "Invalid wishlist ID or product ID" });
        return;
    }

    try {
        const addedItem = await addToWishlist(wishlistId, productId);
        res.status(201).json(addedItem);
    } catch (error) {
        console.error("Error adding item to wishlist:", error);
        res.status(500).json({ error: "Failed to add item to wishlist" });
    }
};

export const deleteFromAWishlist = async (req: Request, res: Response) => {
    const wishlistId = parseInt(req.params.id);
    const { productId } = req.body;

    if (isNaN(wishlistId) || !productId) {
        res.status(400).json({ error: "Invalid wishlist ID or product ID" });
        return;
    }

    try {
        await removeFromWishlist(wishlistId, productId);
        res.status(204).send();
    } catch (error) {
        console.error("Error removing item from wishlist:", error);
        res.status(500).json({ error: "Failed to remove item from wishlist" });
    }
};