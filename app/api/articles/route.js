import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/lib/models/Article';
import Category from '@/lib/models/Category';
import { requireRole, getCurrentUser } from '@/lib/auth';

// GET /api/articles - List articles (public: published only; authors/admins: their own)
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const author = searchParams.get('author');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const breaking = searchParams.get('breaking');
    const trending = searchParams.get('trending');
    const sortBy = searchParams.get('sort') || 'publishedAt';

    const query = {};
    const user = await getCurrentUser(request);

    // If user is admin, they can see all statuses; authors see their own
    if (status && user && (user.role === 'admin' || user.role === 'author')) {
      query.status = status;
      if (user.role === 'author') query.author = user._id;
    } else {
      query.status = 'published';
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
    if (author) query.author = author;
    if (tag) query.tags = tag;
    if (breaking === 'true') query.isBreaking = true;
    if (trending === 'true') query.isTrending = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    if (sortBy === 'views') sortOptions.views = -1;
    else if (sortBy === 'likes') sortOptions.likeCount = -1;
    else sortOptions.publishedAt = -1;

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name slug color icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ]);

    // Add likeCount to lean results
    const articlesWithCounts = articles.map((a) => ({
      ...a,
      likeCount: a.likedBy ? a.likedBy.length : 0,
    }));

    return NextResponse.json({
      articles: articlesWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/articles - Create article (author/admin)
export async function POST(request) {
  try {
    const { user, error } = await requireRole(request, ['author', 'admin']);
    if (error) return error;

    await dbConnect();
    const body = await request.json();

    const article = await Article.create({
      ...body,
      author: user._id,
      status: body.status || 'draft',
    });

    await article.populate('author', 'name avatar');
    await article.populate('category', 'name slug color');

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
