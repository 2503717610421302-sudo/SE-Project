'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import StatsCard from '@/components/StatsCard';

export default function DashboardOverviewPage() {
  const { user, authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/analytics')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => console.error('Failed to fetch analytics:', err))
      .finally(() => setLoading(false));
  }, [authFetch]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-400">Loading metrics and insights...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentArticles = data?.recentArticles || [];

  return (
    <div className="space-y-8">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome back, {user?.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {user?.role}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            {user?.role === 'admin'
              ? 'Editorial control center and global content moderation'
              : 'Track your journalism performance, readership reach, and drafts'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/articles/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <span>✏️</span>
            <span>Write Article</span>
          </Link>
          {user?.role === 'admin' && (
            <Link
              href="/dashboard/comments"
              className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-200 text-sm font-medium transition"
            >
              Moderate
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role === 'admin' ? (
          <>
            <StatsCard
              icon="📰"
              label="Total Articles"
              value={stats.totalArticles || 0}
              color="indigo"
            />
            <StatsCard
              icon="👁"
              label="Total Views"
              value={stats.totalViews || 0}
              color="cyan"
            />
            <StatsCard
              icon="👥"
              label="Registered Users"
              value={stats.totalUsers || 0}
              color="purple"
            />
            <StatsCard
              icon="💬"
              label="Total Comments"
              value={stats.totalComments || 0}
              color="green"
            />
          </>
        ) : (
          <>
            <StatsCard
              icon="📝"
              label="My Articles"
              value={stats.myArticles || 0}
              color="indigo"
            />
            <StatsCard
              icon="✅"
              label="Published"
              value={stats.publishedCount || 0}
              color="green"
            />
            <StatsCard
              icon="👁"
              label="Article Views"
              value={stats.totalViews || 0}
              color="cyan"
            />
            <StatsCard
              icon="⏳"
              label="Pending Review"
              value={stats.pendingCount || 0}
              color="amber"
            />
          </>
        )}
      </div>

      {/* Admin Moderation Alert Banner */}
      {user?.role === 'admin' && (stats.pendingArticles > 0 || stats.pendingComments > 0) && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-300">Action Required: Pending Items</p>
              <p className="text-xs text-amber-400/80">
                You have {stats.pendingArticles || 0} article(s) awaiting approval and {stats.pendingComments || 0} comment(s) to moderate.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/articles?status=pending"
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition font-medium"
            >
              Review Articles
            </Link>
            <Link
              href="/dashboard/comments"
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition font-medium"
            >
              Review Comments
            </Link>
          </div>
        </div>
      )}

      {/* Recent Articles Section */}
      <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Articles</h2>
            <p className="text-xs text-gray-400">Latest publications and submissions</p>
          </div>
          <Link
            href="/dashboard/articles"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View all articles &rarr;
          </Link>
        </div>

        {recentArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Category</th>
                  {user?.role === 'admin' && <th className="pb-3 font-semibold">Author</th>}
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Views</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {recentArticles.map((art) => {
                  const statusColors = {
                    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
                    archived: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                  };

                  return (
                    <tr key={art._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 pr-4 font-medium text-white max-w-xs truncate">
                        <Link href={`/article/${art.slug}`} className="hover:text-indigo-300 transition">
                          {art.title}
                        </Link>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-gray-400">
                        {art.category?.name || 'General'}
                      </td>
                      {user?.role === 'admin' && (
                        <td className="py-3.5 pr-4 text-xs text-gray-400">
                          {art.author?.name || 'Staff'}
                        </td>
                      )}
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full border capitalize ${
                            statusColors[art.status] || statusColors.draft
                          }`}
                        >
                          {art.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right text-xs text-gray-400">
                        {art.views?.toLocaleString() || 0}
                      </td>
                      <td className="py-3.5 text-right text-xs">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/articles/${art._id}/edit`}
                            className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 transition"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/article/${art.slug}`}
                            className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">No articles created yet.</p>
        )}
      </div>
    </div>
  );
}
