import express, { Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { Product } from '../models/Food.js';

const router = express.Router();

// Get notifications for user (expired and expiring soon items)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const products = await Product.find({ userId }).sort({ expiryDate: 1 });
    
    const notifications: any[] = [];
    
    products.forEach(product => {
      const expiry = new Date(product.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let type: 'info' | 'warning' | 'critical' | null = null;
      let title = '';
      let message = '';
      
      if (diffDays <= 0) {
        type = 'critical';
        title = 'Item Expired';
        message = `${product.name} has expired on ${expiry.toISOString().split('T')[0]}.`;
      } else if (diffDays <= 1) {
        type = 'critical';
        title = 'Expiring Tomorrow';
        message = `${product.name} expires in ${diffDays} day(s).`;
      } else if (diffDays <= 3) {
        type = 'warning';
        title = 'Expiring Soon';
        message = `${product.name} expires in ${diffDays} days.`;
      }
      
      if (type) {
        notifications.push({
          id: `${product._id}-${today.toDateString()}`,
          title,
          message,
          type,
          date: new Date().toISOString(),
          read: false,
          productId: product._id.toString()
        });
      }
    });
    
    res.json(notifications);
  } catch (error: any) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

export default router;

