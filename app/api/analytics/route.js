import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/lib/models/Article';
import User from '@/lib/models/User';
import Comment from '@/lib/models/Comment';
import Category from '@/lib/models/Category';
import { requireRole, getCurrentUser } from '@/lib/auth';

// GET /api/analytics
export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || !['author', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    if (user.role === 'admin') {
      const [totalUsers, totalArticles, publishedArticles, totalComments, totalViews, categories, recentArticles] =
        await Promise.all([
          User.countDocuments(),
          Article.countDocuments(),
          Article.countDocuments({ status: 'published' }),
          Comment.countDocuments(),
          Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
          Category.countDocuments(),
          Article.find()
            .populate('author', 'name')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        ]);

      const pendingArticles = await Article.countDocuments({ status: 'pending' });
      const pendingComments = await Comment.countDocuments({ isApproved: false });

      const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);

      return NextResponse.json({
        stats: {
          totalUsers,
          totalArticles,
          publishedArticles,
          pendingArticles,
          totalComments,
          pendingComments,
          totalViews: totalViews[0]?.total || 0,
          categories,
          usersByRole,
        },
        recentArticles,
      });
    }

    // Author analytics
    const [myArticles, totalViews, totalComments, recentArticles] = await Promise.all([
      Article.countDocuments({ author: user._id }),
      Article.aggregate([
        { $match: { author: user._id } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
      Comment.countDocuments({
        article: { $in: await Article.find({ author: user._id }).distinct('_id') },
      }),
      Article.find({ author: user._id })
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const publishedCount = await Article.countDocuments({ author: user._id, status: 'published' });
    const draftCount = await Article.countDocuments({ author: user._id, status: 'draft' });
    const pendingCount = await Article.countDocuments({ author: user._id, status: 'pending' });

    return NextResponse.json({
      stats: {
        myArticles,
        publishedCount,
        draftCount,
        pendingCount,
        totalViews: totalViews[0]?.total || 0,
        totalComments,
      },
      recentArticles,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
