import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Link, InputAdornment } from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { apiFetch } from '../api/client';
import AuthCard from '../components/ui/AuthCard';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [parola, setParola] = useState('');
  const [confirmare, setConfirmare] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Link invalid. Solicită din nou resetarea parolei.');
      return;
    }

    if (parola !== confirmare) {
      setError('Parolele nu coincid.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        auth: false,
        body: { token, parola_noua: parola },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Resetarea parolei a eșuat.');
      }

      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthCard title="Link invalid" subtitle="Token-ul de resetare lipsește sau este invalid">
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          Link invalid. Solicită din nou resetarea parolei.
        </Alert>
        <Typography variant="body2" align="center">
          <Link component={RouterLink} to="/forgot-password" color="primary" fontWeight={600}>
            Am uitat parola
          </Link>
        </Typography>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Parolă nouă" subtitle="Alege o parolă nouă pentru contul tău ManFast">
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Parolă nouă"
          type={showPassword ? 'text' : 'password'}
          value={parola}
          onChange={(e) => setParola(e.target.value)}
          disabled={loading || Boolean(success)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: 44, minHeight: 44 }}
                  >
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </Button>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Confirmă parola nouă"
          type={showPassword ? 'text' : 'password'}
          value={confirmare}
          onChange={(e) => setConfirmare(e.target.value)}
          disabled={loading || Boolean(success)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading || Boolean(success) || !parola || !confirmare}
          sx={{ mt: 3, mb: 2, minHeight: 48 }}
        >
          {loading ? 'Se salvează...' : 'Resetează parola'}
        </Button>
        <Typography variant="body2" align="center" color="text.secondary">
          <Link component={RouterLink} to="/login" color="primary" fontWeight={600}>
            Înapoi la autentificare
          </Link>
        </Typography>
      </Box>
    </AuthCard>
  );
}

export default ResetPassword;
