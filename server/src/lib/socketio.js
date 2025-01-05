import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import dotenv from 'dotenv';

const app = express();
const server = http.createServer(app);

dotenv.config();

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
    },
});

export function getUserSocketId(userId) {
    return userSocketMap[userId];
}

const userSocketMap = {};

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
    }
    
    // used to send events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('A user disconnected', socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, server, app };