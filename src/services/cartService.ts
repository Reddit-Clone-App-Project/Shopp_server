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
      c.created_at,
      c.updated_at,
      -- Use COALESCE to ensure an empty cart returns [] instead of null for items
      COALESCE(
        json_agg(
          -- Build a JSON object for each item
          json_build_object(
            'product_variant_id', pv.id,
            'product_name', p.name, -- Added product name here
            'variant_name', pv.variant_name,
            'quantity', ci.quantity,
            'price_at_purchase', ci.price_at_purchase,
            'image_url', pi.url
          )
          -- Order items consistently
          ORDER BY p.name, pv.variant_name
        ) FILTER (WHERE ci.cart_id IS NOT NULL),
        '[]'::json
      ) AS items
    FROM
      public.cart AS c
      LEFT JOIN public.cart_item AS ci ON c.id = ci.cart_id
      LEFT JOIN public.product_variant AS pv ON ci.product_variant_id = pv.id
      -- Added join to the product table to get the name
      LEFT JOIN public.product AS p ON pv.product_id = p.id
      -- A LATERAL join efficiently fetches one image per variant
      LEFT JOIN LATERAL (
        SELECT url
        FROM public.product_image
        WHERE product_image.product_variant_id = pv.id
        LIMIT 1
      ) AS pi ON true
    WHERE
      c.app_user_id = $1
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