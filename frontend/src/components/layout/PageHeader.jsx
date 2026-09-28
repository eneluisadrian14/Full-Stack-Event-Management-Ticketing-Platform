import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

function PageHeader({ title, subtitle, action, align = 'center' }) {
  return (
    <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: align }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: align === 'center' ? 'center' : 'space-between',
          alignItems: align === 'center' ? 'center' : 'flex-start',
        }}
      >
        <Box sx={{ maxWidth: align === 'center' ? 640 : 'none' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
    </Box>
  );
}

export default PageHeader;
