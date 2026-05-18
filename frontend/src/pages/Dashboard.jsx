import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { io } from 'socket.io-client';
import { Map, List, Navigation, Flag, AlertTriangle, Clock, X, SlidersHorizontal, MapPin, Briefcase, Home, Calendar, Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ReportModal from '../components/ReportModal';
import { getTrustLabel } from '../utils/trustScore';
import ContactCard from '../components/ContactCard';
import ChatModal from '../components/ChatModal';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const CATEGORIES = ['All', 'Jobs', 'Rentals', 'Events', 'Alerts'];

const CAT = {
  Jobs:    { color: '#2563eb', bg: 'bg-blue-600',    pill: 'bg-blue-50 text-blue-700 border-blue-200',       icon: Briefcase },
  Rentals: { color: '#7c3aed', bg: 'bg-violet-600',  pill: 'bg-violet-50 text-violet-700 border-violet-200', icon: Home },
  Events:  { color: '#d97706', bg: 'bg-amber-600',   pill: 'bg-amber-50 text-amber-700 border-amber-200',    icon: Calendar },
  Alerts:  { color: '#dc2626', bg: 'bg-red-600',     pill: 'bg-red-50 text-red-700 border-red-200',          icon: Bell },
  default: { color: '#059669', bg: 'bg-emerald-600', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: MapPin },
};
const getcat = (c) => CAT[c] || CAT.default;

// Only show expiry if within 7 days
const getExpiry = (date) => {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  if (diff <= 0) return { label: 'Expired', urgent: true };
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 7) return null;
  if (hours < 24) return { label: `${hours}h left`, urgent: true };
  return { label: `${days}d left`, urgent: days <= 2 };
};

const makePinIcon = (color, pulse = false) => {
  const ring = pulse
    ? `<circle cx="16" cy="12" r="13" fill="${color}" opacity="0.15"><animate attributeName="r" from="9" to="17" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.25" to="0" dur="1.5s" repeatCount="indefinite"/></circle>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">${ring}<path d="M16 0C9.4 0 4 5.4 4 12c0 9 12 30 12 30S28 21 28 12C28 5.4 22.6 0 16 0z" fill="${color}" stroke="white" stroke-width="2.5"/><circle cx="16" cy="12" r="5" fill="white" opacity="0.95"/></svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -46] });
};

const YOU_ICON = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.25)"></div>`,
  className: '', iconSize: [16, 16], iconAnchor: [8, 8],
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] != null && center[1] != null) {
      map.setView(center, map.getZoom());
    }
  }, [center[0], center[1]]);
  return null;
}

