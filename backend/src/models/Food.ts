import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: { type: String, required: true },
  barcode: { type: String },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  expiryDate: { type: Date, required: true },
  addedDate: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String },
}, {
  timestamps: true
});

export const Product = model('Product', productSchema);
