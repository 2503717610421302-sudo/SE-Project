'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RichTextEditor from '@/components/RichTextEditor';
import Link from 'next/link';

export default function EditArticlePage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { authFetch } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    coverImage: '',
    content: '',
    tags: '',
    status: 'draft',
    isBreaking: false,
    isTrending: false,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch(`/api/articles/${id}`).then((r) => r.json()),
    ])
      .then(([catData, artData]) => {
        setCategories(catData.categories || []);
        if (artData.article) {
          const a = artData.article;
          setFormData({
            title: a.title || '',
            excerpt: a.excerpt || '',
            category: a.category?._id || a.category || '',
            coverImage: a.coverImage || '',
            content: a.content || '',
            tags: a.tags?.join(', ') || '',
            status: a.status || 'draft',
            isBreaking: Boolean(a.isBreaking),
            isTrending: Boolean(a.isTrending),
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load article data.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Article headline is required.');
      return;
    }

    setSaving(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        ...formData,
        tags: tagsArray,
        ...(formData.status === 'published' && !formData.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      };

      const res = await authFetch(`/api/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update article');
      }

      router.push('/dashboard/articles');
    } catch (err) {
      setError(err.message || 'Error saving article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading article details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Article</h1>
          <p className="text-xs text-gray-400">Update story details, content, or publication status</p>
        </div>
        <Link
          href="/dashboard/articles"
          className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 transition"
        >
          &larr; Back to articles
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Headline *
          </label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-base focus:outline-none focus:border-indigo-500 font-medium transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Excerpt / Summary
          </label>
          <textarea
            name="excerpt"
            rows={2}
            value={formData.excerpt}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Category Beat
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-indigo-500 capitalize"
            >
              <option value="draft">Draft (Private)</option>
              <option value="pending">Pending Editorial Review</option>
              <option value="published">Published (Live to World)</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Cover Image URL
          </label>
          <input
            type="url"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
          {formData.coverImage && (
            <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-800 max-h-48">
              <img
                src={formData.coverImage}
                alt="Preview"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-6 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
            <input
              type="checkbox"
              name="isBreaking"
              checked={formData.isBreaking}
              onChange={handleChange}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-700 bg-gray-800"
            />
            <span>🚨 Breaking News Ticker</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
            <input
              type="checkbox"
              name="isTrending"
              checked={formData.isTrending}
              onChange={handleChange}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-700 bg-gray-800"
            />
            <span>🔥 Trending Carousel</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Article Content *
          </label>
          <RichTextEditor value={formData.content} onChange={handleContentChange} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
          <Link
            href="/dashboard/articles"
            className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Article'}
          </button>
        </div>
      </form>
    </div>
  );
}
