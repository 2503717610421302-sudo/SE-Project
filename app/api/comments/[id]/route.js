import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/lib/models/Comment';
import { requireRole } from '@/lib/auth';

// PUT /api/comments/[id] - Moderate comment (approve/reject)
export async function PUT(request, { params }) {
  try {
    const { user, error } = await requireRole(request, ['admin']);
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    const { isApproved } = await request.json();

    const comment = await Comment.findByIdAndUpdate(id, { isApproved }, { new: true })
      .populate('author', 'name avatar');
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

    return NextResponse.json({ comment });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/comments/[id]
export async function DELETE(request, { params }) {
  try {
    const { user, error } = await requireRole(request, ['admin']);
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    await Comment.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
