import Link from 'next/link';
import NewsletterSubscription from './NewsletterSubscription';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">N</div>
              <span className="text-xl font-bold text-white">NewsHub</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Your trusted source for breaking news, in-depth analysis, and comprehensive coverage across all topics.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-2">
              {['Technology', 'Politics', 'Sports', 'Entertainment', 'Business', 'Health'].map((cat) => (
                <li key={cat}>
                  <Link href={`/category/${cat.toLowerCase()}`} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}><span className="text-sm text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer">{item}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Stay Connected</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <NewsletterSubscription variant="compact" />
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-800/50 text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} NewsHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
