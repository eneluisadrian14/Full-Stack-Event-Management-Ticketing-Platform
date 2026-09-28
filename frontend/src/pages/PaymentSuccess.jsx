import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Box, CircularProgress, alpha, useTheme } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { apiFetch } from '../api/client';
import PageContainer from '../components/layout/PageContainer';

function PaymentSuccess() {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('procesare');
  const [mesajEroare, setMesajEroare] = useState('');
  const confirmareInCurs = useRef(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const confirmaPlata = async () => {
      if (confirmareInCurs.current) return;
      confirmareInCurs.current = true;

      if (!sessionId) {
        setStatus('eroare');
        setMesajEroare('Nu s-a găsit nicio sesiune de plată validă.');
        return;
      }

      try {
        const response = await apiFetch('/api/tickets/confirm-payment', {
          method: 'POST',
          auth: false,
          body: { session_id: sessionId },
        });
        const data = await response.json();
        if (response.ok && (data.success || data.dejaProcesat)) {
          setStatus('succes');
        } else {
          setStatus('eroare');
          setMesajEroare(data.error || 'Eroare la confirmarea biletelor.');
        }
      } catch {
        setStatus('eroare');
        setMesajEroare('Nu s-a putut contacta serverul.');
      }
    };
    confirmaPlata();
  }, [sessionId]);

  return (
    <PageContainer maxWidth="sm">
      <Card
        sx={{
          p: { xs: 4, md: 5 },
          borderRadius: 4,
          textAlign: 'center',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          animation: status === 'succes' ? 'fadeIn 0.5s ease' : 'none',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {status === 'procesare' && (
          <Box sx={{ py: 3 }}>
            <CircularProgress size={56} sx={{ mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Confirmăm plata...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nu închide această pagină.
            </Typography>
          </Box>
        )}

        {status === 'succes' && (
          <Box sx={{ py: 2 }}>
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mb: 1 }}>
              Plată confirmată
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}>
              Biletele tale nominale au fost emise. Prezinți buletinul la intrare pentru validare.
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/my-tickets')} sx={{ minHeight: 48, px: 4 }}>
              Vezi biletele mele
            </Button>
          </Box>
        )}

        {status === 'eroare' && (
          <Box sx={{ py: 2 }}>
            <ErrorOutlineRoundedIcon sx={{ fontSize: 72, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', mb: 2 }}>
              Eroare la confirmare
            </Typography>
            <Typography variant="body1" color="error.light" sx={{ mb: 4, fontWeight: 500 }}>
              {mesajEroare}
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/')} sx={{ minHeight: 48, px: 4 }}>
              Înapoi la evenimente
            </Button>
          </Box>
        )}
      </Card>
    </PageContainer>
  );
}

export default PaymentSuccess;
