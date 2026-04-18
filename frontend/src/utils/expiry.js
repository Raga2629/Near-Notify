export const getExpiryInfo = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry - now;

  if (diffMs <= 0) return { label: 'Expired', urgent: true, expired: true };

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) return { label: `Expires in ${diffHours}h`, urgent: true, expired: false };
  return { label: `Expires in ${diffDays}d`, urgent: false, expired: false };
};
