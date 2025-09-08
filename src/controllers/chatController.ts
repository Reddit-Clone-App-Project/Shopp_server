import { Request, Response } from 'express';
import { getConversationsByStoreId, getConversationsByUserId, getOrCreateConversation } from '../services/chatService';

export const fetchUserConversations = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const conversations = await getConversationsByUserId(userId);
        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
};

export const fetchStoreConversations = async (req: Request, res: Response) => {
    const { storeId } = req.body;
    if (!storeId) {
        res.status(400).json({ error: "Store ID is required" });
        return;
    }

    try {
        const conversations = await getConversationsByStoreId(storeId);
        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error fetching store conversations:", error);
        res.status(500).json({ error: "Failed to fetch store conversations" });
    }
}

export const findOrCreateConversationController = async (req: Request, res: Response) => {
    const buyerId = req.user?.id;
    const { buyerIdFromSeller, sellerId } = req.body;

    if (!buyerId || !sellerId) {
        res.status(400).json({ error: "Buyer and seller IDs are required" });
        return;
    }

    try {
        const {conversation, messages} = await getOrCreateConversation(buyerId ?? buyerIdFromSeller, sellerId);
        res.status(200).json({conversation, messages});
    } catch (error) {
        console.error("Error finding or creating conversation:", error);
        res.status(500).json({ error: "Failed to process request" });
    }
};