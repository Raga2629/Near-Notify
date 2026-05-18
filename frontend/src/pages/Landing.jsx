import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Shield, Zap, Users, ChevronRight, Star } from 'lucide-react';

const FEATURES = [
  { icon: <MapPin size={22} />,  color: 'bg-blue-100 text-blue-700',   title: 'Hyperlocal',   desc: 'See only posts within 500m to 2km of you' },
  { icon: <Shield size={22} />,  color: 'bg-green-100 text-green-700', title: 'Verified',     desc: 'Every post reviewed by local admins' },
  { icon: <Zap size={22} />,     color: 'bg-orange-100 text-orange-600',title: 'Real-time',   desc: 'Instant alerts for jobs, events and alerts' },
  { icon: <Users size={22} />,   color: 'bg-purple-100 text-purple-700',title: 'Trusted',     desc: 'Trust scores protect you from fraud' },
];

const CATEGORIES = [
  { name: 'Jobs',    emoji: '💼', color: 'bg-blue-50   border-blue-200   text-blue-800',   count: '240+' },
  { name: 'Rentals', emoji: '🏠', color: 'bg-purple-50 border-purple-200 text-purple-800', count: '85+'  },
  { name: 'Events',  emoji: '🎉', color: 'bg-green-50  border-green-200  text-green-800',  count: '120+' },
  { name: 'Alerts',  emoji: '🚨', color: 'bg-orange-50 border-orange-200 text-orange-800', count: '30+'  },
];

const TESTIMONIALS = [
  { name: 'Priya S.',   area: 'Kompally',    text: 'Found a job within 2 days of posting!',         rating: 5 },
  { name: 'Ravi K.',    area: 'Medchal',     text: 'Got my flat rented out in just one week.',       rating: 5 },
  { name: 'Ananya M.',  area: 'Shamirpet',   text: 'Love the trust scores — feels very safe.',       rating: 5 },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center">
              <MapPin size={18} color="white" />
            </div>
            <span className="text-xl font-bold text-gray-900">NearNotify</span>
          </div>
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-blue-700 font-medium text-sm px-4 py-2
                             rounded-xl hover:bg-blue-50 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary text-sm py-2 px-5"
                >
                  Get Started
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-sm py-2 px-5"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0F2447 100%)' }}
               className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #F97316 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3B82F6 0%, transparent 50%)' }} />

        <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 
                            text-xs font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live in Hyderabad · 1,200+ active posts
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
              Discover what's happening
              <span className="text-orange-400"> near you</span>
            </h1>
            <p className="text-blue-200 text-lg mb-8 leading-relaxed">
              Jobs, rentals, events and community alerts — all within your neighbourhood.
              Verified, trusted, hyperlocal.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => navigate('/register')}
                className="btn-orange flex items-center gap-2 text-base px-6 py-3"
              >
                Start Exploring <ChevronRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-white/10 text-white border border-white/20 px-6 py-3 
                           rounded-xl hover:bg-white/20 transition-all font-medium text-base"
              >
                Sign In
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { n: '1,200+', l: 'Active Posts'    },
                { n: '340+',   l: 'Verified Users'  },
                { n: '5km',    l: 'Max Radius'       },
                { n: '98%',    l: 'Trust Rate'       },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-bold text-white">{s.n}</div>
                  <div className="text-blue-300 text-xs">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by category</h2>
          <p className="text-gray-500 text-sm mb-8">Find exactly what you need in your neighbourhood</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate('/register')}
                className={`${cat.color} border-2 rounded-2xl p-5 text-left 
                            hover:scale-105 transition-all duration-200 group`}
              >
                <div className="text-3xl mb-3">{cat.emoji}</div>
                <div className="font-bold text-base">{cat.name}</div>
                <div className="text-xs opacity-70 mt-1">{cat.count} near you</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Why NearNotify?
          </h2>
          <p className="text-gray-500 text-sm mb-10 text-center">
            Built for your community, with trust at the core
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card hover:shadow-md transition-all duration-200">
                <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center 
                                 justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Loved by the community
          </h2>
          <p className="text-gray-500 text-sm mb-10 text-center">Real stories from real neighbours</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card">
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center 
                                  justify-center text-blue-700 font-bold text-xs">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.area}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0F2447 100%)' }}
               className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to connect with your neighbourhood?
          </h2>
          <p className="text-blue-200 mb-8">
            Join thousands of people already using NearNotify
          </p>
          <button
            onClick={() => navigate('/register')}
            className="btn-orange text-base px-8 py-3 flex items-center gap-2 mx-auto"
          >
            Get Started — It's Free <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row 
                        items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin size={14} color="white" />
            </div>
            <span className="text-white font-bold">NearNotify</span>
          </div>
          <p className="text-gray-400 text-xs">
            © 2026 NearNotify · Hyderabad, India
          </p>
          <div className="flex gap-4 text-gray-400 text-xs">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
            <span className="hover:text-white cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}