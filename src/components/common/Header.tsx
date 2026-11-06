import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { signOut } from '@/services/supabase/auth';
import { Menu, X, LogOut } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const { user, setUser } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await signOut();
    if (response.success) {
      setUser(null);
      navigate('/login', { replace: true });
    } else {
      setLogoutError(response.error || 'Unable to sign out. Please try again.');
    }
  };

  const navItems = [
    { label: 'Overview', path: '/' },
    { label: "Trader's Diary", path: '/diary' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Portfolio', path: '/portfolio' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {logoutError && <p role="alert" className="bg-loss/10 px-4 py-2 text-center text-sm text-loss">{logoutError}</p>}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="font-bold text-xl text-profit">
              📊 Trade Journal
            </Link>
            <span className="text-xs text-slate-600 dark:text-slate-400">AI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-profit/10 text-profit'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                {user?.full_name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-loss rounded-lg transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-profit/10 text-profit'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <hr className="dark:border-slate-800 my-2" />
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg text-sm text-loss hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
