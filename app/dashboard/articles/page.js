'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardArticlesPage() {
  const { user, authFetch } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await authFetch(`/api/articles?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setArticles(data.articles || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, page, statusFilter, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await authFetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles(articles.filter((a) => a._id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete article');
      }
    } catch {
      alert('Error deleting article');
    }
  };

  const statusColors = {
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    archived: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Articles Management</h1>
          <p className="text-sm text-gray-400">
            {user?.role === 'admin'
              ? 'Oversee all published and submitted journalism'
              : 'Draft, publish, and manage your articles'}
          </p>
        </div>
        <Link
          href="/dashboard/articles/new"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-500/20 flex items-center gap-2 self-start"
        >
          <span>✏️</span>
          <span>New Article</span>
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-900/40 p-3 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'published', 'draft', 'pending', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search my articles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Fetching articles...</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-950/60 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Article</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Views</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {articles.map((article) => {
                  const dateStr = article.publishedAt || article.createdAt;
                  return (
                    <tr key={article._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 max-w-sm sm:max-w-md">
                          {article.coverImage && (
                            <img
                              src={article.coverImage}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-800"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate text-sm">
                              {article.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {article.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-300">
                        {article.category?.name || 'General'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${
                            statusColors[article.status] || statusColors.draft
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-gray-400">
                        👁 {article.views?.toLocaleString() || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-gray-400">
                        {new Date(dateStr).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/articles/${article._id}/edit`}
                            className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 transition"
                          >
                            Edit
                          </Link>
                          {article.status === 'published' && (
                            <Link
                              href={`/article/${article.slug}`}
                              className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                            >
                              View
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(article._id, article.title)}
                            className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-3xl mb-2 block">📄</span>
            <p className="text-gray-400 text-sm mb-4">No articles found matching criteria.</p>
            <Link
              href="/dashboard/articles/new"
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Create your first article
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
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
