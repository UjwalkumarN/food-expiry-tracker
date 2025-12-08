import cron from 'node-cron';
import { Product } from '../models/Food.js';

// Run daily at 9 AM to check expiry dates
export const startExpiryChecker = () => {
  console.log('⏰ Starting expiry checker cron job (runs daily at 9 AM)');
  
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('🔍 Checking expiry dates...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find expired items
      const expired = await Product.find({
        expiryDate: { $lt: today }
      }).populate('userId', 'email name');
      
      // Find items expiring in 3, 5, 7 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      threeDaysFromNow.setHours(23, 59, 59, 999);
      
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
      fiveDaysFromNow.setHours(23, 59, 59, 999);
      
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      sevenDaysFromNow.setHours(23, 59, 59, 999);
      
      const expiringSoon = await Product.find({
        expiryDate: { $gte: today, $lte: sevenDaysFromNow }
      }).populate('userId', 'email name');
      
      console.log(`📊 Found ${expired.length} expired items and ${expiringSoon.length} items expiring soon`);
      
      // In production, you could send email notifications here
      // For now, notifications are fetched via API when user logs in
      
    } catch (error: any) {
      console.error('❌ Expiry checker error:', error);
    }
  });
  
  // Also run on server start for immediate check
  console.log('🔍 Running initial expiry check...');
  (async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const expired = await Product.countDocuments({
        expiryDate: { $lt: today }
      });
      
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      sevenDaysFromNow.setHours(23, 59, 59, 999);
      
      const expiringSoon = await Product.countDocuments({
        expiryDate: { $gte: today, $lte: sevenDaysFromNow }
      });
      
      console.log(`📊 Current status: ${expired} expired, ${expiringSoon} expiring soon`);
    } catch (error: any) {
      console.error('❌ Initial expiry check error:', error);
    }
  })();
};

