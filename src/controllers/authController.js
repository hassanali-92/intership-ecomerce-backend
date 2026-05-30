import User from '../models/userModel.js'; 
import jwt from 'jsonwebtoken';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ 
            name, 
            email, 
            password, 
            role: 'user' 
        });

        if (user) {
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ 
                message: 'Access Denied. Admins must log in through the Admin Portal.' 
            });
        }

        if (await user.matchPassword(password)) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// ========================================================
// 🛠️ FIXED ADMIN REGISTER (Safe for Live Deployment)
// ========================================================
export const registerAdmin = async (req, res) => {
    try {
        const { name, identifier, password, email } = req.body;

        // 🔥 PATCH: Agar frontend se sirf 'identifier' aaya hai (jo ke email hai), toh use email variable mein set karein
        const adminEmail = email || identifier;

        if (!adminEmail) {
            return res.status(400).json({ message: "Admin Email or Identifier is required." });
        }

        // 1. Security Lock: Check if any admin already exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(403).json({ message: "Registration Locked. Admin already exists." });
        }

        // 2. Email Duplicate Check (Using safe adminEmail variable)
        const emailExists = await User.findOne({ email: adminEmail });
        if (emailExists) {
            return res.status(400).json({ 
                message: "This email is already registered. Please use a unique email for admin." 
            });
        }

        // 3. Create Admin
        const newAdmin = new User({
            name,
            email: adminEmail, // Safe assignment
            identifier: identifier || adminEmail,
            password, 
            role: 'admin',
            isApproved: true
        });

        await newAdmin.save();

        return res.status(201).json({
            message: "Admin Created Successfully! Auto-logging you in...",
            _id: newAdmin._id,
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role,
            token: generateToken(newAdmin._id), 
        });

    } catch (error) {
        console.error("Register Admin Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// ========================================================
// 🛠️ FIXED ADMIN LOGIN (Safe for Live Deployment)
// ========================================================
export const loginAdmin = async (req, res) => {
    try {
        const { email, identifier, password } = req.body;
        
        const loginQuery = email || identifier;

        if (!loginQuery) {
            return res.status(400).json({ message: 'Please provide an email or admin identifier.' });
        }

        const user = await User.findOne({
            $or: [
                { email: loginQuery },
                { identifier: loginQuery }
            ]
        });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access Denied! Invalid Admin Credentials.' 
            });
        }

        if (await user.matchPassword(password)) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            return res.status(401).json({ message: 'Access Denied! Invalid Admin Credentials.' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
