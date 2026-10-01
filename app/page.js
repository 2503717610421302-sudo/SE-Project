import Link from 'next/link';
import BreakingNewsBanner from '@/components/BreakingNewsBanner';
import TrendingCarousel from '@/components/TrendingCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import ArticleCard from '@/components/ArticleCard';
import NewsletterSubscription from '@/components/NewsletterSubscription';
import dbConnect from '@/lib/db';
import Article from '@/lib/models/Article';
import User from '@/lib/models/User';
import Category from '@/lib/models/Category';

export const revalidate = 60;

async function getHomeData() {
  try {
    await dbConnect();

    const [featured, latest, categories] = await Promise.all([
      Article.findOne({ status: 'published' })
        .sort({ views: -1, publishedAt: -1 })
        .populate('author', 'name avatar')
        .populate('category', 'name slug color icon')
        .lean(),

      Article.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .skip(1)
        .limit(9)
        .populate('author', 'name avatar')
        .populate('category', 'name slug color icon')
        .lean(),

      Category.find().lean(),
    ]);

    return {
      featured: featured ? JSON.parse(JSON.stringify(featured)) : null,
      latest: JSON.parse(JSON.stringify(latest || [])),
      categories: JSON.parse(JSON.stringify(categories || [])),
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return { featured: null, latest: [], categories: [] };
  }
}

export default async function HomePage() {
  const { featured, latest, categories } = await getHomeData();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Breaking News Ticker */}
      <BreakingNewsBanner />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Trending Ribbon / Carousel */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔥</span>
            <h2 className="text-lg font-bold text-white tracking-wide uppercase">Trending Now</h2>
          </div>
          <TrendingCarousel />
        </section>

        {/* Hero Section: Featured Article + Top Stories */}
        {featured ? (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <ArticleCard article={featured} variant="featured" />
            </div>
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    Top Stories
                  </h3>
                  <span className="text-xs text-indigo-400 font-medium">Live Feed</span>
                </div>
                <div className="divide-y divide-gray-800/60">
                  {latest.slice(0, 4).map((art) => (
                    <ArticleCard key={art._id} article={art} variant="horizontal" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to NewsHub</h2>
            <p className="text-gray-400 mb-6">No articles published yet. Seed the database to get started!</p>
            <Link
              href="/api/seed"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
            >
              Seed Sample News
            </Link>
          </div>
        )}

        {/* Categories Explorer */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Explore by Category</h2>
              <p className="text-sm text-gray-400">Curated beats from global correspondents</p>
            </div>
          </div>
          <CategoryGrid categories={categories} />
        </section>

        {/* Latest Articles Grid */}
        <section>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-white">Latest Dispatches</h2>
              <p className="text-sm text-gray-400">Real-time reporting and in-depth investigations</p>
            </div>
            <Link
              href="/search"
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
            >
              View all archives &rarr;
            </Link>
          </div>

          {latest.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">No recent articles found.</p>
          )}
        </section>

        {/* Newsletter Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-pink-900/40 border border-indigo-500/20 p-8 md:p-12 text-center">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              Morning Briefing
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Stay ahead of world events
            </h2>
            <p className="text-gray-300 text-sm md:text-base">
              Get the most critical news analysis delivered directly to your inbox every morning. Free, no spam.
            </p>
            <NewsletterSubscription variant="banner" />
          </div>
        </section>
      </main>
    </div>
  );
}
