import express from 'express';
import { 
    registerUser, 
    loginUser, 
    registerAdmin, 
    loginAdmin 
} from '../controllers/authController.js';

const router = express.Router();

// User Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Admin Routes
router.post('/register-admin', registerAdmin);
router.post('/login-admin', loginAdmin);

export default router;