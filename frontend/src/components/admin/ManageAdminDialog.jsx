import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { apiFetch } from '../../api/client';

function ManageAdminDialog({ open, onClose, onSuccess }) {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [parolaAutorizare, setParolaAutorizare] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setParolaAutorizare('');
    setError('');
    setTab(0);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = tab === 0 ? '/api/auth/admin/create' : '/api/auth/admin/revoke';

    try {
      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: {
          email: email.trim(),
          parola_autorizare: parolaAutorizare,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (tab === 0
              ? 'Nu s-a putut promova contul la administrator.'
              : 'Nu s-a putut revoca rolul de administrator.')
        );
      }

      onSuccess(data.message);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const estePromovare = tab === 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Gestionare administratori</DialogTitle>
      <Tabs
        value={tab}
        onChange={(_, v) => {
          setTab(v);
          setError('');
        }}
        sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Promovează" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Revocă admin" sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {estePromovare ? (
              <>
                Promovează un cont înregistrat la rol de administrator. Parola contului{' '}
                <strong>nu se modifică</strong>.
              </>
            ) : (
              <>
                Revocă rolul de administrator de pe un cont. Parola contului{' '}
                <strong>nu se modifică</strong>. Persoana trebuie să se delogheze și să se logheze din nou.
              </>
            )}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            required
            fullWidth
            label="Email cont"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            helperText={
              estePromovare
                ? 'Contul trebuie să existe (înregistrat la /register).'
                : 'Emailul contului căruia îi revoci rolul de admin.'
            }
          />

          <TextField
            required
            fullWidth
            label="Parolă de autorizare"
            type="password"
            value={parolaAutorizare}
            onChange={(e) => setParolaAutorizare(e.target.value)}
            disabled={loading}
            helperText="Parola secretă — necesară pentru orice modificare de rol admin."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Anulează
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={estePromovare ? 'primary' : 'warning'}
            disabled={loading || !email.trim() || !parolaAutorizare}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : estePromovare ? (
              'Promovează la admin'
            ) : (
              'Revocă rol admin'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ManageAdminDialog;
