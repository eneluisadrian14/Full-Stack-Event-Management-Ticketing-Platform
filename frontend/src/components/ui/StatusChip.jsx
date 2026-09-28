import React from 'react';
import { Chip } from '@mui/material';

const variants = {
  active: { label: 'Activ', color: 'success' },
  expired: { label: 'Încheiat', color: 'default' },
  paid: { label: 'Plată confirmată', color: 'info' },
  checkedIn: { label: 'Prezent', color: 'success' },
  pending: { label: 'Neprezentat', color: 'default' },
};

function StatusChip({ status, label, size = 'small' }) {
  const config = variants[status] || { label: label || status, color: 'default' };
  return (
    <Chip
      label={label || config.label}
      color={config.color}
      size={size}
      variant={config.color === 'default' ? 'outlined' : 'filled'}
      sx={{ fontWeight: 600 }}
    />
  );
}

export default StatusChip;
