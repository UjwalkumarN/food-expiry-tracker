import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await login(email);
      } catch (error: any) {
        alert('Login failed: ' + (error.message || 'Unknown error'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-brand-600 p-8 text-center">
           <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Leaf className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-3xl font-bold text-white mb-2">FreshGuard</h1>
           <p className="text-brand-100">Smart Food Inventory & Waste Reduction</p>
        </div>
        
        <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Welcome Back</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        placeholder="you@example.com"
                    />
                </div>
                
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition shadow-lg disabled:opacity-70"
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                    For demo purposes, any email works. No password required.
                </p>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Login;