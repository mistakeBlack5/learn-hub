import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BookOpen, LayoutDashboard, Library, User, LogOut, Moon, Sun, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import clsx from 'clsx';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/formations', label: 'Courses', icon: Library },
  ];

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className={clsx('fixed top-0 left-0 right-0 z-50 transition-all duration-300', scrolled ? 'glass shadow-lg' : 'bg-transparent')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <BookOpen className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold gradient-text">LearnHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {user && navLinks.map(link => (
              <Link key={link.to} to={link.to} className={clsx('flex items-center gap-2 text-sm font-medium transition-colors', location.pathname === link.to ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400')}>
                <link.icon size={18} /> {link.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors">
                <Shield size={16} /> Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center gap-3">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{user.name}</p>
                    <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex px-5 py-2.5 gradient-bg text-white rounded-full text-sm font-semibold hover:shadow-lg transition-all">Sign In</Link>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden glass border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    <div><p className="font-semibold text-gray-900 dark:text-white">{user.name}</p><span className="text-xs text-gray-500 capitalize">{user.role}</span></div>
                  </div>
                  {navLinks.map(link => (
                    <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-gray-700 dark:text-gray-300"><link.icon size={20} /> {link.label}</Link>
                  ))}
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"><Shield size={20} /> Admin Panel</Link>}
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"><LogOut size={20} /> Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-3 gradient-bg text-white rounded-xl font-semibold">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}