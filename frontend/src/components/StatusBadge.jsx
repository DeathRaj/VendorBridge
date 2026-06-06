import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const getStatusStyle = (statusStr) => {
    const s = statusStr.toLowerCase();
    switch (s) {
      case 'active':
      case 'approved':
      case 'paid':
      case 'confirmed':
      case 'done':
        return { label: statusStr, className: 'badge-success' };
      case 'sent':
      case 'submitted':
      case 'open':
      case 'under_review':
        return { label: statusStr.replace('_', ' '), className: 'badge-warning' };
      case 'draft':
      case 'pending':
        return { label: statusStr, className: 'badge-info' };
      case 'inactive':
      case 'rejected':
      case 'cancelled':
      case 'blacklisted':
        return { label: statusStr, className: 'badge-danger' };
      case 'closed':
      case 'received':
        return { label: statusStr, className: 'badge-neutral' };
      default:
        return { label: statusStr, className: 'badge-neutral' };
    }
  };

  const { label, className } = getStatusStyle(status);

  return (
    <span className={`badge ${className}`}>
      {label.toUpperCase()}
    </span>
  );
};

export default StatusBadge;
