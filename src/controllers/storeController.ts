import { Request, Response } from "express";
import pool from '../config/db';
import { Store, StoreOutput, StoreInfo, StoreAddress, RatingStats, Review, StoreInfoUpdate  } from '../types/store';
import { createAddress, createStore, createOwner, getStores, getStoreProfile, getStoreAddressById, getRatingStats, getRecentReviews, updateStoreProfile, deleteStoreProfile } from "../services/storeService";
import { error } from "console";

export const registerStore = async (req: Request, res: Response) => {
    const { name, address, email, phone_number } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if (req.user?.id === undefined) {
            await client.query('ROLLBACK');
            res.status(400).json({ error: 'User ID is required to create a store owner.' });
            return;
        };

        const address_id: number = await createAddress(address);

        const newStore: StoreOutput = await createStore({
            name,
            address_id,
            email,
            phone_number,
        });

        await createOwner({
            store_id: newStore.id,
            app_user_id: req.user.id,
            role: 'owner',
        });

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


export const updateStore = async ( req: Request, res: Response ) => {
    const id = Number(req.params.id);
    const { name, profile_img, phone_number, email, address } = req.body;

    try {
        const updateStore: StoreInfoUpdate = await updateStoreProfile({ id, name, profile_img, phone_number, email, address });

        if (!updateStore) {
            res.status(404).json({ error: 'Store not found' });
            return;
        };

        res.status(200).json(updateStore);
    } catch (err) {
        console.error("Error cannot update user profile", err);
        res.status(500).json({ error: "Error cannot update user profile" });
    };
};

export const deleteStore = async ( req: Request, res: Response ) => {
    const storeId = Number(req.params.id);
    try {
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