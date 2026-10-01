'use client';
import { useEffect, useState, useRef } from 'react';
import ArticleCard from './ArticleCard';

export default function TrendingCarousel() {
  const [articles, setArticles] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch('/api/articles?trending=true&limit=8')
      .then((r) => r.json())
      .then((d) => setArticles(d.articles || []))
      .catch(() => {});
  }, []);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
    }
  };

  if (!articles.length) return null;

  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🔥</span> Trending Now
          </h2>
          <p className="text-sm text-gray-400 mt-1">Most popular stories right now</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => scroll(1)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        {articles.map((article) => (
          <div key={article._id} className="flex-shrink-0 w-[320px] snap-start">
            <ArticleCard article={article} />
          </div>
        ))}
      </div>
    </section>
  );
}
