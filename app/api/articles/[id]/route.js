import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/lib/models/Article';
import { requireRole, getCurrentUser } from '@/lib/auth';

// GET /api/articles/[id] - Get single article by ID or slug
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    let article;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(id)
        .populate('author', 'name avatar bio')
        .populate('category', 'name slug color icon');
    } else {
      article = await Article.findOne({ slug: id })
        .populate('author', 'name avatar bio')
        .populate('category', 'name slug color icon');
    }

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/articles/[id] - Update article
export async function PUT(request, { params }) {
  try {
    const { user, error } = await requireRole(request, ['author', 'admin']);
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const article = await Article.findById(id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Authors can only edit their own articles
    if (user.role === 'author' && article.author.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    Object.assign(article, body);
    await article.save();
    await article.populate('author', 'name avatar');
    await article.populate('category', 'name slug color');

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/articles/[id]
export async function DELETE(request, { params }) {
  try {
    const { user, error } = await requireRole(request, ['author', 'admin']);
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (user.role === 'author' && article.author.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await Article.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Article deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
