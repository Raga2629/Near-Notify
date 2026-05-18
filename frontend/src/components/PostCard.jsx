import { useState } from 'react';
import TrustBadge     from './TrustBadge';
import CountdownTimer from './CountdownTimer';
import { Phone, MessageCircle, Flag, Copy, AlertTriangle } from 'lucide-react';
import api  from '../services/api';
import toast from 'react-hot-toast';

const CATEGORY_STYLES = {
  Jobs:    { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  Rentals: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Events:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  Alerts:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

export default function PostCard({ post, onReport }) {
  const [reported, setReported] = useState(false);
  const style = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.Jobs;
  const isLowTrust = post.author?.trustScore < 10;

  const handleReport = async () => {
    const reason = prompt('Reason for reporting (optional):');
    if (reason === null) return;
    try {
      await api.post(`/posts/${post._id}/report`, { reason });
      toast.success('Post reported.');
      setReported(true);
      if (onReport) onReport(post._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report.');
    }
  };

  const copyNumber = () => {
    if (post.contact) {
      navigator.clipboard.writeText(post.contact);
      toast.success('Number copied!');
    }
  };

  return (
    <div className={`card hover:shadow-md transition-all duration-200 flex flex-col
                     ${post.category === 'Alerts' ? 'border-orange-200' : ''}`}>

      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-3 py-1 rounded-full font-semibold border
                         ${style.bg} ${style.text} ${style.border}`}>
          {post.category}
        </span>
        <CountdownTimer expiresAt={post.expiresAt} />
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-base mb-1 leading-snug">
        {post.title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed mb-3 flex-1 line-clamp-3">
        {post.description}
      </p>

      {/* Low trust warning */}
      {isLowTrust && (
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 
                        rounded-xl px-3 py-2 mb-3">
          <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-xs font-medium">
            Low-trust user — verify before acting.
          </p>
        </div>
      )}

      {/* Contact */}
      {post.contact && (
        <div className="flex items-center justify-between bg-slate-50 rounded-xl 
                        px-3 py-2 mb-3">
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">{post.contact}</span>
          </div>
          <button onClick={copyNumber}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1">
            <Copy size={13} />
          </button>
        </div>
      )}

      {/* Action buttons */}
      {post.contact && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <a href={`tel:${post.contact}`}
            className="flex items-center justify-center gap-1.5 bg-blue-700 text-white 
                       py-2.5 rounded-xl text-xs font-semibold hover:bg-blue-800 
                       transition-all active:scale-95">
            <Phone size={13} /> Call
          </a>
          <a href={`https://wa.me/91${post.contact}`} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-1.5 bg-green-500 text-white 
                       py-2.5 rounded-xl text-xs font-semibold hover:bg-green-600 
                       transition-all active:scale-95">
            <MessageCircle size={13} /> WhatsApp
          </a>
          <button className="flex items-center justify-center gap-1.5 bg-slate-100 
                             text-gray-600 py-2.5 rounded-xl text-xs font-semibold 
                             hover:bg-slate-200 transition-all active:scale-95">
            <MessageCircle size={13} /> Chat
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center 
                          justify-center text-xs font-bold text-blue-700">
            {post.author?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 leading-none mb-0.5">
              {post.author?.name}
            </p>
            <TrustBadge badge={post.author?.trustBadge} />
          </div>
        </div>
        <button onClick={handleReport} disabled={reported}
          className={`p-1.5 rounded-lg transition-colors ${
            reported ? 'text-gray-200' : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
          }`} title="Report">
          <Flag size={13} />
        </button>
      </div>
    </div>
  );
}