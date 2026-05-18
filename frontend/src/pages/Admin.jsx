import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Shield, CheckCircle, XCircle, UserX, AlertTriangle, Flag, Clock, FileText } from 'lucide-react';
import TrustBadge from '../components/TrustBadge';

const TABS = [
  { key: 'pending',  label: 'Needs Review',  desc: 'Flagged or reported posts' },
  { key: 'approved', label: 'Approved',       desc: 'Live posts' },
  { key: 'rejected', label: 'Rejected',       desc: 'Removed posts' },
  { key: 'reported', label: 'Reported',       desc: 'User-reported posts' },
];

const CAT_PILL = {
  Jobs:    'bg-blue-50 text-blue-700 border-blue-200',
  Rentals: 'bg-violet-50 text-violet-700 border-violet-200',
  Events:  'bg-amber-50 text-amber-700 border-amber-200',
  Alerts:  'bg-red-50 text-red-700 border-red-200',
};

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/dashboard'); return; }
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'reported'
        ? '/admin/posts?status=reported'
        : `/admin/posts?status=${activeTab}`;
      const { data } = await api.get(url);
      // backend returns { posts: [...] }
      setPosts(data.posts || data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/posts/${id}/approve`);
      setPosts(p => p.filter(x => x._id !== id));
      notify('Post approved and is now live.');
    } catch (err) { notify('Failed: ' + (err.response?.data?.message || 'error')); }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/posts/${id}/reject`);
      setPosts(p => p.filter(x => x._id !== id));
      notify('Post rejected.');
    } catch (err) { notify('Failed.'); }
  };

  const handleBlock = async (userId, name) => {
    if (!window.confirm(`Block user "${name}"? They won't be able to log in.`)) return;
    try {
      await api.put(`/admin/users/${userId}/toggle-active`);
      notify(`User "${name}" has been blocked.`);
      fetchPosts();
    } catch { notify('Failed to block user.'); }
  };

  if (!user || user.role !== 'admin') return null;

  const currentTab = TABS.find(t => t.key === activeTab);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-400">NearNotify moderation dashboard</p>
          </div>
        </div>

        {/* How approval works — info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-6 mt-4">
          <p className="text-sm text-blue-800 font-semibold mb-1">How post moderation works</p>
          <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
            <li>Normal posts are <strong>auto-approved</strong> and go live instantly</li>
            <li>Posts with spam keywords are flagged and appear here for review</li>
            <li>Posts with 3+ user reports are pulled back here automatically</li>
            <li>You approve or reject only the flagged/reported ones</li>
          </ul>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
            {toast}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-2xl mb-6 w-fit shadow-sm">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === t.key
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab description */}
        <p className="text-sm text-gray-500 mb-4">{currentTab?.desc}</p>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">All clear</p>
            <p className="text-sm text-gray-400 mt-1">No {currentTab?.label.toLowerCase()} posts right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => {
              const isSuspicious = post.isSuspicious || (post.reportCount >= 3);
              return (
                <div key={post._id}
                  className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col lg:flex-row gap-5 ${
                    isSuspicious ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                  }`}>

                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${CAT_PILL[post.category] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {post.category}
                      </span>
                      {isSuspicious && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Suspicious
                        </span>
                      )}
                      {activeTab === 'reported' && post.reportCount > 0 && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                          <Flag className="w-3 h-3" /> {post.reportCount} report{post.reportCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {activeTab === 'reported' && post.reportReasons?.length > 0 && (
                        [...new Set(post.reportReasons)].map(r => (
                          <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{r}</span>
                        ))
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-base mb-1">{post.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.description}</p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 border-t border-gray-100 pt-3">
                      <span>By <span className="text-gray-700 font-semibold">{post.createdBy?.name || 'Unknown'}</span></span>
                      <TrustBadge badge={post.createdBy?.trustBadge} score={post.createdBy?.trustScore} />
                      {post.contact && <span>📞 {post.contact}</span>}
                      {post.expiryDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires {new Date(post.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                      {post.createdBy?.isBlocked && (
                        <span className="text-red-500 font-semibold">User Blocked</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 flex-shrink-0 lg:min-w-[130px]">
                    {post.status !== 'approved' && (
                      <button onClick={() => handleApprove(post._id)}
                        className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {post.status !== 'rejected' && (
                      <button onClick={() => handleReject(post._id)}
                        className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    )}
                    {post.createdBy && !post.createdBy.isBlocked && (
                      <button onClick={() => handleBlock(post.createdBy._id, post.createdBy.name)}
                        className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                        <UserX className="w-4 h-4" /> Block
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
