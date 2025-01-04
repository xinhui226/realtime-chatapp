import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socketio.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => { 
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getUsersForSidebar controller " + error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { user_id: chat_user_id } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({ 
            $or: [
                { senderId: myId, receiverId: chat_user_id }, 
                { senderId: chat_user_id, receiverId: myId }
            ] 
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller " + error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { user_id: receiverId } = req.params;
        const { text, image } = req.body;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadRes = await cloudinary.uploader.upload(image);
            imageUrl = uploadRes.secure_url;
        }

        const newMessage = new Message({ senderId, receiverId, text, image: imageUrl });
        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller " + error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}