// TrustBadge — shows a user's trust level based on their score
// Score is built from post approvals (+10), rejections (-15), and reports (-20)

export default function TrustBadge({ score = 50 }) {
  let label, color, bg, border;

  if (score <= 20)      { label = 'Flagged'; color = '#dc2626'; bg = '#fef2f2'; border = '#fecaca'; }
  else if (score <= 40) { label = 'Caution'; color = '#ea580c'; bg = '#fff7ed'; border = '#fed7aa'; }
  else if (score <= 60) { label = 'Member';  color = '#6b7280'; bg = '#f9fafb'; border = '#e5e7eb'; }
  else if (score <= 80) { label = 'Trusted'; color = '#2563eb'; bg = '#eff6ff'; border = '#bfdbfe'; }
  else                  { label = 'Top';     color = '#16a34a'; bg = '#f0fdf4'; border = '#bbf7d0'; }

  return (
    <span style={{
      background: bg, color, border: `1px solid ${border}`,
      fontSize: '11px', padding: '2px 8px',
      borderRadius: '9999px', fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
