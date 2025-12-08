import { Category, Product } from './types';

export const DAYS_UNTIL_WARNING = 3; // Yellow
export const DAYS_UNTIL_CRITICAL = 1; // Red

// Mock database for barcode lookup
export const MOCK_BARCODE_DB: Record<string, { name: string; category: Category; daysToExpireEstimate: number }> = {
  '123456789': { name: 'Organic Milk', category: Category.DAIRY, daysToExpireEstimate: 7 },
  '987654321': { name: 'Whole Wheat Bread', category: Category.PANTRY, daysToExpireEstimate: 5 },
  '112233445': { name: 'Greek Yogurt', category: Category.DAIRY, daysToExpireEstimate: 14 },
  '556677889': { name: 'Chicken Breast', category: Category.MEAT, daysToExpireEstimate: 3 },
  '998877665': { name: 'Spinach', category: Category.VEGETABLE, daysToExpireEstimate: 4 },
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Milk',
    barcode: '123456789',
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 2 days
    quantity: 1,
    category: Category.DAIRY,
    addedDate: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Eggs',
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    quantity: 12,
    category: Category.DAIRY,
    addedDate: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Avocado',
    expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    quantity: 2,
    category: Category.VEGETABLE,
    addedDate: new Date().toISOString(),
  }
];