'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function BookmarkButton({ articleId }) {
  const { user, authFetch } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (user?.bookmarks) {
      setBookmarked(user.bookmarks.includes(articleId));
    }
  }, [user, articleId]);

  const toggleBookmark = async () => {
    if (!user) return;
    try {
      const res = await authFetch(`/api/articles/${articleId}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setBookmarked(data.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={toggleBookmark}
      className={`p-2 rounded-lg border transition-all ${bookmarked ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
    >
      <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
}
