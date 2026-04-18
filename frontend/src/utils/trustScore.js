export const getTrustLabel = (score) => {
  if (score <= 40) return { label: 'Low Trust', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
  if (score <= 70) return { label: 'Normal', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
  return { label: 'Trusted', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
};
