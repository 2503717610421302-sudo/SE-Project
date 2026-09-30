import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import dbConnect from './db';
import User from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookieToken = request.cookies?.get('token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export async function getCurrentUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  await dbConnect();
  const user = await User.findById(decoded.userId).select('-password');
  return user;
}

export async function requireAuth(request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }
  return { user };
}

export async function requireRole(request, roles) {
  const { user, error } = await requireAuth(request);
  if (error) return { error };

  if (!roles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }
  return { user };
}
