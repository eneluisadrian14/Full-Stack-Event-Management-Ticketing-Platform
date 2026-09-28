import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { apiFetch } from '../api/client';
import AuthCard from '../components/ui/AuthCard';

function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailMascat, setEmailMascat] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setEmailMascat('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        auth: false,
        body: { identifier: identifier.trim() },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Cererea a eșuat.');
      }

      setSuccess(data.message);
      if (data.email_mascat) {
        setEmailMascat(data.email_mascat);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Am uitat parola"
      subtitle="Introdu email-ul sau numărul de telefon asociat contului"
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {success}
          {emailMascat && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
              Email: {emailMascat}
            </Typography>
          )}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Email sau număr de telefon"
          name="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="ex: nume@email.com sau 0712345678"
          autoFocus
          disabled={loading || Boolean(success)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading || Boolean(success) || !identifier.trim()}
          sx={{ mt: 3, mb: 2, minHeight: 48 }}
        >
          {loading ? 'Se trimite...' : 'Trimite link de resetare'}
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

export default ForgotPassword;
