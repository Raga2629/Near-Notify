import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldAlert, CheckCircle, XCircle, Flag, UserX, AlertTriangle } from 'lucide-react';
import { getTrustLabel } from '../utils/trustScore';

const TABS = ['pending', 'approved', 'rejected', 'reported'];

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchPosts();
  }, [user, navigate, activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'reported'
        ? '/admin/posts/reported'
        : `/admin/posts/status/${activeTab}`;
      const { data } = await api.get(url);
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const notify = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/posts/${id}/approve`);
      setPosts(posts.filter(p => p._id !== id));
      notify('Post approved.');
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/posts/${id}/reject`);
      setPosts(posts.filter(p => p._id !== id));
      notify('Post rejected.');
    } catch (err) { console.error(err); }
  };

  const handleBlock = async (userId, userName) => {
    if (!window.confirm(`Block user "${userName}"?`)) return;
    try {
      await api.put(`/admin/users/${userId}/block`);
      notify(`User "${userName}" has been blocked.`);
      fetchPosts();
    } catch (err) { console.error(err); }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {actionMsg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          {actionMsg}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex bg-gray-50 border-b border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold text-center transition-colors capitalize flex items-center justify-center gap-1.5
                ${activeTab === tab ? 'border-b-2 border-purple-600 text-purple-700 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
            >
              {tab === 'reported' && <Flag className="w-3.5 h-3.5" />}
              {tab} {activeTab === tab ? `(${posts.length})` : ''}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No <span className="font-semibold text-gray-700">{activeTab}</span> posts right now.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map(post => {
              const trust = getTrustLabel(post.createdBy?.trustScore ?? 50);
              const isSuspicious = post.isSuspicious || (post.reportCount >= 3);
              return (
                <div
                  key={post._id}
                  className={`p-6 transition-colors flex flex-col lg:flex-row justify-between lg:items-start gap-6
                    ${isSuspicious ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50/50'}
                    ${post.status === 'rejected' ? 'opacity-75' : ''}`}
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        {post.category}
                      </span>
                      {isSuspicious && (
                        <span className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs border border-red-200">
                          <AlertTriangle className="w-3 h-3" /> Suspicious
                        </span>
                      )}
                      {activeTab === 'reported' && post.reportCount && (
                        <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs border border-orange-200">
                          <Flag className="w-3 h-3" /> {post.reportCount} report{post.reportCount > 1 ? 's' : ''}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        post.status === 'approved' ? 'bg-green-100 text-green-800' :
                        post.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                        {post.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                    <p className="text-gray-600 text-sm max-w-3xl line-clamp-2">{post.description}</p>

                    {activeTab === 'reported' && post.reportReasons?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {[...new Set(post.reportReasons)].map(r => (
                          <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{r}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-gray-500 pt-2 border-t border-gray-100">
                      <p>Author: <span className="text-gray-800">{post.createdBy?.name || 'Unknown'}</span></p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${trust.color} ${trust.bg} ${trust.border}`}>
                        {trust.label} ({post.createdBy?.trustScore ?? 0})
                      </span>
                      <p>Contact: <span className="text-gray-800">{post.contact}</span></p>
                      {post.createdBy?.isBlocked && (
                        <span className="text-red-500 font-semibold">User Blocked</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {post.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(post._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-xl transition-all border border-green-200 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {post.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(post._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl transition-all border border-red-200 text-sm"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    )}
                    {post.createdBy && !post.createdBy.isBlocked && (
                      <button
                        onClick={() => handleBlock(post.createdBy._id, post.createdBy.name)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all border border-gray-200 text-sm"
                      >
                        <UserX className="w-4 h-4" /> Block User
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
};

export default Admin;
