'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'author' && user.role !== 'admin'))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-950 text-gray-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm">Verifying credentials...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'author' && user.role !== 'admin')) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-950 text-gray-400 p-4 text-center">
        <span className="text-4xl mb-3">🔒</span>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-sm mb-6 max-w-sm">
          You must be an Author or Administrator to access the publishing dashboard.
        </p>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
        >
          Sign In as Author/Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Mobile Dashboard Navigation Header */}
      <div className="lg:hidden border-b border-gray-800 bg-gray-900/60 px-4 py-3 flex items-center justify-between overflow-x-auto gap-2">
        <Link
          href="/dashboard"
          className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold text-white whitespace-nowrap"
        >
          📊 Overview
        </Link>
        <Link
          href="/dashboard/articles"
          className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold text-white whitespace-nowrap"
        >
          📝 Articles
        </Link>
        <Link
          href="/dashboard/articles/new"
          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white whitespace-nowrap"
        >
          ✏️ New
        </Link>
        {user.role === 'admin' && (
          <>
            <Link
              href="/dashboard/categories"
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold text-white whitespace-nowrap"
            >
              📁 Categories
            </Link>
            <Link
              href="/dashboard/users"
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold text-white whitespace-nowrap"
            >
              👥 Users
            </Link>
            <Link
              href="/dashboard/comments"
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold text-white whitespace-nowrap"
            >
              💬 Comments
            </Link>
          </>
        )}
      </div>

      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
