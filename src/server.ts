import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getOrCreateConversation, saveChatMessage } from './services/chatService';

const PORT = process.env.PORT || 3000;

// Create HTTP server to integrate with Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err: any, user: any) => {
        if (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
        (socket as any).user = user;
        next();
    });
});

// Handle real-time connections
io.on('connection', (socket) => {
    console.log(`User connected: ${(socket as any).id}`);

    // Event to join a conversation room
    socket.on('joinRoom', async (data: {buyerId: number, sellerId: number}) => {
        const { buyerId, sellerId } = data;

        //Create a consistent room name
        //Sorting the IDs ensures the room name is the same regardless of who is buyer or seller
        const sortedIds = [buyerId, sellerId].sort((a, b) => a - b);
        const roomId = `conversation_${sortedIds[0]}_${sortedIds[1]}`;

        try {
            const {conversation} = await getOrCreateConversation(buyerId, sellerId);

            socket.join(roomId);
            console.log(`User ${(socket as any).id} joined room: ${roomId}`);

            socket.emit('roomJoined', { roomId, conversationId: conversation.conversation_id });
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('chatError', 'Could not initiate chat session.');
        }
    });

    // Event for sending message
    socket.on('sendMessage', async (data) => {
        const { roomId, content, senderBuyerId, senderStoreId, conversationId } = data;
        console.log(conversationId);

        try {
            // Save the message to the database
            const savedMessage = await saveChatMessage({ conversationId, senderBuyerId, senderStoreId, content });

            // Broadcast the message to all clients in the room
            io.to(roomId).emit('receiveMessage', savedMessage);

        } catch (error) {
            console.error('Error sending message:', error);
        }        

    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${(socket as any).id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});