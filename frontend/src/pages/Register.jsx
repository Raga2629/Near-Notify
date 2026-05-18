// import React, { useState, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';
// import api from '../services/api';

// const GoogleIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
//     <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
//     <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
//     <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
//     <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
//   </svg>
// );

// const Register = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);

//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await api.post('/auth/register', { name, email, password });
//       login(data);
//       navigate('/');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Registration failed');
//     }
//   };

//   const handleGoogle = () => {
//     window.location.href = 'http://localhost:5000/auth/google';
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
//       <div className="w-full max-w-md p-8 bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
//         <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center mb-2">
//           Create Account
//         </h2>
//         <p className="text-center text-gray-400 text-sm mb-8">Join NearNotify today</p>

//         {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 text-center">{error}</div>}

//         {/* Google button */}
//         <button
//           onClick={handleGoogle}
//           className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all shadow-sm hover:shadow mb-6"
//         >
//           <GoogleIcon />
//           Continue with Google
//         </button>

//         {/* Divider */}
//         <div className="flex items-center gap-3 mb-6">
//           <div className="flex-1 h-px bg-gray-200" />
//           <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
//           <div className="flex-1 h-px bg-gray-200" />
//         </div>

//         <form onSubmit={handleRegister} className="space-y-5">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//             <input type="text"
//               className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
//               value={name} onChange={e => setName(e.target.value)} required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//             <input type="email"
//               className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
//               value={email} onChange={e => setEmail(e.target.value)} required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//             <input type="password"
//               className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
//               value={password} onChange={e => setPassword(e.target.value)} required minLength="6" />
//           </div>
//           <button type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-all shadow-md hover:shadow-lg">
//             Sign Up
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-500">
//           Already have an account?{' '}
//           <Link to="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Register() {
  const [form,    setForm   ] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password min 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Welcome to NearNotify! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12"
           style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0F2447 100%)' }}>
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin size={32} color="white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Join NearNotify</h2>
          <p className="text-blue-200 leading-relaxed">
            Connect with your neighbourhood. Post jobs, find rentals, 
            discover events and stay safe with community alerts.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center">
                <MapPin size={16} color="white" />
              </div>
              <span className="font-bold text-gray-900">NearNotify</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
            <p className="text-gray-500 text-sm">Join your local community board</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Your name" required
                  value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                  className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="you@example.com" required
                  value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                  className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" placeholder="Min. 6 characters" required
                  value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                  className="input-field pl-10" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}