
import React from 'react';
import { Badge } from '@/components/ui/badge';

const STATUS_MAP = {
  pending_payment: { label: 'Pago pendiente', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
  pending:         { label: 'Pendiente',       className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  confirmed:       { label: 'Confirmado',      className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  completed:       { label: 'Completado',      className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  cancelled:       { label: 'Cancelado',       className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  no_show:         { label: 'No se presentó',  className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' },
  // legacy values
  available:       { label: 'Disponible',      className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  reserved:        { label: 'Reservado',       className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
};

const StatusBadge = ({ status }) => {
  const variant = STATUS_MAP[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' };
  return <Badge className={variant.className}>{variant.label}</Badge>;
};

export default StatusBadge;
