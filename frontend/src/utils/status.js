// Returns stock status string for a medicine object
export function getStatus(medicine) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(medicine.expiryDate);
  expiry.setHours(0, 0, 0, 0);

  if (expiry < today)                            return 'expired';
  if (medicine.quantity === 0)                   return 'critical';
  if (medicine.quantity <= 5)                    return 'critical';
  if (medicine.quantity <= medicine.minThreshold) return 'low';
  return 'instock';
}

// Days until expiry (negative = already expired)
export function getDaysToExpiry(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry - today) / (1000 * 60 * 60 * 24));
}

// Human-readable expiry label
export function expiryLabel(expiryDate) {
  const days = getDaysToExpiry(expiryDate);
  if (days < 0)  return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  if (days <= 7)  return `Expires in ${days}d`;
  return `Expires in ${days}d`;
}

// Recommended reorder quantity
export function reorderQty(medicine) {
  return Math.max(0, medicine.minThreshold * 2 - medicine.quantity);
}

// Status display config: label, Tailwind classes, dot color
export const STATUS_CONFIG = {
  instock:  { label: 'In Stock',  badge: 'bg-green-50 text-green-700',  dot: 'bg-green-500',  border: 'border-green-200'  },
  low:      { label: 'Low Stock', badge: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200' },
  critical: { label: 'Critical',  badge: 'bg-red-50 text-red-700',      dot: 'bg-red-500',    border: 'border-red-200'    },
  expired:  { label: 'Expired',   badge: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400',  border: 'border-slate-200'  },
};

export const CATEGORIES = ['tablet','capsule','syrup','injection','inhaler','drops','ointment','other'];
