import { Schema, model } from 'mongoose';

const foodItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, default: 'Other' },
  expiryDate: { type: Date, required: true },
  barcodeValue: { type: String },
  productInfo: { type: Object, default: null },
  status: { type: String, enum: ['fresh', 'expiring_soon', 'expired'], default: 'fresh' },
  location: { type: String, default: 'Fridge' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const FoodItem = model('FoodItem', foodItemSchema);
