import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { User } from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log('📝 Register request:', req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password });
    await user.save();
    console.log('✅ User created:', user._id);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error: any) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Login request:', req.body);
    const { email, password } = req.body;

    // Support email-only login for demo (as frontend expects)
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    let user = await User.findOne({ email });
    
    // Auto-create user if doesn't exist (demo mode)
    if (!user) {
      const name = email.split('@')[0];
      user = new User({ 
        name, 
        email, 
        password: await bcryptjs.hash('demo123', 10) // Default password for demo
      });
      await user.save();
      console.log('✅ Auto-created user:', user._id);
    }

    // If password provided, validate it; otherwise allow login (demo mode)
    if (password) {
      const isPasswordValid = await bcryptjs.compare(password, (user as any).password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    return res.json({
      success: true,
      token,
      user: { id: user._id.toString(), name: (user as any).name, email: (user as any).email }
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Profile fetch failed' });
  }
});

export default router;
