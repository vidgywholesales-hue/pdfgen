const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
// Increase limit for base64 image uploads
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/shreeji-ecom')
  .then(() => console.log('Connected to MongoDB (shreeji-ecom)'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, status, image } = req.body;
    
    if (!name || !price || !image) {
      return res.status(400).json({ message: 'Name, price, and image are required.' });
    }

    const newProduct = new Product({
      name,
      price: Number(price),
      status: status || 'IN STOCK',
      image
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
