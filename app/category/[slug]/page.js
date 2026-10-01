import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import Article from '@/lib/models/Article';
import ArticleCard from '@/components/ArticleCard';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await dbConnect();
  const category = await Category.findOne({ slug }).lean();
  if (!category) return { title: 'Category Not Found — NewsHub' };

  return {
    title: `${category.name} News — NewsHub`,
    description: category.description || `Browse latest stories and articles in ${category.name}`,
  };
}

async function getCategoryData(slug) {
  await dbConnect();
  const category = await Category.findOne({ slug }).lean();
  if (!category) return null;

  const articles = await Article.find({
    category: category._id,
    status: 'published',
  })
    .sort({ publishedAt: -1 })
    .populate('author', 'name avatar')
    .populate('category', 'name slug color icon')
    .lean();

  return {
    category: JSON.parse(JSON.stringify(category)),
    articles: JSON.parse(JSON.stringify(articles || [])),
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data || !data.category) {
    notFound();
  }

  const { category, articles } = data;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Category Header */}
        <header
          className="p-8 sm:p-12 rounded-3xl border relative overflow-hidden backdrop-blur-sm"
          style={{
            borderColor: `${category.color || '#6366f1'}33`,
            background: `linear-gradient(135deg, ${category.color || '#6366f1'}15, transparent)`,
          }}
        >
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Categories</span>
            <span>/</span>
            <span className="font-semibold" style={{ color: category.color }}>{category.name}</span>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-4xl sm:text-5xl p-3 bg-gray-900/80 rounded-2xl border border-gray-800 shadow-xl">
              {category.icon || '📰'}
            </span>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {category.name}
              </h1>
              <p className="mt-2 text-base text-gray-300 max-w-2xl">
                {category.description || `All the latest news, expert analysis, and in-depth updates on ${category.name}.`}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <span className="px-3 py-1 rounded-full bg-gray-900/60 border border-gray-800">
                  {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Articles List */}
        <section>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-900/40 rounded-2xl border border-gray-800">
              <span className="text-4xl mb-3 block">📭</span>
              <h3 className="text-lg font-bold text-white mb-2">No articles in this category yet</h3>
              <p className="text-gray-400 text-sm mb-6">Check back soon for latest reports.</p>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
              >
                Return Home
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
