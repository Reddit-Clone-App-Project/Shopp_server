//! This haven't been used in the project yet, but it is a type definition for a cart and cart item.

export interface Cart {
    id: number;
    app_user_id: number;
}

export interface CartItem {
    cartId: number;
    product_variant_id: number;
    quantity: number;
    price_at_purchase: number; 
}

