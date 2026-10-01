'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardCommentsPage() {
  const { user, authFetch } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionId, setActionId] = useState(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (filter !== 'all') params.set('status', filter);

      const res = await authFetch(`/api/comments?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, page, filter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleModeration = async (commentId, isApproved) => {
    setActionId(commentId);
    try {
      const res = await authFetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ isApproved }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, isApproved } : c))
        );
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to moderate comment');
      }
    } catch {
      alert('Error updating comment');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Are you sure you want to permanently delete this comment?')) return;

    try {
      const res = await authFetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete comment');
      }
    } catch {
      alert('Error deleting comment');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="py-12 text-center text-gray-400">
        <p>Access restricted to administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Comment Moderation</h1>
          <p className="text-xs text-gray-400">
            Review community interactions, approve constructive debates, and remove spam
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-900/40 p-1.5 rounded-xl border border-gray-800">
          {[
            { id: 'pending', label: '⏳ Pending' },
            { id: 'approved', label: '✅ Approved' },
            { id: 'all', label: 'All Comments' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setFilter(item.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filter === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-gray-400 bg-gray-900/60 border border-gray-800 rounded-2xl">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Fetching comments for moderation...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment._id}
              className={`p-5 rounded-2xl border transition-all ${
                comment.isApproved
                  ? 'bg-gray-900/40 border-gray-800'
                  : 'bg-amber-500/[0.03] border-amber-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {comment.author?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-white text-sm">
                        {comment.author?.name || 'Anonymous User'}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        ({comment.author?.email || 'no email'})
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {comment.article && (
                      <p className="text-xs text-gray-400 mb-2">
                        On article:{' '}
                        <Link
                          href={`/article/${comment.article.slug}`}
                          className="text-indigo-400 hover:underline font-medium"
                        >
                          {comment.article.title}
                        </Link>
                      </p>
                    )}

                    <div className="p-3 rounded-xl bg-gray-950/70 border border-gray-800/80 text-gray-200 text-sm leading-relaxed">
                      {comment.body}
                    </div>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center gap-2 flex-shrink-0 sm:self-center">
                  {!comment.isApproved ? (
                    <button
                      disabled={actionId === comment._id}
                      onClick={() => handleModeration(comment._id, true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition"
                    >
                      ✓ Approve
                    </button>
                  ) : (
                    <button
                      disabled={actionId === comment._id}
                      onClick={() => handleModeration(comment._id, false)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/20 text-xs font-semibold transition"
                    >
                      Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-900/40 border border-gray-800 rounded-2xl">
            <span className="text-3xl mb-2 block">✨</span>
            <p className="text-gray-300 font-medium">All caught up!</p>
            <p className="text-xs text-gray-500 mt-1">No comments waiting for moderation.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl flex items-center justify-between text-xs text-gray-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
