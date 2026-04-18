import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CheckCircle2, MapPin } from 'lucide-react';

const LocationPicker = ({ position, setPosition, radius }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? (
    <>
      <Marker position={position} />
      <Circle center={position} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} radius={radius} />
    </>
  ) : null;
};

// Component to recenter map when location first found
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Alerts',
    contact: '',
    radius: 1000,
    expiryDays: 1, // Will transform to date
  });
  
  const [position, setPosition] = useState(null);
  const [defaultCenter, setDefaultCenter] = useState([40.7128, -74.0060]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setDefaultCenter([coords.lat, coords.lng]);
          setPosition(coords); // default marker to user loc
        },
        (err) => console.log('Location access denied', err)
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      setError('Please select a location on the map.');
      return;
    }

    setLoading(true);
    try {
      // Calculate Expiry Date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(formData.expiryDays));

      await api.post('/posts', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        contact: formData.contact,
        radius: Number(formData.radius),
        latitude: position.lat,
        longitude: position.lng,
        expiryDate
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
            Create Local Notice
          </h2>
          <p className="text-sm text-gray-500 mt-1">Share information with people nearby</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Lost Golden Retriever" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Alerts">Alerts</option>
                  <option value="Jobs">Jobs</option>
                  <option value="Rentals">Rentals</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows="4" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Provide more details..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                    <input required type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                      value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="Phone / Email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires In (Days)</label>
                  <input required type="number" min="1" max="30" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={formData.expiryDays} onChange={e => setFormData({...formData, expiryDays: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Map Area */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 font-semibold flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-rose-500" /> Location & Reach
                </label>
                {!position && <span className="text-xs text-rose-500 animate-pulse">Click map to pin location</span>}
              </div>

              <div className="h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
                <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <ChangeView center={defaultCenter} />
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <LocationPicker position={position} setPosition={setPosition} radius={formData.radius} />
                </MapContainer>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Broadcast Radius</span>
                  <span className="font-semibold text-blue-600">{formData.radius >= 1000 ? `${formData.radius/1000} km` : `${formData.radius} m`}</span>
                </div>
                <input type="range" min="500" max="10000" step="500" className="w-full accent-blue-600"
                  value={formData.radius} onChange={e => setFormData({...formData, radius: e.target.value})} />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>500m</span>
                  <span>10km</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-3 rounded-xl font-medium shadow-md transition-all">
              {loading ? 'Posting...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
