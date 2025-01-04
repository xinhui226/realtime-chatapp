import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
  try {

    let errorFields = [];
    if (!name) errorFields.push("name");
    if (!email) errorFields.push("email");
    if (!password) errorFields.push("password");

    if (errorFields.length > 0) {
        return res.status(400).json({ message: `Missing field(s): ${errorFields.join(", ")}` });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    if (user) {
        generateToken(user._id, res);
        await user.save();
        res.status(201).json({ 
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            message: "User created successfully" 
        });
    } else {
        res.status(400).json({ message: "Failed to create user" });
    }
  } catch (error) {
    console.error("Error in signup controller " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Missing field(s): " + (!email && !password ? "email, password" : !email ? "email" : "password") });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid credential" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credential" });
        }

        generateToken(user._id, res);
        res.status(200).json({ 
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            message: "Login successfully" 
        });
    } catch (error) {
        console.error("Error in login controller " + error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller " + error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id

        if(!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadRes = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadRes.secure_url }, { new: true });

        // req.user = updatedUser;

        res.status(200).json({ 
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePic: updatedUser.profilePic,
            message: "Profile updated successfully" 
        });
    } catch (error) {
        console.error("Error in updateProfile controller " + error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error in checkAuth controller " + error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}