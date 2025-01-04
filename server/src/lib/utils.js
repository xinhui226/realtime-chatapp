import jwt from 'jsonwebtoken';
import randomatic from 'randomatic';

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
}

export const generateUserId = () => {
    const letters = randomatic('a', 6); // Generate 6 random letters
    const numbers = randomatic('0', 4); // Generate 4 random digits
    return `${letters}${numbers}`;
};