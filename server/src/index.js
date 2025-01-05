import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import path from "path";

import { connectDB } from './lib/db.js';
import { server, app } from './lib/socketio.js';

import authRoute from './routes/auth.route.js';
import messageRoute from './routes/message.route.js';

dotenv.config();

const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use("/api/auth", authRoute)
app.use("/api/message", messageRoute)

if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../client/dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"))
  })
}

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  connectDB()
});