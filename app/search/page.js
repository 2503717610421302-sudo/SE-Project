import Link from 'next/link';
import dbConnect from '@/lib/db';
import Article from '@/lib/models/Article';
import User from '@/lib/models/User';
import Category from '@/lib/models/Category';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';

export const dynamic = 'force-dynamic';

async function searchArticles(query, tag, categorySlug) {
  try {
    await dbConnect();
    const filter = { status: 'published' };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) filter.category = cat._id;
    }

    const [articles, categories] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1 })
        .populate('author', 'name avatar')
        .populate('category', 'name slug color icon')
        .lean(),
      Category.find().lean(),
    ]);

    return {
      articles: JSON.parse(JSON.stringify(articles || [])),
      categories: JSON.parse(JSON.stringify(categories || [])),
    };
  } catch (err) {
    console.error('Search query error:', err);
    return { articles: [], categories: [] };
  }
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || '';
  const tag = params?.tag || '';
  const categorySlug = params?.category || '';

  const { articles, categories } = await searchArticles(q, tag, categorySlug);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Search NewsHub</h1>
          <p className="text-gray-400 text-sm">
            Search across thousands of articles, investigations, and topics
          </p>
          <div className="pt-2">
            <SearchBar defaultValue={q} />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
          <Link
            href="/search"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              !categorySlug
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c._id}
              href={`/search?${new URLSearchParams({
                ...(q ? { q } : {}),
                category: c.slug,
              }).toString()}`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                categorySlug === c.slug
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>

        {/* Active Filter Indicator */}
        <div className="flex items-center justify-between text-sm text-gray-400 border-b border-gray-800 pb-4">
          <p>
            Found <span className="font-bold text-white">{articles.length}</span> results
            {q && (
              <>
                {' '}for &ldquo;<span className="text-indigo-400">{q}</span>&rdquo;
              </>
            )}
            {tag && (
              <>
                {' '}tagged with &ldquo;<span className="text-indigo-400">#{tag}</span>&rdquo;
              </>
            )}
          </p>
          {(q || tag || categorySlug) && (
            <Link href="/search" className="text-xs text-rose-400 hover:underline">
              Clear filters
            </Link>
          )}
        </div>

        {/* Results Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900/40 rounded-2xl border border-gray-800">
            <span className="text-4xl mb-3 block">🔍</span>
            <h3 className="text-lg font-bold text-white mb-2">No matching articles</h3>
            <p className="text-gray-400 text-sm mb-6">
              Try searching with different keywords or clearing active filters.
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
            >
              Browse Featured News
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
