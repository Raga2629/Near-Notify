import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth }    from './context/AuthContext';
import SplashScreen   from './components/SplashScreen';
import Navbar from './components/Navbar';
import Landing        from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import AdminPanel from './pages/Admin';
import AuthCallback from './pages/AuthCallback';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user)                 return <Navigate to="/login"    replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};


export default function App() {
  const { user }              = useAuth();
  const [splash, setSplash]   = useState(true);
  const location = useLocation();

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />;

  return (
    <div className="min-h-screen bg-slate-50">
      {user && location.pathname !== '/' && <Navbar />}
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={!user ? <Login />    : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard  /></ProtectedRoute>} />
        <Route path="/create"    element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/admin"     element={<AdminRoute>    <AdminPanel /></AdminRoute>}     />
        <Route path="*"          element={<Navigate to={user ? '/dashboard' : '/'} />}    />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </div>
  );
}
