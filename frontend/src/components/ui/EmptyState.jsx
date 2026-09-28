import React from 'react';
import { Box, Typography } from '@mui/material';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';

function EmptyState({ title, description, icon }) {
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        textAlign: 'center',
        borderRadius: 3,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2, opacity: 0.7 }}>
        {icon || <EventBusyRoundedIcon sx={{ fontSize: 56 }} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

export default EmptyState;
