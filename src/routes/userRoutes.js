// src/routes/userRoutes.js
import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// ✅ BILKUL SAHI: Sirf path aur controller function. Koi 'protect' nahi!
router.post('/register', registerUser); 
router.post('/login', loginUser);

// ❌ GALAT (Agar aisa hai toh error aayega):
// router.post('/register', protect, registerUser); // Register par token ki zaroorat nahi hoti!

export default router;