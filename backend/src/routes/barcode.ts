import express, { Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Mock barcode database (in production, use a real API like Open Food Facts)
const MOCK_BARCODE_DB: Record<string, { name: string; category: string; daysToExpireEstimate: number }> = {
  '123456789': { name: 'Organic Milk', category: 'Dairy', daysToExpireEstimate: 7 },
  '987654321': { name: 'Whole Wheat Bread', category: 'Pantry', daysToExpireEstimate: 5 },
  '112233445': { name: 'Greek Yogurt', category: 'Dairy', daysToExpireEstimate: 14 },
  '556677889': { name: 'Chicken Breast', category: 'Meat', daysToExpireEstimate: 3 },
  '998877665': { name: 'Spinach', category: 'Vegetable', daysToExpireEstimate: 4 },
  '111222333': { name: 'Bananas', category: 'Fruit', daysToExpireEstimate: 5 },
  '444555666': { name: 'Tomatoes', category: 'Vegetable', daysToExpireEstimate: 7 },
  '777888999': { name: 'Eggs', category: 'Dairy', daysToExpireEstimate: 21 },
};

// Lookup product by barcode
router.get('/lookup/:barcode', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { barcode } = req.params;
    
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode required' });
    }
    
    // Check mock database
    const productInfo = MOCK_BARCODE_DB[barcode];
    
    if (productInfo) {
      // Calculate estimated expiry date
      const estimatedExpiry = new Date();
      estimatedExpiry.setDate(estimatedExpiry.getDate() + productInfo.daysToExpireEstimate);
      
      return res.json({
        found: true,
        product: {
          name: productInfo.name,
          category: productInfo.category,
          estimatedExpiryDate: estimatedExpiry.toISOString(),
          daysToExpireEstimate: productInfo.daysToExpireEstimate
        }
      });
    }
    
    // In production, you could call Open Food Facts API here
    // const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    res.json({
      found: false,
      message: 'Product not found in database'
    });
  } catch (error: any) {
    console.error('❌ Barcode lookup error:', error);
    res.status(500).json({ error: 'Barcode lookup failed' });
  }
});

export default router;