export default function Dashboard() {
  const [viewMode, setViewMode] = useState('list');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [radius, setRadius] = useState(20000);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState(null);
  const [reportingPostId, setReportingPostId] = useState(null);
  const [chattingPost, setChattingPost] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setLocation({ lat: 40.7128, lng: -74.006 })
      );
    } else {
      setLocation({ lat: 40.7128, lng: -74.006 });
    }
  }, []);

  useEffect(() => {
    if (!location.lat) return;
    fetchPosts();
    const socket = io('http://localhost:5000');
    socket.on('new_post', p => setPosts(prev => [p, ...prev]));
    return () => socket.disconnect();
  }, [location, radius]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/posts?lat=${location.lat}&lng=${location.lng}&radius=${radius}`);
      setPosts(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const isOwn = p => !user || p.createdBy?._id?.toString() === user._id?.toString();
  const filtered = activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory);
  const counts = posts.reduce((a, p) => { a[p.category] = (a[p.category] || 0) + 1; return a; }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Discover Nearby</h1>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-500" />
              {posts.length} listing{posts.length !== 1 ? 's' : ''} within {radius / 1000}km
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <div className="flex bg-white rounded-xl border border-gray-200 p-1 gap-0.5">
              <button onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Map className="w-3.5 h-3.5" /> Map
              </button>
              <button onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Search Radius — {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
            </p>
            <input type="range" min="500" max="20000" step="500" value={radius}
              onChange={e => setRadius(Number(e.target.value))} className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1.5"><span>500m</span><span>20km</span></div>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(c => {
            const s = getcat(c);
            const n = c === 'All' ? posts.length : (counts[c] || 0);
            const active = activeCategory === c;
            return (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  active
                    ? c === 'All' ? 'bg-gray-900 text-white border-gray-900 shadow-sm' : `${s.bg} text-white border-transparent shadow-sm`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                {c}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>{n}</span>
              </button>
            );
          })}
        </div>

        {loading && !location.lat ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* MAP VIEW */}
            {viewMode === 'map' && location.lat && (
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200 h-[600px]">
                <MapContainer center={[location.lat, location.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <ChangeView center={[location.lat, location.lng]} />
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <Circle center={[location.lat, location.lng]}
                    pathOptions={{ fillColor: '#2563eb', fillOpacity: 0.05, color: '#2563eb', weight: 1.5, dashArray: '5 4' }}
                    radius={radius} />
                  <Marker position={[location.lat, location.lng]} icon={YOU_ICON}>
                    <Popup><p className="font-semibold text-blue-600 text-sm text-center px-2 py-0.5">You are here</p></Popup>
                  </Marker>
                  {filtered.map(post => {
                    const s = getcat(post.category);
                    const trust = getTrustLabel(post.createdBy?.trustScore ?? 50);
                    return (
                      <Marker key={post._id}
                        position={[post.location.coordinates[1], post.location.coordinates[0]]}
                        icon={makePinIcon(s.color, post.category === 'Alerts')}
                        eventHandlers={{ click: () => setSelectedPost(post) }}>
                        <Popup minWidth={210} maxWidth={250}>
                          <div className="space-y-2 p-0.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.pill}`}>{post.category}</span>
                            <p className="font-bold text-gray-900 text-sm">{post.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">{post.description}</p>
                            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${trust.color} ${trust.bg} ${trust.border}`}>{trust.label}</span>
                              <span className="text-xs text-gray-400">{post.createdBy?.name}</span>
                            </div>
                            <button onClick={() => setSelectedPost(post)} className="w-full py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: s.color }}>
                              View &amp; Contact
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
                <div className="absolute bottom-4 left-4 z-[999] bg-white/95 backdrop-blur rounded-xl shadow border border-gray-200 px-3 py-2.5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Legend</p>
                  {Object.entries(CAT).filter(([k]) => k !== 'default').map(([c, s]) => (
                    <div key={c} className="flex items-center gap-2 mb-1 last:mb-0">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-xs text-gray-700">{c}</span>
                      {counts[c] ? <span className="text-xs text-gray-400">({counts[c]})</span> : null}
                    </div>
                  ))}
                </div>
                {filtered.length === 0 && !loading && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] bg-white rounded-xl shadow border border-gray-200 px-4 py-2.5 text-sm text-gray-500">
                    No posts in this area
                  </div>
                )}
              </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
              filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                    <MapPin className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-gray-700 font-semibold text-lg">No listings found nearby</p>
                  <p className="text-sm text-gray-400 mt-1">Try increasing the search radius in Filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map(post => {
                    const s = getcat(post.category);
                    const exp = getExpiry(post.expiryDate);
                    const trust = getTrustLabel(post.createdBy?.trustScore ?? 50);
                    const initial = (post.createdBy?.name || 'U')[0].toUpperCase();
                    const CatIcon = s.icon;
                    return (
                      <div key={post._id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

                        {/* Top color bar */}
                        <div className="h-1.5 w-full flex-shrink-0" style={{ background: s.color }} />

                        <div className="p-5 flex flex-col flex-1">

                          {/* Row 1: category badge + expiry (only if within 7 days) */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.pill}`}>
                              <CatIcon className="w-3 h-3" />
                              {post.category}
                            </span>
                            {exp && (
                              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${exp.urgent ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-orange-50 text-orange-500 border border-orange-200'}`}>
                                <Clock className="w-3 h-3" />{exp.label}
                              </span>
                            )}
                          </div>

                          {/* Row 2: title */}
                          <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2 min-h-[2.75rem]">
                            {post.title}
                          </h3>

                          {/* Row 3: description — always 2 lines */}
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 min-h-[2.5rem]">
                            {post.description || 'No description provided.'}
                          </p>

                          {/* Row 4: author + trust */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ background: s.color }}>
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{post.createdBy?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-400">Posted by</p>
                              </div>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${trust.color} ${trust.bg} ${trust.border}`}>
                              {trust.label}
                            </span>
                          </div>

                          {/* Low trust warning */}
                          {post.createdBy?.trustScore !== undefined && post.createdBy.trustScore <= 40 && (
                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                              Low-trust user — verify before acting.
                            </div>
                          )}

                          {/* Contact section — always at bottom */}
                          <div className="border-t border-gray-100 pt-4 mt-auto">
                            <ContactCard
                              contact={post.contact}
                              isOwnPost={isOwn(post)}
                              onChat={() => setChattingPost(post)}
                            />
                            {user && (
                              <button onClick={() => setReportingPostId(post._id)}
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors mt-3">
                                <Flag className="w-3 h-3" /> Report this listing
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </>
        )}

        {/* Map side panel */}
        {selectedPost && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-[1000] flex flex-col border-l border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${getcat(selectedPost.category).pill}`}>
                {selectedPost.category}
              </span>
              <button onClick={() => setSelectedPost(null)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <h2 className="text-xl font-bold text-gray-900">{selectedPost.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedPost.description}</p>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Posted by</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedPost.createdBy?.name || 'Unknown'}</p>
                </div>
                {(() => {
                  const trust = getTrustLabel(selectedPost.createdBy?.trustScore ?? 50);
                  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${trust.color} ${trust.bg} ${trust.border}`}>{trust.label} · {selectedPost.createdBy?.trustScore ?? 50}</span>;
                })()}
              </div>
              <ContactCard
                contact={selectedPost.contact}
                isOwnPost={isOwn(selectedPost)}
                onChat={() => { setChattingPost(selectedPost); setSelectedPost(null); }}
              />
              {user && (
                <button onClick={() => { setReportingPostId(selectedPost._id); setSelectedPost(null); }}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
                  <Flag className="w-4 h-4" /> Report this listing
                </button>
              )}
            </div>
          </div>
        )}

        {reportingPostId && <ReportModal postId={reportingPostId} onClose={() => setReportingPostId(null)} />}
        {chattingPost && <ChatModal post={chattingPost} onClose={() => setChattingPost(null)} />}
      </div>
    </div>
  );
}
