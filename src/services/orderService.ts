import pool from "../config/db";
import { NewOrder } from "../types/order";

export const createOrder = async (order: NewOrder) => {
    const result = await pool.query(
        'INSERT INTO order_table (app_user_id, address_id, status, payment_id, total_without_shipping, store_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [order.app_user_id, order.address_id, order.status, order.payment_id, order.total_without_shipping, order.store_id]
    );
    return result.rows[0];
};

export const getOrderById = async (orderId: number) => {
    const result = await pool.query(
        'SELECT * FROM order_table WHERE id = $1',
        [orderId]
    );
    return result.rows[0];
};

export const getAllOrdersByStoreId = async (storeId: number) => {
    const result = await pool.query(
        `SELECT
            o.id,
            o.status,
            o.total_without_shipping,
            -- Step 3: Coalesce ensures we get an empty array '[]' instead of NULL if an order has no items.
            COALESCE(p_agg.products, '[]'::json) AS products
        FROM order_table o
        -- Step 2: Join the aggregated product data back to the main order table.
        -- LEFT JOIN is used to include orders that might not have any items.
        LEFT JOIN (
            SELECT
                oi.order_table_id,
                json_agg(json_build_object(
                    'name', p.name,
                    'variants', p_variants.variants
                )) AS products
            FROM order_item oi
            JOIN product_variant pv ON oi.product_variant_id = pv.id
            JOIN product p ON pv.product_id = p.id
            -- Step 1: Aggregate variants for each product within each order first.
            JOIN (
                SELECT
                    order_table_id,
                    product_id,
                    json_agg(json_build_object(
                        'id', id,
                        'name', variant_name,
                        'price', price,
                        'quantity', quantity,
                        'price_at_purchase', price_at_purchase
                    )) AS variants
                FROM (
                    SELECT
                        oi_inner.order_table_id,
                        pv_inner.product_id,
                        pv_inner.id,
                        pv_inner.variant_name,
                        pv_inner.price,
                        oi_inner.quantity,
                        oi_inner.price_at_purchase
                    FROM order_item oi_inner
                    JOIN product_variant pv_inner ON oi_inner.product_variant_id = pv_inner.id
                ) AS variant_details
                GROUP BY order_table_id, product_id
            ) AS p_variants ON p_variants.order_table_id = oi.order_table_id AND p_variants.product_id = p.id
            GROUP BY oi.order_table_id
        ) AS p_agg ON o.id = p_agg.order_table_id
        WHERE o.store_id = $1;`,
        [storeId]
    );
    return result.rows;
};

export const updateOrderStatusByPaymentId = async (paymentId: number, status: NewOrder['status']) => {
    const result = await pool.query(
        'UPDATE order_table SET status = $1 WHERE payment_id = $2 RETURNING *',
        [status, paymentId]
    );
    return result.rows;
}

export const updateOrderStatus = async (orderId: number, newStatus: NewOrder['status']) => {
    const result = await pool.query(
        'UPDATE order_table SET status = $1 WHERE id = $2 RETURNING *',
        [newStatus, orderId]
    );
    return result.rows[0];
};

export const deleteOrder = async (orderId: number) => {
    await pool.query(
        'DELETE FROM order_table WHERE id = $1',
        [orderId]
    );
};

