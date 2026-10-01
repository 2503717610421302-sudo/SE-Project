'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  if (!categories.length) return null;

  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/category/${cat.slug}`}
            className="group relative p-5 rounded-xl border border-gray-800/50 hover:border-opacity-0 transition-all duration-300 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${cat.color}08, ${cat.color}15)` }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, ${cat.color}15, ${cat.color}25)` }} />
            <div className="relative">
              <span className="text-3xl mb-2 block">{cat.icon}</span>
              <h3 className="font-semibold text-white group-hover:text-opacity-100 transition-colors">{cat.name}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{cat.description}</p>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
