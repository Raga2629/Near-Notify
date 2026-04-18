import React, { useState } from 'react';
import api from '../services/api';
import { Flag, X } from 'lucide-react';

const REASONS = ['spam', 'fake', 'inappropriate'];

const ReportModal = ({ postId, onClose }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason) return setError('Please select a reason.');
    setLoading(true);
    setError('');
    try {
      await api.post('/reports', { postId, reason });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" /> Report Post
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-semibold">Report submitted. Thank you.</p>
            <button onClick={onClose} className="mt-4 text-sm text-gray-500 underline">Close</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">Why are you reporting this post?</p>
            <div className="flex flex-col gap-2 mb-4">
              {REASONS.map((r) => (
                <label key={r} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-red-500"
                  />
                  <span className="capitalize text-gray-700 text-sm">{r}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
