
import React from 'react';
import { Badge } from '@/components/ui/badge';

const StatusBadge = ({ status }) => {
  const variants = {
    available: { label: 'Available', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    reserved: { label: 'Reserved', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 hover:bg-red-100' }
  };

  const variant = variants[status] || variants.available;

  return (
    <Badge className={variant.className}>
      {variant.label}
    </Badge>
  );
};

export default StatusBadge;
