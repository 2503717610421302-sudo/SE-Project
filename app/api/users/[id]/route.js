import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { requireRole } from '@/lib/auth';

// PUT /api/users/[id] - Update user role
export async function PUT(request, { params }) {
  try {
    const { user, error } = await requireRole(request, ['admin']);
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    const { role } = await request.json();

    if (!['reader', 'author', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(request, { params }) {
  try {
    const { user, error } = await requireRole(request, ['admin']);
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
