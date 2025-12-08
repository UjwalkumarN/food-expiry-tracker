// This file is kept for backward compatibility but now uses API calls
// All functions now delegate to apiService
import { Product, User, Notification } from '../types';
import { authAPI, productAPI, notificationAPI } from './apiService';

// Auth functions - now use API
export const loginUser = async (email: string): Promise<User> => {
  const { user } = await authAPI.login(email);
  return user;
};

export const logoutUser = () => {
  authAPI.logout();
};

export const getStoredUser = (): User | null => {
  return authAPI.getCurrentUser();
};

// Product functions - now use API
export const getProducts = async (): Promise<Product[]> => {
  try {
    return await productAPI.getAll();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

export const saveProduct = async (product: Product): Promise<Product[]> => {
  try {
    if (product.id && product.id.match(/^\d+$/)) {
      // New product (temporary ID from frontend)
      const created = await productAPI.create({
        name: product.name,
        barcode: product.barcode,
        category: product.category,
        quantity: product.quantity,
        expiryDate: product.expiryDate,
        addedDate: product.addedDate,
        image: product.image
      });
      return await productAPI.getAll();
    } else {
      // Update existing product
      await productAPI.update(product.id, product);
      return await productAPI.getAll();
    }
  } catch (error) {
    console.error('Failed to save product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<Product[]> => {
  try {
    await productAPI.delete(id);
    return await productAPI.getAll();
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw error;
  }
};

// Notification functions - now use API
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    return await notificationAPI.getAll();
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
};

export const saveNotification = async (notification: Notification): Promise<Notification[]> => {
  // Notifications are now generated server-side, so this is a no-op
  return await getNotifications();
};

export const markNotificationsRead = async (): Promise<Notification[]> => {
  // Notifications are read-only from server, return current list
  return await getNotifications();
};