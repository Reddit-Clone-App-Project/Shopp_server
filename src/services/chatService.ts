import pool from '../config/db';

interface ChatMessageData {
    conversationId: string;
    senderBuyerId: string | undefined;
    senderStoreId: string | undefined;
    content: string;
}

const getMessagesByConversationId = async (conversationId: number) => {
    const result = await pool.query(
        'SELECT * FROM chat_message WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversationId]
    );
    return result.rows;
}

export const getOrCreateConversation = async (buyerId: number, sellerId: number) => {
    const existingConversation = await pool.query(
        'SELECT * FROM conversation WHERE buyer_id = $1 AND seller_id = $2',
        [buyerId, sellerId]
    );

    let conversation;
    if (existingConversation.rows.length > 0) {
        conversation = existingConversation.rows[0];
    }else{
        const newConversation = await pool.query(
            'INSERT INTO conversation (buyer_id, seller_id) VALUES ($1, $2) RETURNING *',
            [buyerId, sellerId]
        );
        conversation = newConversation.rows[0];
    }
    const messages = await getMessagesByConversationId(conversation.id);

    const formattedConversationQuery = `
        SELECT
            c.id AS conversation_id,
            c.updated_at,
            -- Use a CASE statement to get the other user's details
            CASE
                WHEN c.buyer_id = $1 THEN json_build_object('id', s.id, 'name', s.name, 'avatar', s.profile_img)
                ELSE json_build_object('id', b.id, 'name', b.username, 'avatar', b.profile_img)
            END AS other_user,
            -- Use a LATERAL join to efficiently get the last message
            last_msg.content AS last_message_content,
            last_msg.created_at AS last_message_timestamp
        FROM
            public.conversation c
        JOIN public.app_user b ON c.buyer_id = b.id
        JOIN public.store s ON c.seller_id = s.id
        LEFT JOIN LATERAL (
            SELECT content, created_at
            FROM public.chat_message cm
            WHERE cm.conversation_id = c.id
            ORDER BY cm.created_at DESC
            LIMIT 1
        ) last_msg ON true
        WHERE c.id = $2; -- Filter by the specific conversation ID
    `;

    const result = await pool.query(formattedConversationQuery, [buyerId, conversation.id]);
    conversation = result.rows[0];

    return {conversation, messages};
};


export const saveChatMessage = async (messageData: ChatMessageData) => {
    const { conversationId, senderBuyerId, senderStoreId, content } = messageData;
    console.log(conversationId)
    if(senderBuyerId && !senderStoreId){
        const result = await pool.query(
            'INSERT INTO chat_message (conversation_id, sender_buyer_id, content) VALUES ($1, $2, $3) RETURNING *',
            [conversationId, senderBuyerId, content]
        );
        return result.rows[0];
    }else if(!senderBuyerId && senderStoreId){
        const result = await pool.query(
            'INSERT INTO chat_message (conversation_id, sender_store_id, content) VALUES ($1, $2, $3) RETURNING *',
            [conversationId, senderStoreId, content]
        );
        return result.rows[0];
    }

}

export const getConversationsByUserId = async (userId: number) => {
    const query = `
        SELECT
            c.id AS conversation_id,
            c.updated_at,
            -- Use a CASE statement to get the other user's details
            CASE
                WHEN c.buyer_id = $1 THEN json_build_object('id', s.id, 'name', s.name, 'avatar', s.profile_img)
                ELSE json_build_object('id', b.id, 'name', b.username, 'avatar', b.profile_img)
            END AS other_user,
            -- Use a LATERAL join to efficiently get the last message for each conversation
            last_msg.content AS last_message_content,
            last_msg.created_at AS last_message_timestamp
        FROM
            public.conversation c
        JOIN public.app_user b ON c.buyer_id = b.id
        JOIN public.store s ON c.seller_id = s.id
        LEFT JOIN LATERAL (
            SELECT content, created_at
            FROM public.chat_message cm
            WHERE cm.conversation_id = c.id
            ORDER BY cm.created_at DESC
            LIMIT 1
        ) last_msg ON true
        WHERE
            c.buyer_id = $1 
        ORDER BY
            c.updated_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

export const getConversationsByStoreId = async (storeId: number) => {
    const query = `
        SELECT
            c.id AS conversation_id,
            c.updated_at,
            -- Use a CASE statement to get the other user's details
            CASE
                WHEN c.buyer_id = $1 THEN json_build_object('id', s.id, 'name', s.name, 'avatar', s.profile_img)
                ELSE json_build_object('id', b.id, 'name', b.username, 'avatar', b.profile_img)
            END AS other_user,
            -- Use a LATERAL join to efficiently get the last message for each conversation
            last_msg.content AS last_message_content,
            last_msg.created_at AS last_message_timestamp
        FROM
            public.conversation c
        JOIN public.app_user b ON c.buyer_id = b.id
        JOIN public.store s ON c.seller_id = s.id
        LEFT JOIN LATERAL (
            SELECT content, created_at
            FROM public.chat_message cm
            WHERE cm.conversation_id = c.id
            ORDER BY cm.created_at DESC
            LIMIT 1
        ) last_msg ON true
        WHERE
            c.seller_id = $1 
        ORDER BY
            c.updated_at DESC;
    `;
    const result = await pool.query(query, [storeId]);
    return result.rows;
};