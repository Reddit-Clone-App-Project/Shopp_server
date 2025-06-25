import { Request, Response } from "express";
import pool from '../config/db';
import { StoreData, StoreOutput, StoreInfo, StoreAddress, RatingStats, Review, StoreInfoUpdate  } from '../types/store';
import { createAddress, createStore, createOwner, getStores, getStoreProfile, getStoreAddressById, getRatingStats, getRecentReviews, updateStoreProfile, deleteStoreProfile, checkStoreOwner } from "../services/storeService";
import { error } from "console";

export const registerStore = async (req: Request<{}, {}, StoreData>, res: Response) => {
    const data = req.body;
    const {
        storeName,
        storeEmail,
        storePhone,
        address,
        expressShipping,
        fastShipping,
        economicalShipping,
        bulkyShipping,
    } = data;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if (req.user?.id === undefined) {
            await client.query('ROLLBACK');
            res.status(400).json({ error: 'User ID is required to create a store owner.' });
            return;
        };

        const address_id: number = await createAddress(address, client);

        const newStore: StoreOutput = await createStore({
            storeName,
            storeEmail,
            storePhone,
            address,
            expressShipping,
            fastShipping,
            economicalShipping,
            bulkyShipping,
        }, address_id, client);

        await createOwner({
            store_id: newStore.id,
            app_user_id: req.user.id,
            role: 'owner',
        }, client);

        await client.query('COMMIT');
        res.status(201).json(newStore);

    }catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in the creation of the store:', err);
        res.status(500).json({
            error: 'Error in the creation of the store',
        });
    } finally {
        client.release();
    };
};

export const getAllStores = async ( req: Request, res: Response ) => {
    try {
        const allStores = await getStores();
        res.status(200).json(allStores);

    } catch (err) {
        console.error("Error cannot get all stores", err);
        res.status(500).json({ error: "Error cannot get all stores" });
  };
};

/* need change */ 
export const getStoreById = async ( req: Request, res: Response ) => {
    const storeId = Number(req.params.id);

    try {
        const store: StoreInfo | undefined = await getStoreProfile(storeId);

        if (!store) {
            res.status(404).json({ error: 'Store not found' });
            return;
        };

        const addressId = store.address_id;
        const address: StoreAddress | undefined = await getStoreAddressById(addressId);
        const ratingStats: RatingStats | undefined = await getRatingStats(storeId);
        const recentReviews: Review[] = await getRecentReviews(storeId, 5) || [];

        res.status(200).json({...store, ...ratingStats, reviews: recentReviews, address});

    } catch (err) {
        console.error("Error cannot get store profile", err);
        res.status(500).json({ error: "Error cannot get store profile" });
    };
};


export const updateStore = async ( req: Request, res: Response ): Promise<void> => {
    const storeId = Number(req.params.id);
    const data = req.body;
    const {
        storeName,
        storeProfile_img,
        storeEmail,
        storePhone,
        address,
        expressShipping,
        fastShipping,
        economicalShipping,
        bulkyShipping,
    } = data;
    
    try {
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to update a store.' });
            return;
        };

        const userId = req.user?.id;
        const checkOwner: boolean = await checkStoreOwner(storeId, userId);

        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const updatedStore: StoreInfoUpdate = await updateStoreProfile({ 
            storeId, 
            storeName,
            storeProfile_img, 
            storeEmail,
            storePhone,
            address,
            expressShipping,
            fastShipping,
            economicalShipping,
            bulkyShipping, 
        });

        if (!updatedStore) {
            res.status(404).json({ error: 'Store not found' });
            return;
        };

        res.status(200).json(updatedStore);
    } catch (err) {
        console.error("Error cannot update user profile", err);
        res.status(500).json({ error: "Error cannot update user profile" });
    };
};

export const deleteStore = async ( req: Request, res: Response ) => {
    const storeId = Number(req.params.id);
    try {
        if (req.user?.id === undefined) {
            res.status(400).json({ error: 'User ID is required to delete a store.' });
            return;
        };

        const userId = req.user?.id;
        const checkOwner: boolean = await checkStoreOwner(storeId, userId);

        if (!checkOwner) {
            res.status(400).json({ error: 'You must be the owner of the store!'});
            return;
        };

        const deleteCount: number | null = await deleteStoreProfile(storeId);

        if (deleteCount === 0) {
            res.status(404).json({ error: 'Store not found' });
            return;
        };

        res.status(200).json('Store deleted successfully!');
    } catch (err) {
        console.error("Error cannot delete store", err);
        res.status(500).json({ error: "Error cannot delete store" });
    };
};