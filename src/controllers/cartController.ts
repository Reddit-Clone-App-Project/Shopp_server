import { Request, Response } from 'express';
import { 
  getCartByUserId, 
  addItemToCartByUserId, 
  removeItemFromCartByUserId,
  removeAllItemsFromCartByUserId,
  updateCartItemQuantityByUserId
} from '../services/cartService';

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== 'number') {
      res.status(400).json({ error: 'Invalid or missing user identifier' });
      return;
    }

    const cart = await getCartByUserId(userId);
    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { productVariantId, quantity, priceAtPurchase } = req.body;

    if (typeof userId !== 'number') {
      res.status(400).json({ error: 'Invalid or missing user identifier' });
      return;
    }

    if (!productVariantId || !quantity || !priceAtPurchase) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const updatedCart = await addItemToCartByUserId(userId, productVariantId, quantity, priceAtPurchase);
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { productVariantId } = req.body;

    if (typeof userId !== 'number') {
      res.status(400).json({ error: 'Invalid or missing user identifier' });
      return;
    }

    if (!productVariantId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const updatedCart = await removeItemFromCartByUserId(userId, productVariantId);
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeAllItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (typeof userId !== 'number') {
      res.status(400).json({ error: 'Invalid or missing user identifier' });
      return;
    }

    await removeAllItemsFromCartByUserId(userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error removing all items from cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { productVariantId, quantity } = req.body;

    if (typeof userId !== 'number') {
      res.status(400).json({ error: 'Invalid or missing user identifier' });
      return;
    }

    if (!productVariantId || typeof quantity !== 'number') {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    // Call the new service function to update the quantity
    const updatedCart = await updateCartItemQuantityByUserId(userId, productVariantId, quantity);
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};