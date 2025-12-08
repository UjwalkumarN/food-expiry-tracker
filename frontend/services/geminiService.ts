// This service now delegates to the backend API
import { Product, Recipe } from "../types";
import { recipeAPI } from "./apiService";

export const generateRecipes = async (products: Product[]): Promise<Recipe[]> => {
  // The backend handles the AI integration
  // We just call the API endpoint
  try {
    return await recipeAPI.suggest();
  } catch (error: any) {
    console.error("Recipe API Error:", error);
    throw new Error(error.message || "Failed to generate recipes. Please check your API key configuration.");
  }
};