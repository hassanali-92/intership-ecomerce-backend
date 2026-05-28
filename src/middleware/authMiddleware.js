import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// 1. Checks if the user is logged in
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Decode token to get user ID
            const decoded = jwt.verify(token, process.env.JWT_TOKEN);

            // Fetch user from database and attach to request object
            req.user = await User.findById(decoded.id).select('-password');

            return next(); // Proceed to the next middleware or controller
        } catch (error) {
            console.error("Auth Error:", error.message);
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized, token failed or expired' 
            });
        }
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized, no token provided' 
        });
    }
};

// 2. Checks if the logged-in user is an Admin
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next(); 
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied! Only admins are allowed to perform this action.' 
        });
    }
};