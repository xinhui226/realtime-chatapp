import cloudinary from "../lib/cloudinary.js";
import { io, getUserSocketId } from "../lib/socketio.js";
import { generateToken, generateUserId } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const generateUniqueUserId = async () => {
    let userId;
    let existedUserId;

    do {
        userId = generateUserId();
        existedUserId = await User.findOne({ userId });
    } while (existedUserId);

    return userId;
}

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

    let userId = await generateUniqueUserId();

    const user = await User.create({ name, email, password: hashedPassword, userId });

    if (user) {
        generateToken(user._id, res);
        await user.save();
        res.status(201).json({ 
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            friends: user.friends,
            userId: user.userId,
            createdAt: user.createdAt,
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
            friends: user.friends,
            userId: user.userId,
            createdAt: user.createdAt,
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
        const { _id: user_id, userId: prevUserId, name: prevName } = req.user;
        let updatedUser;

        if(req.body.profilePic) {
            const uploadRes = await cloudinary.uploader.upload(req.body.profilePic)
            updatedUser = await User.findByIdAndUpdate(user_id, { profilePic: uploadRes.secure_url }, { new: true });
        } else {
            const { userId, name } = req.body
            const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
            const updateBody = {}

            if (userId && userId != prevUserId) {
                if(!regex.test(userId)) {
                    return res.status(400).json({ message: "Invalid format field userId" });
                }
                const existUserId = await User.findOne({userId})
                
                if (existUserId) {
                    return res.status(400).json({ message: "User id already existed, please try another" });
                }

                updateBody["userId"] = userId
            }
            if (name && name != prevName) {
                updateBody["name"] = name
            }

            updatedUser = await User.findByIdAndUpdate(user_id, updateBody, { new: true });
        }

        res.status(200).json({ 
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePic: updatedUser.profilePic,
            friends: updatedUser.friends,
            userId: updatedUser.userId,
            createdAt: updatedUser.createdAt,
            message: "Profile updated successfully" 
        });
    } catch (error) {
        console.error("Error in updateProfile controller " + error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateFriends = async (req, res) => {
    try {
        const { targetUserId, action } = req.body
        const user = req.user

        const foundUser = await User.findOne({userId: targetUserId})

        if (!foundUser || targetUserId == user.userId) return res.status(400).json({ message: "Something wrong, please make sure that user id is correct"})
        
        let userUpdateBody, friendUpdateBody;

        if (action === 'add') {
            if (!user.friends.includes(foundUser._id)) {
                userUpdateBody = { $addToSet: { friends: foundUser._id } }; 
                friendUpdateBody = { $addToSet: { friends: user._id } }; 
            } else {
                return res.status(400).json({ message: "You're already friends with the user!" });
            }
        } else if (action === 'remove') {
            userUpdateBody = { $pull: { friends: foundUser._id } }; 
            friendUpdateBody = { $pull: { friends: user._id } }; 
        } else {
            return res.status(400).json({ message: "Invalid action." });
        }

        const [updatedUser, updatedFriend] = await Promise.all([
            User.findByIdAndUpdate(user._id, userUpdateBody, { new: true }),
            User.findByIdAndUpdate(foundUser._id, friendUpdateBody, { new: true }),
        ]);

        const targetSocketId = getUserSocketId(foundUser._id);
        const userSocketId = getUserSocketId(user._id);

        if (targetSocketId) {
            io.to(targetSocketId).emit('friendsUpdated', action === 'remove' ? user._id : null);
        }
        if (userSocketId) {
            io.to(userSocketId).emit("friendsUpdated", action === 'remove' ? foundUser._id : null);
        }

        res.status(200).json({ 
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePic: updatedUser.profilePic,
            friends: updatedUser.friends,
            userId: updatedUser.userId,
            createdAt: updatedUser.createdAt
        });
    } catch (error) {
        console.error("Error in updateFriend controller" + error.message);
        res.status(500).json({ error: "Internal server error" })
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