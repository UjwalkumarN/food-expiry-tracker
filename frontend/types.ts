export enum Category {
  DAIRY = 'Dairy',
  FRUIT = 'Fruit',
  VEGETABLE = 'Vegetable',
  MEAT = 'Meat',
  PANTRY = 'Pantry',
  BEVERAGE = 'Beverage',
  FROZEN = 'Frozen',
  OTHER = 'Other'
}

export interface Product {
  id: string;
  name: string;
  barcode?: string;
  expiryDate: string; // ISO Date string
  quantity: number;
  category: Category;
  addedDate: string;
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  steps: string[];
  timeRequired: string;
  usedIngredients: string[]; // List of ingredients from inventory used
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  date: string;
  read: boolean;
}

export type SortField = 'expiryDate' | 'name' | 'addedDate';
export type SortOrder = 'asc' | 'desc';