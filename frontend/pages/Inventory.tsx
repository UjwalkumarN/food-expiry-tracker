import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Trash2, Edit2, Search, Filter, Download } from 'lucide-react';
import { Category, SortField, SortOrder } from '../types';
import { DAYS_UNTIL_CRITICAL, DAYS_UNTIL_WARNING } from '../constants';

const Inventory: React.FC = () => {
  const { products, removeProduct } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [sortField, setSortField] = useState<SortField>('expiryDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const getStatusColor = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'bg-red-100 text-red-700 border-red-200';
    if (diffDays <= DAYS_UNTIL_WARNING) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusText = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expired';
    if (diffDays <= DAYS_UNTIL_CRITICAL) return 'Expiring Soon';
    if (diffDays <= DAYS_UNTIL_WARNING) return 'Expiring This Week';
    return 'Fresh';
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => 
        (categoryFilter === 'All' || p.category === categoryFilter) &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode?.includes(searchTerm))
      )
      .sort((a, b) => {
        let compare = 0;
        if (sortField === 'expiryDate') {
          compare = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        } else if (sortField === 'name') {
          compare = a.name.localeCompare(b.name);
        } else {
            compare = new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
        }
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [products, categoryFilter, searchTerm, sortField, sortOrder]);

  const handleExport = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Expiry Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(p => [
        `"${p.name}"`,
        p.category,
        p.quantity,
        p.expiryDate.split('T')[0],
        getStatusText(p.expiryDate)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">My Inventory</h2>
        <button onClick={handleExport} className="flex items-center gap-2 text-sm text-brand-600 hover:bg-brand-50 px-3 py-2 rounded transition border border-brand-200">
            <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search items or barcode..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | 'All')}
          >
            <option value="All">All Categories</option>
            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
          >
            <option value="expiryDate">Sort by Expiry</option>
            <option value="name">Sort by Name</option>
            <option value="addedDate">Sort by Date Added</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Expiry Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        No items found.
                    </td>
                </tr>
              ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{product.name}</div>
                        {product.barcode && <div className="text-xs text-slate-400">{product.barcode}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{product.quantity}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(product.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.expiryDate)}`}>
                          {getStatusText(product.expiryDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                              try {
                                await removeProduct(product.id);
                              } catch (error) {
                                alert('Failed to delete product');
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-red-500 transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;