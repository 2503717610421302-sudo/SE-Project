'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ArticleLikeButton({ articleId, initialLikes = 0, initialLiked = false }) {
  const { user, authFetch } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (!user) {
      alert('Please sign in to like this article.');
      return;
    }
    if (loading) return;

    setLoading(true);
    // Optimistic UI update
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);

    try {
      const res = await authFetch(`/api/articles/${articleId}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikes(data.likesCount);
      } else {
        // Revert on error
        setLiked(liked);
        setLikes(likes);
      }
    } catch {
      setLiked(liked);
      setLikes(likes);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-medium transition-all ${
        liked
          ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/10'
          : 'bg-white/5 border-white/10 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30'
      }`}
      title={liked ? 'Unlike' : 'Like article'}
    >
      <svg
        className={`w-4 h-4 transition-transform ${liked ? 'scale-110 fill-current' : 'fill-none stroke-current'}`}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{likes}</span>
    </button>
  );
}
