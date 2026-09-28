import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from './Footer';
function AppLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 255, 0.12), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(0, 168, 204, 0.06), transparent),
            radial-gradient(ellipse 50% 30% at 0% 80%, rgba(0, 212, 255, 0.05), transparent)
          `,
          zIndex: 0,
        },
      }}
    >
      <Navbar />
      <Box component="main" sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </Box>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Footer />
      </Box>
    </Box>
  );
}

export default AppLayout;