export const getAllOrdersByUserId = async (userId: number) => {
    const query = `
        WITH OrderProducts AS (
            -- First, aggregate all variants for each product within an order
            SELECT
                oi.order_table_id,
                pr.id AS product_id,
                pr.name AS product_name,
                json_agg(
                    json_build_object(
                        'variant_id', pv.id,
                        'variant_name', pv.variant_name,
                        'quantity', oi.quantity,
                        'price_at_purchase', oi.price_at_purchase,
                        'image_url', (
                            SELECT url
                            FROM public.product_image pi
                            WHERE pi.product_variant_id = pv.id
                            ORDER BY pi.id
                            LIMIT 1
                        )
                    )
                ) AS variants
            FROM public.order_item oi
            JOIN public.product_variant pv ON oi.product_variant_id = pv.id
            JOIN public.product pr ON pv.product_id = pr.id
            GROUP BY oi.order_table_id, pr.id, pr.name
        ),
        AggregatedOrders AS (
            -- Then, aggregate all products for each order
            SELECT
                order_table_id,
                json_agg(
                    json_build_object(
                        'product_id', product_id,
                        'product_name', product_name,
                        'variants', variants
                    )
                ) AS products
            FROM OrderProducts
            GROUP BY order_table_id
        ),
        LatestLog AS (
            -- Use DISTINCT ON to efficiently get only the most recent log for each order
            SELECT DISTINCT ON (order_id)
                order_id,
                json_build_object(
                    'status', ol.status,
                    'timestamp', ol.created_at,
                    'storage_location', st.location,
                    'shipper_name', sp.full_name
                ) AS current_status
            FROM public.order_log ol
            LEFT JOIN public.storage st ON ol.storage_id = st.id
            LEFT JOIN public.shipper sp ON ol.shipper_id = sp.id
            ORDER BY order_id, ol.created_at DESC
        )
        -- Final SELECT to join everything together
        SELECT
            o.id AS order_id,
            o.status AS order_status,
            o.created_at,
            p.total AS total_paid,
            json_build_object(
                'id', s.id,
                'name', s.name,
                'profile_img', s.profile_img
            ) AS store,
            ll.current_status,
            ao.products
        FROM
            public.order_table o
        JOIN
            public.payment p ON o.payment_id = p.id
        JOIN
            public.store s ON o.store_id = s.id
        LEFT JOIN
            AggregatedOrders ao ON o.id = ao.order_table_id
        LEFT JOIN
            LatestLog ll ON o.id = ll.order_id
        WHERE
            o.app_user_id = $1
        ORDER BY
            o.created_at DESC;
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
};

export const getOrderDetailById = async(orderId : number) => {
    const query = `
    WITH OrderProducts AS (
        -- First, aggregate all variants for each product within the order
        SELECT
            oi.order_table_id,
            pr.id AS product_id,
            pr.name AS product_name,
            json_agg(
                json_build_object(
                    'variant_id', pv.id,
                    'variant_name', pv.variant_name,
                    'quantity', oi.quantity,
                    'price_at_purchase', oi.price_at_purchase,
                    'image_url', (
                        SELECT url
                        FROM public.product_image pi
                        WHERE pi.product_variant_id = pv.id
                        ORDER BY pi.id
                        LIMIT 1
                    )
                )
            ) AS variants
        FROM public.order_item oi
        JOIN public.product_variant pv ON oi.product_variant_id = pv.id
        JOIN public.product pr ON pv.product_id = pr.id
        WHERE oi.order_table_id = $1 -- Filter early for the specific order
        GROUP BY oi.order_table_id, pr.id, pr.name
    ),
    AggregatedOrderProducts AS (
        -- Then, aggregate all products for that single order
        SELECT
            order_table_id,
            json_agg(
                json_build_object(
                    'product_id', product_id,
                    'product_name', product_name,
                    'variants', variants
                )
            ) AS products
        FROM OrderProducts
        GROUP BY order_table_id
    ),
    OrderLogs AS (
        -- Aggregate all log entries for the order, ordered by creation date
        SELECT
            ol.order_id,
            json_agg(
                json_build_object(
                    'status', ol.status,
                    'timestamp', ol.created_at,
                    'storage_location', st.location,
                    'shipper_name', sp.full_name
                ) ORDER BY ol.created_at ASC
            ) AS logs
        FROM public.order_log ol
        LEFT JOIN public.storage st ON ol.storage_id = st.id
        LEFT JOIN public.shipper sp ON ol.shipper_id = sp.id
        WHERE ol.order_id = $1 -- Filter early
        GROUP BY ol.order_id
    )
    -- Final SELECT to join the main tables with the pre-aggregated JSON data
    SELECT
        o.id AS order_id,
        o.status AS order_status,
        o.created_at,
        p.total AS total_paid,
        json_build_object(
            'id', s.id,
            'name', s.name,
            'profile_img', s.profile_img
        ) AS store,
        -- Select the full address details as a JSON object
        json_build_object(
            'full_name', a.full_name,
            'phone_number', a.phone_number,
            'address_line1', a.address_line1,
            'address_line2', a.address_line2,
            'city', a.city,
            'province', a.province,
            'postal_code', a.postal_code,
            'country', a.country
        ) AS shipping_address,
        -- Include the aggregated logs and products
        ol.logs AS order_logs,
        aop.products
    FROM
        public.order_table o
    JOIN
        public.payment p ON o.payment_id = p.id
    JOIN
        public.store s ON o.store_id = s.id
    JOIN
        public.address a ON o.address_id = a.id
    LEFT JOIN
        AggregatedOrderProducts aop ON o.id = aop.order_table_id
    LEFT JOIN
        OrderLogs ol ON o.id = ol.order_id
    WHERE
        o.id = $1; -- The primary filter for the entire query
    `;

    const result = await pool.query(query, [orderId]);
    return result.rows[0];
}