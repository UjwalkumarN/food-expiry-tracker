import express, { Request, Response } from 'express';
import { Product } from '../models/Food.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all products for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const products = await Product.find({ userId }).sort({ expiryDate: 1 });
    
    // Transform to match frontend format
    const formatted = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      barcode: p.barcode,
      category: p.category,
      quantity: p.quantity,
      expiryDate: p.expiryDate.toISOString(),
      addedDate: p.addedDate?.toISOString() || p.createdAt.toISOString(),
      image: p.image
    }));
    
    res.json(formatted);
  } catch (error: any) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get expired items
router.get('/expired', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const products = await Product.find({ 
      userId, 
      expiryDate: { $lt: today } 
    }).sort({ expiryDate: 1 });
    
    const formatted = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      barcode: p.barcode,
      category: p.category,
      quantity: p.quantity,
      expiryDate: p.expiryDate.toISOString(),
      addedDate: p.addedDate?.toISOString() || p.createdAt.toISOString(),
      image: p.image
    }));
    
    res.json(formatted);
  } catch (error: any) {
    console.error('❌ Get expired error:', error);
    res.status(500).json({ error: 'Failed to fetch expired items' });
  }
});

// Get expiring soon items (3, 5, 7 days)
router.get('/expiring-soon', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysFromNow = new Date();
    daysFromNow.setDate(daysFromNow.getDate() + 7);
    daysFromNow.setHours(23, 59, 59, 999);
    
    const products = await Product.find({ 
      userId, 
      expiryDate: { $gte: today, $lte: daysFromNow } 
    }).sort({ expiryDate: 1 });
    
    const formatted = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      barcode: p.barcode,
      category: p.category,
      quantity: p.quantity,
      expiryDate: p.expiryDate.toISOString(),
      addedDate: p.addedDate?.toISOString() || p.createdAt.toISOString(),
      image: p.image
    }));
    
    res.json(formatted);
  } catch (error: any) {
    console.error('❌ Get expiring soon error:', error);
    res.status(500).json({ error: 'Failed to fetch expiring items' });
  }
});

// Search products
router.get('/search', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const products = await Product.find({
      userId,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { barcode: { $regex: q, $options: 'i' } }
      ]
    });
    
    const formatted = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      barcode: p.barcode,
      category: p.category,
      quantity: p.quantity,
      expiryDate: p.expiryDate.toISOString(),
      addedDate: p.addedDate?.toISOString() || p.createdAt.toISOString(),
      image: p.image
    }));
    
    res.json(formatted);
  } catch (error: any) {
    console.error('❌ Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Create product
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, barcode, category, quantity, expiryDate, addedDate } = req.body;
    const userId = req.user?.userId;
    
    if (!name || !category || !expiryDate) {
      return res.status(400).json({ error: 'Name, category, and expiry date are required' });
    }
    
    const product = new Product({ 
      name, 
      barcode, 
      category, 
      quantity: quantity || 1, 
      expiryDate: new Date(expiryDate),
      addedDate: addedDate ? new Date(addedDate) : new Date(),
      userId 
    });
    
    await product.save();
    
    res.status(201).json({
      id: product._id.toString(),
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      quantity: product.quantity,
      expiryDate: product.expiryDate.toISOString(),
      addedDate: product.addedDate?.toISOString() || product.createdAt.toISOString(),
      image: product.image
    });
  } catch (error: any) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, barcode, category, quantity, expiryDate } = req.body;
    
    const product = await Product.findOne({ _id: req.params.id, userId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (name) product.name = name;
    if (barcode !== undefined) product.barcode = barcode;
    if (category) product.category = category;
    if (quantity !== undefined) product.quantity = quantity;
    if (expiryDate) product.expiryDate = new Date(expiryDate);
    
    await product.save();
    
    res.json({
      id: product._id.toString(),
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      quantity: product.quantity,
      expiryDate: product.expiryDate.toISOString(),
      addedDate: product.addedDate?.toISOString() || product.createdAt.toISOString(),
      image: product.image
    });
  } catch (error: any) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const product = await Product.findOneAndDelete({ _id: req.params.id, userId });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
