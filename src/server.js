import express from 'express';
import dotenv from 'dotenv';
import path from 'path'; // 🌟 1. Path module import kiya
import { fileURLToPath } from 'url'; // 🌟 2. ES Modules mein __dirname use karne ke liye
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();

// 🌟 3. ES Modules ke liye __dirname configure kiya
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
// 🌟 Purane app.use(cors({...})) ko is se replace karein
app.use(cors({
    origin: function (origin, callback) {
        // Sab origins ko allow karne ke liye (Localhost aur live Vercel dono chalenge)
        if (!origin || origin.startsWith('https://intership-ecomerce-frontend-b11n.vercel.app/') || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            // Deploy hone ke baad secure rakhne ke liye aap direct '*' ya sab allow bhi kar sakte hain temporary:
            callback(null, true); 
        }
    },
    credentials: true
}));

// 🌟 4. FIX: Uploads folder ko static banaya taake browser mein images open ho sakein
// Kyunki aapka server.js 'src' folder ke andar hai, aur uploads folder 'src' ke bahar (root) par hai, toh hum '../uploads' use karenge.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Simple Error Handler
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
