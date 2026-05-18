// Trust Score System
// ─────────────────────────────────────────────
// Every user starts at 50 points.
//
// HOW IT GOES UP:
//   +10  when admin approves your post (your content is genuine)
//
// HOW IT GOES DOWN:
//   -15  when admin rejects your post (misleading or low quality)
//   -20  when users report your post (spam / fake / inappropriate)
//
// WHAT IT MEANS FOR VIEWERS:
//   Flagged (0–20)   → User has multiple rejected/reported posts. High risk.
//   Caution (21–40)  → Some issues reported. Verify before acting.
//   Member  (41–60)  → New or average user. No major issues.
//   Trusted (61–80)  → Consistent good posts. Reliable.
//   Top     (81–100) → Highly active, all posts approved. Very reliable.
// ─────────────────────────────────────────────

export const getTrustLabel = (score) => {
  if (score <= 20) return { label: 'Flagged',  color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' };
  if (score <= 40) return { label: 'Caution',  color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
  if (score <= 60) return { label: 'Member',   color: 'text-gray-500',   bg: 'bg-gray-50',   border: 'border-gray-200' };
  if (score <= 80) return { label: 'Trusted',  color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' };
  return             { label: 'Top',       color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' };
};
