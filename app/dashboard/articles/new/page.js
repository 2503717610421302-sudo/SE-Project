'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RichTextEditor from '@/components/RichTextEditor';
import Link from 'next/link';

export default function NewArticlePage() {
  const router = useRouter();
  const { user, authFetch } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    coverImage: '',
    content: '<p>Start writing your investigation or story here...</p>',
    tags: '',
    status: user?.role === 'admin' ? 'published' : 'draft',
    isBreaking: false,
    isTrending: false,
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        if (data.categories?.length > 0) {
          setFormData((prev) => ({ ...prev, category: data.categories[0]._id }));
        }
      })
      .catch((err) => console.error(err));
  }, []);

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
      setError('Please provide an article headline.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        ...formData,
        tags: tagsArray,
        publishedAt: formData.status === 'published' ? new Date() : undefined,
      };

      const res = await authFetch('/api/articles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish article');
      }

      router.push('/dashboard/articles');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Article</h1>
          <p className="text-xs text-gray-400">
            Publish breaking dispatches, feature investigations, and opinion pieces
          </p>
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
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Article Title / Headline *
          </label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Historic Climate Accord Signed by 190 Nations"
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-base focus:outline-none focus:border-indigo-500 font-medium transition"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Excerpt / Summary
          </label>
          <textarea
            name="excerpt"
            rows={2}
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="A short, catchy overview of the article for cards and social sharing..."
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Category & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Category Beat *
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
              Publication Status
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

        {/* Cover Image URL */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Cover Image URL
          </label>
          <input
            type="url"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/photo-..."
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

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="climate, energy, summit, global"
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Toggles (Breaking / Trending) */}
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

        {/* Rich Text Editor */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Article Content (Rich Text) *
          </label>
          <RichTextEditor value={formData.content} onChange={handleContentChange} />
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
          <Link
            href="/dashboard/articles"
            className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}
