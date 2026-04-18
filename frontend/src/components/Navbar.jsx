import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, LogOut, PlusCircle, ShieldAlert, X } from 'lucide-react';
import { getTrustLabel } from '../utils/trustScore';

const LogoutModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <LogOut className="w-5 h-5 text-red-500" />
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Log out?</h3>
      <p className="text-sm text-gray-500 mb-6">You'll need to sign in again to access your account.</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setShowLogout(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <MapPin className="h-8 w-8 text-blue-600" />
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  NearNotify
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden md:flex flex-col text-right mr-4 border-r pr-4 border-gray-200">
                    <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                    {(() => {
                      const trust = getTrustLabel(user.trustScore ?? 50);
                      return (
                        <span className={`text-xs font-medium ${trust.color}`}>
                          {trust.label} · {user.trustScore ?? 50}
                        </span>
                      );
                    })()}
                  </div>

                  <Link to="/create-post" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg">
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">New Post</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-medium transition-all">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  )}

                  <button
                    onClick={() => setShowLogout(true)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="space-x-2">
                  <Link to="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {showLogout && (
        <LogoutModal
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
};

export default Navbar;
