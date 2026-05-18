import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { MapPin, PlusCircle, Shield, LogOut, Menu, X, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] py-2'
            : 'bg-white border-b border-gray-100 py-3'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all duration-300 transform group-hover:scale-105">
              <MapPin size={18} color="white" />
            </div>
            <span className="font-extrabold text-gray-900 text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              NearNotify
            </span>
          </Link>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100/50">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive('/dashboard')
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              Discover
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/admin')
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                <Shield size={16} className={isActive('/admin') ? 'text-purple-600' : 'text-gray-400'} />
                Admin
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* User Profile Mini */}
            <div className="hidden lg:flex flex-col items-end mr-2 px-3 py-1 rounded-lg hover:bg-gray-50 cursor-default transition-colors">
              <span className="text-sm font-bold text-gray-800">{user?.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell />

              <Link
                to="/create"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <PlusCircle size={16} />
                <span>New Post</span>
              </Link>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenu(!menu)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out origin-top ${
            menu ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-4 flex flex-col gap-2">
            <Link
              to="/dashboard"
              onClick={() => setMenu(false)}
              className="flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-semibold text-gray-800 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span>Discover Nearby</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMenu(false)}
                className="flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-semibold text-gray-800 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <span className="flex items-center gap-2"><Shield size={16} /> Admin Dashboard</span>
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
            )}

            <div className="mt-2 px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Signed in as</p>
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>
            </div>
            
             <Link
                to="/create"
                onClick={() => setMenu(false)}
                className="sm:hidden flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-3 mt-2 rounded-xl shadow-md"
              >
                <PlusCircle size={16} />
                <span>Create New Post</span>
              </Link>
          </div>
        </div>
      </nav>

      {/* spacer to prevent content from hiding under fixed navbar */}
      <div className="h-[73px]"></div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <LogOut size={24} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Ready to leave?</h3>
            <p className="text-gray-500 text-sm text-center mb-8">
              Are you sure you want to log out of your NearNotify account?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-5 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 shadow-md shadow-red-200 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}