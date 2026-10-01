'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

export default function BreakingNewsBanner() {
  const [articles, setArticles] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/articles?breaking=true&limit=5')
      .then((r) => r.json())
      .then((d) => setArticles(d.articles || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % articles.length), 5000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (!articles.length) return null;

  return (
    <div className="bg-gradient-to-r from-red-600/90 to-rose-600/90 backdrop-blur-sm border-b border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
        <span className="flex-shrink-0 px-2.5 py-0.5 bg-white text-red-600 text-xs font-black rounded uppercase tracking-wider animate-pulse">
          Breaking
        </span>
        <div className="overflow-hidden flex-1 relative h-5">
          {articles.map((a, i) => (
            <Link
              key={a._id}
              href={`/article/${a.slug}`}
              className={`absolute inset-0 text-sm text-white font-medium truncate transition-all duration-500 hover:underline ${
                i === current ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
            >
              {a.title}
            </Link>
          ))}
        </div>
        {articles.length > 1 && (
          <div className="hidden sm:flex gap-1">
            {articles.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
