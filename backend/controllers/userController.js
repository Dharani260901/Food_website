import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// 1️⃣ MOVE THIS TO THE TOP
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

// 2️⃣ LOGIN USER
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        
        // Ensure success is true and user object is sent
        res.json({ 
            success: true, 
            token, 
            user: { name: user.name } 
        });

    } catch (error) {
        console.log("LOGIN ERROR:", error); // Check your terminal/cmd for this log
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

// 3️⃣ REGISTER USER
export const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({ 
            success: true, 
            token, 
            user: { name: user.name } 
        });

    } catch (error) {
        console.log("REGISTER ERROR:", error); // Check your terminal/cmd for this log
        res.status(500).json({ success: false, message: "Server Error" });
    }
}