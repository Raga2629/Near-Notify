import React, { useState } from 'react';
import { Phone, MessageCircle, Copy, CheckCheck } from 'lucide-react';

const ContactCard = ({ contact = '', onChat, isOwnPost = false }) => {
  const [copied, setCopied] = useState(false);
  const cleanNumber = (contact || '').replace(/\D/g, '');

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!contact) return;
    navigator.clipboard.writeText(contact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      {/* Number row */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-800 truncate">
            {contact || 'No contact provided'}
          </span>
        </div>
        {contact && (
          <button onClick={handleCopy}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ml-2 flex-shrink-0 transition-all ${
              copied ? 'bg-green-100 text-green-600' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}>
            {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <a href={`tel:${cleanNumber}`} onClick={e => e.stopPropagation()}
          className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors">
          <Phone className="w-4 h-4" />
          <span className="text-xs font-semibold">Call</span>
        </a>
        <a href={`https://wa.me/${cleanNumber}`} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">WhatsApp</span>
        </a>
        <button
          onClick={(e) => { e.stopPropagation(); if (!isOwnPost) onChat?.(); }}
          disabled={isOwnPost}
          title={isOwnPost ? 'Your own post' : 'Chat with poster'}
          className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-colors ${
            isOwnPost ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}>
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">Chat</span>
        </button>
      </div>
    </div>
  );
};

export default ContactCard;
