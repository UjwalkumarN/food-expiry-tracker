import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Product, Notification } from '../types';
import * as storage from '../services/storageService';

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  refreshInventory: () => Promise<void>;
  notifications: Notification[];
  unreadNotificationsCount: number;
  clearNotifications: () => void;
  getProductByBarcode: (barcode: string) => Product | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshInventory = useCallback(async () => {
    try {
      const loaded = await storage.getProducts();
      setProducts(loaded);
      
      // Fetch notifications from API
      const notifs = await storage.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to refresh inventory:', error);
    }
  }, []);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  const addProduct = async (product: Product) => {
    try {
      await storage.saveProduct(product);
      await refreshInventory();
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      await storage.saveProduct(product);
      await refreshInventory();
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await storage.deleteProduct(id);
      await refreshInventory();
    } catch (error) {
      console.error('Failed to remove product:', error);
      throw error;
    }
  };

  const getProductByBarcode = (barcode: string) => {
    return products.find(p => p.barcode === barcode);
  };

  const clearNotifications = () => {
    // Notifications are read-only from server, just refresh
    refreshInventory();
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <InventoryContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      removeProduct,
      refreshInventory,
      notifications,
      unreadNotificationsCount,
      clearNotifications,
      getProductByBarcode
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within InventoryProvider");
  return context;
};