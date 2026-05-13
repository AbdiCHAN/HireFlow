import { Router } from 'express';
import { UserModel } from '../models/User.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();
let userModel: UserModel;

const ALLOWED_ROLES = new Set(['job_seeker', 'employer', 'admin']);

export function setUserModel(db: any) {
  userModel = UserModel.create(db);
}

const normalizeRole = (role: any, userType?: any) => {
  if (role === 'recruiter' || userType === 'recruiter') return 'employer';
  if (role === 'candidate' || userType === 'candidate') return 'job_seeker';
  if (ALLOWED_ROLES.has(role)) return role;
  return 'job_seeker';
};

const registerUser = async (req: any, res: any) => {
  try {
    const { email, password, role, userType } = req.body;
    const username = req.body.username || req.body.fullName;
    const normalizedRole = normalizeRole(role, userType);

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

   
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const existingUsername = await userModel.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      username,
      email,
      passwordHash,
      role: normalizedRole
    });

    
    const SECRET = process.env.ACCESS_TOKEN_SECRET || 'hireflow-dev-secret';
    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.warn('WARNING: ACCESS_TOKEN_SECRET is not set. Using development fallback secret. Do NOT use in production.');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/register', registerUser);
router.post('/signup', registerUser);

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const SECRET = process.env.ACCESS_TOKEN_SECRET || 'hireflow-dev-secret';
    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.warn('WARNING: ACCESS_TOKEN_SECRET is not set. Using development fallback secret. Do NOT use in production.');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
