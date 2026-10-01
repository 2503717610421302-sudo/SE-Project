'use client';
import Link from 'next/link';

export default function ArticleCard({ article, variant = 'default' }) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  if (variant === 'featured') {
    return (
      <Link href={`/article/${article.slug}`} className="group relative block rounded-2xl overflow-hidden aspect-[16/9] bg-gray-900">
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          {article.category && (
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3" style={{ backgroundColor: article.category.color + '22', color: article.category.color }}>
              {article.category.icon} {article.category.name}
            </span>
          )}
          <h2 className="text-xl md:text-3xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">{article.title}</h2>
          <p className="text-gray-300 text-sm md:text-base line-clamp-2 mb-3">{article.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{article.author?.name}</span>
            <span>{date}</span>
            <span className="flex items-center gap-1">👁 {article.views?.toLocaleString()}</span>
            <span className="flex items-center gap-1">❤️ {article.likeCount || article.likedBy?.length || 0}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/article/${article.slug}`} className="group flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all">
        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 relative flex items-center justify-center text-gray-600">
          <span className="text-xs">📰</span>
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {article.category && (
            <span className="text-xs font-medium" style={{ color: article.category.color }}>{article.category.name}</span>
          )}
          <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mt-0.5">{article.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{date}</span>
            <span>👁 {article.views?.toLocaleString()}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`} className="group block rounded-xl overflow-hidden bg-gray-900/50 border border-gray-800/50 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
      <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center text-2xl text-gray-600">
        <span>{article.category?.icon || '📰'}</span>
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
      </div>
      <div className="p-5">
        {article.category && (
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-2" style={{ backgroundColor: article.category.color + '18', color: article.category.color }}>
            {article.category.icon} {article.category.name}
          </span>
        )}
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">{article.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
              {article.author?.name?.[0]}
            </div>
            <span>{article.author?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{date}</span>
            <span>👁 {article.views?.toLocaleString()}</span>
            <span>❤️ {article.likeCount || article.likedBy?.length || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
