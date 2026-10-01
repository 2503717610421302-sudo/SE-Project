'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              N
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              NewsHub
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">Home</Link>
            <Link href="/category/technology" className="px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">Tech</Link>
            <Link href="/category/politics" className="px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">Politics</Link>
            <Link href="/category/sports" className="px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">Sports</Link>
            <Link href="/category/entertainment" className="px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">Entertainment</Link>
          </div>

          {/* Search + Auth */}
          <div className="hidden md:flex items-center gap-3">
            <SearchBar />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-200">{user.name}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/50 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                    {(user.role === 'author' || user.role === 'admin') && (
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                    )}
                    <Link href="/dashboard/articles" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5" onClick={() => setDropdownOpen(false)}>
                      {user.role === 'reader' ? 'Bookmarks' : 'My Articles'}
                    </Link>
                    <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-800 mt-2 pt-4 space-y-2">
            <SearchBar />
            <Link href="/" className="block px-3 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5">Home</Link>
            <Link href="/category/technology" className="block px-3 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5">Technology</Link>
            <Link href="/category/politics" className="block px-3 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5">Politics</Link>
            <Link href="/category/sports" className="block px-3 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5">Sports</Link>
            {user ? (
              <>
                {(user.role === 'author' || user.role === 'admin') && (
                  <Link href="/dashboard" className="block px-3 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5">Dashboard</Link>
                )}
                <button onClick={logout} className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-white/5">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5">Sign In</Link>
                <Link href="/signup" className="block px-3 py-2 text-indigo-400 hover:text-indigo-300 rounded-lg hover:bg-white/5">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
