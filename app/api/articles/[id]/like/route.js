import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/lib/models/Article';
import { requireAuth } from '@/lib/auth';

// POST /api/articles/[id]/like - Toggle like
export async function POST(request, { params }) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const idx = article.likedBy.indexOf(user._id);
    if (idx > -1) {
      article.likedBy.splice(idx, 1);
    } else {
      article.likedBy.push(user._id);
    }

    await article.save();
    return NextResponse.json({ liked: idx === -1, likeCount: article.likedBy.length });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
