import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Card, alpha, useTheme } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthContext } from '../context/AuthContext';
import PageContainer from './layout/PageContainer';

function AdminRoute({ children }) {
  const theme = useTheme();
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <PageContainer maxWidth="sm">
        <Card
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 56, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Acces interzis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Doar conturile de administrator pot accesa panoul de administrare.
          </Typography>
        </Card>
      </PageContainer>
    );
  }

  return children;
}

export default AdminRoute;
