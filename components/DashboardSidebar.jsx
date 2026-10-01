'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: '📊', roles: ['author', 'admin'] },
  { label: 'Articles', href: '/dashboard/articles', icon: '📝', roles: ['author', 'admin'] },
  { label: 'New Article', href: '/dashboard/articles/new', icon: '✏️', roles: ['author', 'admin'] },
  { label: 'Categories', href: '/dashboard/categories', icon: '📁', roles: ['admin'] },
  { label: 'Users', href: '/dashboard/users', icon: '👥', roles: ['admin'] },
  { label: 'Comments', href: '/dashboard/comments', icon: '💬', roles: ['admin'] },
];

export default function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800/50 min-h-[calc(100vh-4rem)] p-4 flex-shrink-0 hidden lg:block">
      <div className="mb-6 px-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dashboard</h2>
      </div>
      <nav className="space-y-1">
        {navItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="mt-8 mx-3 p-4 rounded-xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/10">
        <p className="text-xs text-gray-400">Signed in as</p>
        <p className="text-sm font-medium text-white mt-0.5">{user?.name}</p>
        <p className="text-xs text-indigo-400 capitalize mt-0.5">{user?.role}</p>
      </div>
    </aside>
  );
}
