import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import BarcodeScanner from '../components/BarcodeScanner';
import { Scan, Plus } from 'lucide-react';
import { Category, Product } from '../types';
import { MOCK_BARCODE_DB } from '../constants';
import { barcodeAPI } from '../services/apiService';

const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct, getProductByBarcode, updateProduct } = useInventory();
  const [isScanning, setIsScanning] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    quantity: 1,
    expiryDate: '',
    category: Category.OTHER
  });

  const handleScan = async (code: string) => {
    setIsScanning(false);
    
    // Check if item exists in inventory
    const existing = getProductByBarcode(code);
    if (existing) {
      if (window.confirm(`Item "${existing.name}" already exists. Update quantity?`)) {
        await updateProduct({ ...existing, quantity: existing.quantity + 1 });
        navigate('/inventory');
        return;
      }
    }

    // Lookup via API
    try {
      const result = await barcodeAPI.lookup(code);
      
      if (result.found && result.product) {
        setFormData(prev => ({
          ...prev,
          barcode: code,
          name: result.product!.name,
          category: result.product!.category as any,
          expiryDate: result.product!.estimatedExpiryDate.split('T')[0]
        }));
      } else {
        // Fallback to mock DB
        const mockInfo = MOCK_BARCODE_DB[code];
        if (mockInfo) {
          const estimatedExpiry = new Date();
          estimatedExpiry.setDate(estimatedExpiry.getDate() + mockInfo.daysToExpireEstimate);
          
          setFormData(prev => ({
            ...prev,
            barcode: code,
            name: mockInfo.name,
            category: mockInfo.category,
            expiryDate: estimatedExpiry.toISOString().split('T')[0]
          }));
        } else {
          setFormData(prev => ({ ...prev, barcode: code }));
          alert('Product not found in database. Please enter details manually.');
        }
      }
    } catch (error) {
      console.error('Barcode lookup failed:', error);
      // Fallback to mock DB
      const mockInfo = MOCK_BARCODE_DB[code];
      if (mockInfo) {
        const estimatedExpiry = new Date();
        estimatedExpiry.setDate(estimatedExpiry.getDate() + mockInfo.daysToExpireEstimate);
        
        setFormData(prev => ({
          ...prev,
          barcode: code,
          name: mockInfo.name,
          category: mockInfo.category,
          expiryDate: estimatedExpiry.toISOString().split('T')[0]
        }));
      } else {
        setFormData(prev => ({ ...prev, barcode: code }));
        alert('Product not found. Please enter details manually.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) return;

    const newProduct: Product = {
      id: Date.now().toString(), // Temporary ID, will be replaced by backend
      name: formData.name,
      barcode: formData.barcode,
      quantity: Number(formData.quantity),
      category: formData.category,
      expiryDate: new Date(formData.expiryDate).toISOString(),
      addedDate: new Date().toISOString()
    };

    try {
      await addProduct(newProduct);
      navigate('/inventory');
    } catch (error: any) {
      alert('Failed to add product: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Item</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="mb-6 flex gap-4">
          <button 
            type="button"
            onClick={() => setIsScanning(true)}
            className="flex-1 bg-slate-900 text-white p-4 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition"
          >
            <Scan className="w-5 h-5" />
            Scan Barcode
          </button>
          <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 p-4">
             Or type manually below
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Barcode (Optional)</label>
            <input 
              type="text" 
              value={formData.barcode}
              onChange={(e) => setFormData({...formData, barcode: e.target.value})}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              placeholder="Scanned code appears here"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              placeholder="e.g. Milk"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input 
                type="number" 
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                    {Object.values(Category).map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
            <input 
              type="date" 
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-600 text-white font-semibold py-3 rounded-lg hover:bg-brand-700 transition mt-6 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add to Inventory
          </button>
        </form>
      </div>

      {isScanning && (
        <BarcodeScanner 
          onScan={handleScan} 
          onClose={() => setIsScanning(false)} 
        />
      )}
    </div>
  );
};

export default AddItem;