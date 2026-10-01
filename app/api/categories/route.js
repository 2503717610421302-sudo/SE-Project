import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import { requireRole } from '@/lib/auth';

// GET /api/categories
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/categories (admin only)
export async function POST(request) {
  try {
    const { user, error } = await requireRole(request, ['admin']);
    if (error) return error;

    await dbConnect();
    const body = await request.json();
    const category = await Category.create(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
