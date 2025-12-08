import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { generateRecipes } from '../services/geminiService';
import { Recipe } from '../types';
import { ChefHat, Clock, AlertTriangle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { DAYS_UNTIL_WARNING } from '../constants';

const Recipes: React.FC = () => {
  const { products } = useInventory();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const expiringCount = products.filter(p => {
    const diff = new Date(p.expiryDate).getTime() - Date.now();
    return diff > 0 && diff < (DAYS_UNTIL_WARNING + 2) * 24 * 60 * 60 * 1000;
  }).length;

  const handleGenerate = async () => {
    if (products.length === 0) {
        setError("Your inventory is empty. Add items to get suggestions.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateRecipes(products);
      setRecipes(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate recipes. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRecipe(expandedRecipe === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
          <ChefHat className="w-10 h-10 text-brand-600" />
          AI Chef
        </h2>
        <p className="text-slate-600 max-w-lg mx-auto">
          Let AI suggest personalized recipes based on your inventory. 
          We prioritize ingredients that are expiring soon to reduce waste.
        </p>
        
        {expiringCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-200">
                <AlertTriangle className="w-4 h-4" />
                You have {expiringCount} items expiring soon!
            </div>
        )}

        <div className="pt-4">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-brand-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Recipe Suggestions'}
          </button>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mt-4 text-sm border border-red-100">
                {error}
            </div>
        )}
      </div>

      <div className="grid gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
            <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleExpand(recipe.id)}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                             }`}>
                                {recipe.difficulty}
                             </span>
                             <span className="flex items-center gap-1 text-slate-500 text-xs">
                                <Clock className="w-3 h-3" /> {recipe.timeRequired}
                             </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{recipe.name}</h3>
                        <div className="text-sm text-slate-500">
                            Uses: <span className="font-medium text-brand-600">{recipe.usedIngredients.join(', ')}</span>
                        </div>
                    </div>
                    <button className="text-slate-400">
                        {expandedRecipe === recipe.id ? <ChevronUp /> : <ChevronDown />}
                    </button>
                </div>
            </div>

            {expandedRecipe === recipe.id && (
                <div className="px-6 pb-6 border-t border-slate-100 pt-4 bg-slate-50/50">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-2">Ingredients</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                                {recipe.ingredients.map((ing, i) => (
                                    <li key={i}>{ing}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-2">Instructions</h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                                {recipe.steps.map((step, i) => (
                                    <li key={i} className="pl-2 -indent-2 ml-2">{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recipes;