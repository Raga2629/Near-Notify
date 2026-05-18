import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import TrustBadge from './TrustBadge';

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored marker icons per category
const categoryIcon = (category) => {
  const colors = {
    Jobs:    '#1B3A6B',
    Rentals: '#7C3AED',
    Events:  '#16A34A',
    Alerts:  '#F97316',
  };
  const color = colors[category] || '#1B3A6B';
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize:   [32, 32],
    iconAnchor: [16, 32],
    popupAnchor:[0, -32],
  });
};

// Re-center map when location changes
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 14);
  }, [lat, lng]);
  return null;
}

export default function MapView({ posts, location, radius }) {
  if (!location) return (
    <div className="h-64 bg-slate-100 rounded-2xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Detecting your location...</p>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '420px' }}>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <RecenterMap lat={location.lat} lng={location.lng} />

        {/* User location radius circle */}
        <Circle
          center={[location.lat, location.lng]}
          radius={radius}
          pathOptions={{
            color:       '#1B3A6B',
            fillColor:   '#1B3A6B',
            fillOpacity: 0.08,
            weight:      2,
            dashArray:   '6 4',
          }}
        />

        {/* User location marker */}
        <Marker
          position={[location.lat, location.lng]}
          icon={L.divIcon({
            className: '',
            html: `<div style="
              width:16px;height:16px;background:#F97316;
              border-radius:50%;border:3px solid white;
              box-shadow:0 0 0 3px rgba(249,115,22,0.3);
            "></div>`,
            iconSize:   [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Popup><strong>You are here</strong></Popup>
        </Marker>

        {/* Post markers */}
        {posts.map((post) => {
          const [lng, lat] = post.location.coordinates;
          return (
            <Marker
              key={post._id}
              position={[lat, lng]}
              icon={categoryIcon(post.category)}
            >
              <Popup maxWidth={220}>
                <div style={{ fontFamily: 'sans-serif', minWidth: '180px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                    <span style={{
                      fontSize:'10px', padding:'2px 8px', borderRadius:'20px',
                      background:'#EFF6FF', color:'#1B3A6B', fontWeight:'600'
                    }}>{post.category}</span>
                  </div>
                  <p style={{ fontWeight:'600', fontSize:'13px', marginBottom:'4px' }}>
                    {post.title}
                  </p>
                  <p style={{ fontSize:'11px', color:'#6B7280', marginBottom:'8px', lineHeight:'1.4' }}>
                    {post.description.slice(0, 80)}...
                  </p>
                  {post.contact && (
                    <p style={{ fontSize:'11px', color:'#1B3A6B', marginBottom:'6px' }}>
                      📞 {post.contact}
                    </p>
                  )}
                  <div style={{ display:'flex', gap:'6px' }}>
                    {post.contact && (
                      <a href={`tel:${post.contact}`} style={{
                        flex:1, background:'#1B3A6B', color:'white',
                        padding:'5px', borderRadius:'8px', fontSize:'11px',
                        textAlign:'center', textDecoration:'none', fontWeight:'500'
                      }}>Call</a>
                    )}
                    {post.contact && (
                      <a href={`https://wa.me/91${post.contact}`} target="_blank" rel="noreferrer"
                         style={{
                           flex:1, background:'#25D366', color:'white',
                           padding:'5px', borderRadius:'8px', fontSize:'11px',
                           textAlign:'center', textDecoration:'none', fontWeight:'500'
                         }}>WhatsApp</a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}