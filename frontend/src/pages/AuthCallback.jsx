import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// This page handles the redirect from Google OAuth
// URL: /auth/callback?user=<encoded JSON>
const AuthCallback = () => {
  const [params] = useSearchParams();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const userParam = params.get('user');
    const error = params.get('error');

    if (error || !userParam) {
      navigate('/login?error=google_failed');
      return;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userParam));
      login(userData);
      navigate('/');
    } catch {
      navigate('/login?error=google_failed');
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default AuthCallback;
