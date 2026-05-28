import express from 'express';
import multer from 'multer';
import path from 'path';
import { getAllProducts, getProductById, createProduct } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📂 1. Multer Storage Configuration (Files kahan aur kis naam se save hongi)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure karein ke backend ke root folder mein 'uploads' naam ka folder bana ho
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // unique file name generate karega
  }
});

// File Filter (Sirf valid images accept karne ke liye)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer initialize kiya
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5MB file size
});


// 🟢 Public Routes (Inhein koi bhi dekh sakta hai)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// 🔴 Restricted Route (Pehle login check -> phir admin check -> phir multer file parse karega -> phir product banega)
// 🌟 FIX: upload.single('image') ko yahan controllers se bilkul pehle add kar diya hai
router.post('/create', protect, admin, upload.single('image'), createProduct); 

export default router;