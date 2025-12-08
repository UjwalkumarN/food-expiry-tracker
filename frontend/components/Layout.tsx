import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  List, 
  PlusCircle, 
  ChefHat, 
  LogOut, 
  Menu, 
  X,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications, unreadNotificationsCount, clearNotifications } = useInventory();
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Inventory', path: '/inventory', icon: List },
    { label: 'Add Item', path: '/add', icon: PlusCircle },
    { label: 'AI Recipes', path: '/recipes', icon: ChefHat },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b z-20 flex justify-between items-center p-4">
        <h1 className="text-xl font-bold text-brand-600 flex items-center gap-2">
           FreshGuard
        </h1>
        <div className="flex items-center gap-4">
           <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
              <Bell className="w-6 h-6 text-slate-600" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
           </button>
           <button onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-10 w-64 bg-white border-r h-full flex flex-col transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        pt-16 md:pt-0
      `}>
        <div className="p-6 border-b hidden md:flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-600">FreshGuard</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-brand-50 text-brand-600 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t bg-slate-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full relative pt-16 md:pt-0">
         {/* Desktop Header for Notifications */}
         <header className="hidden md:flex justify-end p-4 bg-white border-b sticky top-0 z-10">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="p-2 hover:bg-slate-100 rounded-full relative transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                 {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl border rounded-lg overflow-hidden z-50">
                  <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button onClick={clearNotifications} className="text-xs text-brand-600 hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-sm">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-3 border-b text-sm ${!n.read ? 'bg-blue-50' : 'bg-white'}`}>
                          <div className="flex gap-2">
                            <span className={`w-2 h-2 mt-1.5 rounded-full ${
                              n.type === 'critical' ? 'bg-red-500' : n.type === 'warning' ? 'bg-orange-400' : 'bg-blue-400'
                            }`} />
                            <div>
                              <p className="font-medium text-slate-800">{n.title}</p>
                              <p className="text-slate-500 text-xs">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{new Date(n.date).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
         </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;