import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AISummaryBanner() {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    api.get('/posts/summary')
      .then(({ data }) => setSummary(data.summary))
      .catch(() => {});
  }, []);

  if (!summary || summary === 'No posts near you today yet.') return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
      color: 'white', borderRadius: '1rem',
      padding: '12px 16px', marginBottom: '16px',
      display: 'flex', alignItems: 'center', gap: '10px'
    }}>
      <span style={{ fontSize: '18px' }}>✨</span>
      <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{summary}</p>
    </div>
  );
}