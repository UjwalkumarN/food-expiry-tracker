import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { DAYS_UNTIL_WARNING, DAYS_UNTIL_CRITICAL } from '../constants';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { products } = useInventory();
  const navigate = useNavigate();

  // Calculate Stats
  const today = new Date();
  let expired = 0;
  let expiringSoon = 0;
  let fresh = 0;

  products.forEach(p => {
    const exp = new Date(p.expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) expired++;
    else if (diffDays <= DAYS_UNTIL_WARNING) expiringSoon++;
    else fresh++;
  });

  const total = products.length;

  const pieData = [
    { name: 'Fresh', value: fresh, color: '#22c55e' }, // Green
    { name: 'Expiring Soon', value: expiringSoon, color: '#f59e0b' }, // Yellow/Orange
    { name: 'Expired', value: expired, color: '#ef4444' }, // Red
  ];

  // Category Data
  const categoryDataMap: Record<string, number> = {};
  products.forEach(p => {
    categoryDataMap[p.category] = (categoryDataMap[p.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryDataMap).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <button onClick={() => navigate('/add')} className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm">
            + Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Fresh Items</p>
            <p className="text-3xl font-bold text-slate-800">{fresh}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Expiring Soon</p>
            <p className="text-3xl font-bold text-slate-800">{expiringSoon}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Expired</p>
            <p className="text-3xl font-bold text-slate-800">{expired}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[350px]">
          <h3 className="text-lg font-semibold mb-6">Inventory Health</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[350px]">
          <h3 className="text-lg font-semibold mb-6">Items by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
              <YAxis allowDecimals={false}/>
              <Tooltip cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;