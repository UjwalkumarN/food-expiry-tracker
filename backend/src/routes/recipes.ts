import express, { Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { Product } from '../models/Food.js';

const router = express.Router();

// AI Recipe Suggestion API
router.post('/suggest', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    // Get user's inventory
    const products = await Product.find({ userId });
    
    if (products.length === 0) {
      return res.status(400).json({ error: 'Your inventory is empty. Add items to get suggestions.' });
    }
    
    // Filter valid products (not expired more than 1 day ago)
    const validProducts = products.filter(p => {
      const diff = p.expiryDate.getTime() - Date.now();
      return diff > -24 * 60 * 60 * 1000; // Allow items expired less than 1 day ago
    });
    
    if (validProducts.length === 0) {
      return res.json([]);
    }
    
    // Create inventory list for AI
    const inventoryList = validProducts.map(p => 
      `${p.name} (Expires: ${p.expiryDate.toISOString().split('T')[0]})`
    ).join(', ');
    
    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    let recipes: any[] = [];
    
    if (geminiApiKey) {
      // Use Gemini API
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        
        const prompt = `Here is my current food inventory:
${inventoryList}

Suggest 3 distinct recipes I can make. Prioritize ingredients that are expiring soonest.
You can assume I have basic pantry staples like oil, salt, pepper, and water.

Return ONLY a valid JSON array of recipes in this exact format:
[
  {
    "id": "recipe-1",
    "name": "Recipe Name",
    "ingredients": ["ingredient1", "ingredient2"],
    "steps": ["step1", "step2"],
    "timeRequired": "30 minutes",
    "usedIngredients": ["ingredient from inventory"],
    "difficulty": "Easy"
  }
]

Each recipe must have: id, name, ingredients (array), steps (array), timeRequired, usedIngredients (array), difficulty (Easy/Medium/Hard).`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          recipes = JSON.parse(jsonMatch[0]);
        }
      } catch (error: any) {
        console.error('Gemini API error:', error);
        // Fall through to fallback
      }
    } else if (openaiApiKey) {
      // Use OpenAI API
      try {
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: openaiApiKey });
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a smart kitchen assistant. Return ONLY valid JSON arrays of recipes.'
            },
            {
              role: 'user',
              content: `Here is my current food inventory:
${inventoryList}

Suggest 3 distinct recipes I can make. Prioritize ingredients that are expiring soonest.
Return a JSON array with this format:
[{
  "id": "recipe-1",
  "name": "Recipe Name",
  "ingredients": ["ingredient1"],
  "steps": ["step1"],
  "timeRequired": "30 minutes",
  "usedIngredients": ["inventory item"],
  "difficulty": "Easy"
}]`
            }
          ],
          response_format: { type: 'json_object' }
        });
        
        const content = completion.choices[0].message.content;
        if (content) {
          const parsed = JSON.parse(content);
          recipes = Array.isArray(parsed.recipes) ? parsed.recipes : Array.isArray(parsed) ? parsed : [];
        }
      } catch (error: any) {
        console.error('OpenAI API error:', error);
        // Fall through to fallback
      }
    }
    
    // Fallback: Generate simple recipes if no API available
    if (recipes.length === 0) {
      const expiringItems = validProducts
        .filter(p => {
          const diff = p.expiryDate.getTime() - Date.now();
          return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
        })
        .slice(0, 3);
      
      recipes = expiringItems.map((item, index) => ({
        id: `recipe-${Date.now()}-${index}`,
        name: `Quick ${item.name} Recipe`,
        ingredients: [item.name, 'Salt', 'Pepper', 'Oil'],
        steps: [
          `Prepare ${item.name}`,
          'Season with salt and pepper',
          'Cook until done',
          'Serve hot'
        ],
        timeRequired: '20 minutes',
        usedIngredients: [item.name],
        difficulty: 'Easy'
      }));
    }
    
    // Ensure unique IDs
    recipes = recipes.map((r, index) => ({
      ...r,
      id: r.id || `recipe-${Date.now()}-${index}`
    }));
    
    res.json(recipes);
  } catch (error: any) {
    console.error('❌ Recipe suggestion error:', error);
    res.status(500).json({ error: 'Failed to generate recipe suggestions' });
  }
});

export default router;

