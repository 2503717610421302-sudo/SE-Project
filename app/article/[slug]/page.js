import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Article from '@/lib/models/Article';
import ArticleCard from '@/components/ArticleCard';
import CommentSection from '@/components/CommentSection';
import ShareButtons from '@/components/ShareButtons';
import BookmarkButton from '@/components/BookmarkButton';
import ArticleLikeButton from '@/components/ArticleLikeButton';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await dbConnect();
  const article = await Article.findOne({ slug }).lean();
  if (!article) return { title: 'Article Not Found — NewsHub' };

  return {
    title: `${article.title} — NewsHub`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

async function getArticle(slug) {
  await dbConnect();
  let article;
  if (slug.match(/^[0-9a-fA-F]{24}$/)) {
    article = await Article.findById(slug)
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug color icon');
  } else {
    article = await Article.findOne({ slug })
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug color icon');
  }

  if (!article) return null;

  // Increment views
  article.views = (article.views || 0) + 1;
  await article.save();

  // Related articles in same category
  const related = await Article.find({
    category: article.category?._id,
    _id: { $ne: article._id },
    status: 'published',
  })
    .limit(3)
    .populate('author', 'name avatar')
    .populate('category', 'name slug color icon')
    .lean();

  return {
    article: JSON.parse(JSON.stringify(article)),
    related: JSON.parse(JSON.stringify(related || [])),
  };
}

export default async function ArticleDetailPage({ params }) {
  const { slug } = await params;
  const data = await getArticle(slug);

  if (!data || !data.article) {
    notFound();
  }

  const { article, related } = data;
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(article.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  const likeCount = article.likedBy ? article.likedBy.length : 0;

  return (
    <article className="min-h-screen bg-gray-950 text-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Category */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            {article.category && (
              <Link
                href={`/category/${article.category.slug}`}
                className="hover:underline font-medium"
                style={{ color: article.category.color }}
              >
                {article.category.icon} {article.category.name}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <BookmarkButton articleId={article._id} />
            <ArticleLikeButton
              articleId={article._id}
              initialLikes={likeCount}
              initialLiked={false}
            />
          </div>
        </div>

        {/* Title & Excerpt */}
        <header className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Author & Meta Bar */}
          <div className="flex items-center justify-between py-4 border-y border-gray-800 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                {article.author?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{article.author?.name || 'News Staff'}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{date}</span>
                  <span>•</span>
                  <span>👁 {article.views?.toLocaleString()} views</span>
                </div>
              </div>
            </div>

            <ShareButtons title={article.title} slug={article.slug} />
          </div>
        </header>

        {/* Featured Image */}
        {article.coverImage && (
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-800">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div
          className="article-content text-gray-200 leading-relaxed text-base sm:text-lg space-y-5"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1">
                Topics:
              </span>
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-xs font-medium text-gray-300 transition"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Box */}
        {article.author && (
          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-indigo-500/20">
              {article.author.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-white mb-1">Written by {article.author.name}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {article.author.bio ||
                  'Journalist and correspondent covering global insights and breaking developments.'}
              </p>
            </div>
          </div>
        )}

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="pt-10 border-t border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6">Related Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <ArticleCard key={item._id} article={item} />
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <CommentSection articleId={article._id} />
      </div>
    </article>
  );
}
