import pool from '../config/db';

export const getWishlistByUserId = async (userId: number) => {
    const result = await pool.query(
        'SELECT * FROM wishlist WHERE app_user_id = $1',
        [userId]
    );
    return result.rows;
}

export const getWishlistDetailById = async (wishlistId: number) => {
    const query = `
        SELECT
            w.id AS wishlist_id,
            w.name AS wishlist_name,
            -- Aggregate all products in the wishlist into a single JSON array
            COALESCE(p.products, '[]'::json) AS products
        FROM
            public.wishlist w
        -- Use a LEFT JOIN LATERAL to ensure a wishlist is returned even if it's empty
        LEFT JOIN LATERAL (
            SELECT
                json_agg(
                    json_build_object(
                        'id', p.id,
                        'name', p.name,
                        -- Subquery to fetch the promotion image for each product
                        'promotion_image', (
                            SELECT
                                json_build_object(
                                    'id', pi.id,
                                    'url', pi.url,
                                    'alt_text', pi.alt_text
                                )
                            FROM public.product_image pi
                            WHERE pi.product_id = p.id AND pi.is_promotion_image = true
                            LIMIT 1
                        ),
                        -- Subquery to calculate the min and max price from variants
                        'price_range', (
                            SELECT
                                json_build_object(
                                    'min_price', MIN(pv.price),
                                    'max_price', MAX(pv.price)
                                )
                            FROM public.product_variant pv
                            WHERE pv.product_id = p.id
                        )
                    )
                ) AS products
            FROM
                public.wishlist_item wi
            JOIN
                public.product p ON wi.product_id = p.id
            WHERE
                wi.wishlist_id = w.id
        ) p ON true
        WHERE
            w.id = $1;
    `;
    
    const result = await pool.query(query, [wishlistId]);
    return result.rows[0];
};

export const createWishlist = async (userId: number, name: string) => {
    const result = await pool.query(
        'INSERT INTO public.wishlist (app_user_id, name) VALUES ($1, $2) RETURNING *',
        [userId, name]
    );
    return result.rows[0];
};

export const getWishlistItem = async (wishlistId: number, productId: number) => {
    const result = await pool.query(
        'SELECT * FROM public.wishlist_item WHERE wishlist_id = $1 AND product_id = $2',
        [wishlistId, productId]
    );
    return result.rows[0];
}

export const addToWishlist = async (wishlistId: number, productId: number) => {
    const result = await pool.query(
        'INSERT INTO public.wishlist_item (wishlist_id, product_id) VALUES ($1, $2) RETURNING *',
        [wishlistId, productId]
    );
    return result.rows[0];
};

export const removeFromWishlist = async (wishlistId: number, productId: number) => {
    await pool.query(
        'DELETE FROM public.wishlist_item WHERE wishlist_id = $1 AND product_id = $2',
        [wishlistId, productId]
    );
};

export const removeWishlistById = async (wishlistId: number) => {
    await pool.query(
        'DELETE FROM public.wishlist WHERE id = $1',
        [wishlistId]
    );
};