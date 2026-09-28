import React from 'react';
import { Box, Card, Typography, alpha, useTheme } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';

function AuthCard({ title, subtitle, children }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 6 },
        px: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              mx: 'auto',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: 'primary.main',
            }}
          >
            <EventRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {children}
      </Card>
    </Box>
  );
}

export default AuthCard;
