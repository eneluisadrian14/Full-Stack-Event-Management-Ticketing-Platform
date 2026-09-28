import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function LoadingScreen({ message = 'Se încarcă...' }) {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={48} thickness={4} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export default LoadingScreen;
