import Product from '../models/productModel.js';

// 🟢 GET ALL PRODUCTS (With Pagination)
export const getAllProducts = async (req, res) => {
    try {
        const pageSize = 4; // Ek page par kitne products dikhane hain
        const page = Number(req.query.pageNumber) || 1; 

        // Database mein total kitne products hain, unka count
        const count = await Product.countDocuments({}); 

        // Products fetch karein pagination ke sath
        const products = await Product.find({})
            .limit(pageSize) 
            .skip(pageSize * (page - 1)); 

        // Response mein products ke sath page info bhi bhejen
        return res.status(200).json({
            success: true,
            products,
            page, 
            pages: Math.ceil(count / pageSize), 
            totalProducts: count 
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Server Error: Unable to fetch products', 
            error: error.message 
        });
    }
};

// 🟢 GET SINGLE PRODUCT BY ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Invalid Product ID or Server Error" });
    }
};

// 🔴 CREATE NEW PRODUCT (Admin Only - Multer Integrated)
export const createProduct = async (req, res) => {
    try {
        // 🌟 1. Text fields ko req.body se nikala
        const { name, price, description, category, stock } = req.body;

        // Validation: Zaroori fields check karein
        if (!name || !price || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, Price, and Category are required fields' 
            });
        }

        // 🌟 2. Check karein ke Multer ne file successfully receive ki ya nahi
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Product image file is required'
            });
        }

        // 🌟 3. FIX: File ke path se 'src/' ko remove kiya aur forward slashes lagaye
        // Taake database mein hamesha "uploads/filename.jpg" save ho
        let imagePath = req.file.path.replace(/\\/g, "/"); // Windows backslash fix
        if (imagePath.startsWith('src/')) {
            imagePath = imagePath.replace('src/', ''); // Agar 'src/' shuru mein ho toh remove kardein
        }

        // 🌟 4. Database mein product create kiya
        const product = await Product.create({
            name,
            price: Number(price), // String ko number mein convert kiya
            category,
            image: imagePath, // 🔥 Ab database mein saaf "uploads/xyz.jpg" save hoga
            description: description || '', 
            stock: Number(stock) || 0, 
            user: req.user._id // Protect middleware se aane wali login user ID
        });

        // 🎉 Success Response
        return res.status(201).json({ 
            success: true, 
            message: 'Product created successfully! 🎉', 
            data: product 
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to create product',
            error: error.message 
        });
    }
};