import pool from '../config/db';
// import { Cart, CartItem } from '../types/cart';

// ! The initial purpose of this function was to create a cart when a user is created. But I think sql trigger is much better so I commented it out
// export const createCart = async (cart:Cart) => {
//     const result = await pool.query(
//         'INSERT INTO carts (app_user_id) VALUES ($1) RETURNING *',
//         [cart.app_user_id]
//     )
//     return result.rows[0]
// }

export const getCartByUserId = async (userId: number) => {
  const query = `
    SELECT
      c.id AS cart_id,
      c.app_user_id,
      -- This subquery aggregates items into stores, and then aggregates stores into a final array.
      COALESCE(
        (
          SELECT
            json_agg(store_items ORDER BY store_name)
          FROM
            (
              -- This inner query groups all cart items by their respective store.
              SELECT
                s.id AS store_id,
                s.name AS store_name,
                -- This creates the JSON array of items belonging to this specific store.
                json_agg(
                  json_build_object(
                    'product_variant_id', pv.id,
                    'product_name', p.name,
                    'variant_name', pv.variant_name,
                    'quantity', ci.quantity,
                    'price_at_purchase', ci.price_at_purchase,
                    -- Efficiently get the first image for the variant.
                    'image_url', (
                      SELECT url
                      FROM public.product_image
                      WHERE product_image.product_variant_id = pv.id
                      LIMIT 1
                    )
                  )
                  ORDER BY p.name
                ) AS items
              FROM
                public.cart_item AS ci
                JOIN public.product_variant AS pv ON ci.product_variant_id = pv.id
                JOIN public.product AS p ON pv.product_id = p.id
                JOIN public.store AS s ON p.store_id = s.id
              WHERE
                ci.cart_id = c.id
              GROUP BY
                s.id, s.name
            ) AS store_items
        ),
        '[]'::json
      ) AS stores
    FROM
      public.cart AS c
    WHERE
      c.app_user_id = $1 -- Filter for the specific user's cart
    GROUP BY
      c.id;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};

export const addItemToCartByUserId = async (userId: number, productVariantId: number, quantity: number, priceAtPurchase: number) => {
  const query = `
    INSERT INTO public.cart_item (cart_id, product_variant_id, quantity, price_at_purchase)
    SELECT id, $2, $3, $4
    FROM public.cart
    WHERE app_user_id = $1
    ON CONFLICT (cart_id, product_variant_id) DO UPDATE 
    SET quantity = cart_item.quantity + $3; -- Example: if item exists, increase quantity
  `;
  await pool.query(query, [userId, productVariantId, quantity, priceAtPurchase]);

  // After adding the item, return the updated cart
  return getCartByUserId(userId);
};

export const removeItemFromCartByUserId = async (userId: number, productVariantId: number) => {
  const query = `
    DELETE FROM public.cart_item
    WHERE product_variant_id = $2
      AND cart_id = (SELECT id FROM public.cart WHERE app_user_id = $1);
  `;
  await pool.query(query, [userId, productVariantId]);

  return getCartByUserId(userId);
};

export const removeAllItemsFromCartByUserId = async (userId: number) => {
  const query = `
    DELETE FROM public.cart_item
    WHERE cart_id = (SELECT id FROM public.cart WHERE app_user_id = $1);
  `;
  await pool.query(query, [userId]);
}

export const updateCartItemQuantityByUserId = async (userId: number, productVariantId: number, newQuantity: number) => {
  if (newQuantity <= 0) {
    // If the new quantity is 0 or less, remove the item instead.
    return removeItemFromCartByUserId(userId, productVariantId);
  }

  const query = `
    UPDATE public.cart_item
    SET quantity = $3
    WHERE product_variant_id = $2
      AND cart_id = (SELECT id FROM public.cart WHERE app_user_id = $1);
  `;
  await pool.query(query, [userId, productVariantId, newQuantity]);

  // After updating, return the entire cart with all items grouped by store.
  return getCartByUserId(userId);
};