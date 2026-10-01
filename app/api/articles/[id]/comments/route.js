import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/lib/models/Comment';
import { requireAuth } from '@/lib/auth';

// GET /api/articles/[id]/comments
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const comments = await Comment.find({ article: id, isApproved: true })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/articles/[id]/comments
export async function POST(request, { params }) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    const { body } = await request.json();

    if (!body || !body.trim()) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 });
    }

    const comment = await Comment.create({ body: body.trim(), author: user._id, article: id });
    await comment.populate('author', 'name avatar');

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
