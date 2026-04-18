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
  Jobs: { color: '#2563eb', bg: 'bg-blue-600', pill: 'bg-blue-50 text-blue-700 border-blue-200', icon: Briefcase },
  Rentals: { color: '#7c3aed', bg: 'bg-violet-600', pill: 'bg-violet-50 text-violet-700 border-violet-200', icon: Home },
  Events: { color: '#d97706', bg: 'bg-amber-600', pill: 'bg-amber-50 text-amber-700 border-amber-200', icon: Calendar },
  Alerts: { color: '#dc2626', bg: 'bg-red-600', pill: 'bg-red-50 text-red-700 border-red-200', icon: Bell },
  default: { color: '#059669', bg: 'bg-emerald-600', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: MapPin },
};
const getcat = (c) => CAT[c] || CAT.default;

// Expiry: only show if within 7 days
const getExpiry = (date) => {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  if (diff <= 0) return { label: 'Expired', urgent: true };
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 7) return null; // don't show if far away
  if (hours < 24) return { label: `${hours}h left`, urgent: true };
  return { label: `${days}d left`, urgent: days <= 2 };
};

const makePinIcon = (color, pulse = false) => {
  const ring = pulse ? `<circle cx="16" cy="12" r="13" fill="${color}" opacity="0.15"><animate attributeName="r" from="9" to="17" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.25" to="0" dur="1.5s" repeatCount="indefinite"/></circle>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">${ring}<path d="M16 0C9.4 0 4 5.4 4 12c0 9 12 30 12 30S28 21 28 12C28 5.4 22.6 0 16 0z" fill="${color}" stroke="white" stroke-width="2.5"/><circle cx="16" cy="12" r="5" fill="white" opacity="0.95"/></svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -46] });
};

const YOU_ICON = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.25)"></div>`,
  className: '', iconSize: [16, 16], iconAnchor: [8, 8],
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center]);
  return null;
}


export default function Dashboard() {
  const [viewMode, setViewMode] = useState('list');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [radius, setRadius] = useState(5000);
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
    } else setLocation({ lat: 40.7128, lng: -74.006 });
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
    <div className="min-h-screen bg-[#f8fafc]">
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
              {[['map', Map, 'Map'], ['list', List, 'List']].map(([mode, Icon, label]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === mode ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${active
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
            {/* MAP */}
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
                        position={
                          post.location?.coordinates
                            ? [post.location.coordinates[1], post.location.coordinates[0]]
                            : [location.lat, location.lng]
                        }
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
              </div>
            )}
            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(post => {
                  const s = getcat(post.category);
                  const trust = getTrustLabel(post.createdBy?.trustScore ?? 50);
                  const expiry = getExpiry(post.expiryDate || post.expiresAt);

                  return (
                    <div
                      key={post._id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
                    >
                      {/* Top */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.pill}`}>
                            {post.category}
                          </span>
                          {expiry && (
                            <span className={`text-xs flex items-center gap-1 ${expiry.urgent ? 'text-red-500' : 'text-gray-400'}`}>
                              <Clock className="w-3 h-3" />
                              {expiry.label}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {post.title}
                        </h3>

                        <p className="text-sm text-gray-500 line-clamp-3">
                          {post.description}
                        </p>

                        {/* Low trust warning */}
                        {trust.label === 'Low Trust' && (
                          <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            This post is from a low-trust user. Verify before acting.
                          </div>
                        )}
                      </div>

                      {/* Bottom */}
                      <div className="mt-4 space-y-3">
                        {/* Contact */}
                        <ContactCard
                          contact={post.contact}
                          onChat={() => setChattingPost(post)}
                          isOwnPost={isOwn(post)}
                        />

                        {/* Actions */}
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full border ${trust.color} ${trust.bg} ${trust.border}`}
                          >
                            {trust.label} ({post.createdBy?.trustScore || 50})
                          </span>

                          {!isOwn(post) && (
                            <button
                              onClick={() => setReportingPostId(post._id)}
                              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                            >
                              <Flag className="w-3.5 h-3.5" />
                              Report
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Report Modal */}
            {reportingPostId && (
              <ReportModal
                postId={reportingPostId}
                onClose={() => setReportingPostId(null)}
              />
            )}

            {/* Chat Modal */}
{chattingPost && (
  <ChatModal
    post={chattingPost}
    onClose={() => setChattingPost(null)}
  />
)}

</>
)}

</div>
</div>
);
}

