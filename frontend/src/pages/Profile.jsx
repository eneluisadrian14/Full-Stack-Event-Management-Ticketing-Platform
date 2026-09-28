import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Box,
  Avatar,
  alpha,
  useTheme,
  Button,
  TextField,
  Alert,
  Divider,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import EmptyState from '../components/ui/EmptyState';

function ProfileField({ icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 1.5 }}>
      <Box sx={{ color: 'primary.main', mt: 0.25 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function Profile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', numar_telefon: '' });
  const [parola, setParola] = useState({ curenta: '', noua: '', confirmare: '' });
  const [parolaStergere, setParolaStergere] = useState('');
  const [dialogStergere, setDialogStergere] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        numar_telefon: user.numar_telefon || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleParolaChange = (e) => {
    setParola({ ...parola, [e.target.name]: e.target.value });
  };

  const anuleazaEditare = () => {
    setEditMode(false);
    setError('');
    setSuccess('');
    setParola({ curenta: '', noua: '', confirmare: '' });
    setParolaStergere('');
    setDialogStergere(false);
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        numar_telefon: user.numar_telefon || '',
      });
    }
  };

  const salveazaProfil = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Actualizarea profilului a eșuat.');

      updateUser(data.user, data.token);
      setSuccess(data.message);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const schimbaParola = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (parola.noua !== parola.confirmare) {
      setError('Parola nouă și confirmarea nu coincid.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('/api/auth/password', {
        method: 'PUT',
        body: {
          parola_curenta: parola.curenta,
          parola_noua: parola.noua,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Schimbarea parolei a eșuat.');

      setSuccess(data.message);
      setParola({ curenta: '', noua: '', confirmare: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stergeCont = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/auth/account', {
        method: 'DELETE',
        body: { parola: parolaStergere },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ștergerea contului a eșuat.');
      }

      setDialogStergere(false);
      logout();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <PageContainer>
        <EmptyState title="Autentificare necesară" description="Loghează-te pentru a vedea profilul." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="sm">
      <PageHeader
        title="Profilul meu"
        subtitle={editMode ? 'Modifică datele contului' : 'Datele contului tău ManFast'}
        align="center"
        action={
          !editMode && (
            <Button
              variant="contained"
              startIcon={<EditRoundedIcon />}
              onClick={() => setEditMode(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Editează profilul
            </Button>
          )
        }
      />

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

      <Card
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          textAlign: 'center',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Avatar
          sx={{
            width: 88,
            height: 88,
            mx: 'auto',
            mb: 2,
            fontSize: '2rem',
            fontWeight: 800,
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            color: 'primary.main',
            border: `2px solid ${theme.palette.primary.main}`,
          }}
        >
          {(editMode ? formData.username : user.username).charAt(0).toUpperCase()}
        </Avatar>

        {!editMode ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
              {user.username}
            </Typography>

            <Box
              sx={{
                textAlign: 'left',
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 3,
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <ProfileField icon={<PersonOutlinedIcon />} label="Utilizator" value={user.username} />
              <ProfileField icon={<EmailOutlinedIcon />} label="Email" value={user.email} />
              <ProfileField
                icon={<PhoneOutlinedIcon />}
                label="Telefon"
                value={user.numar_telefon || 'Nespecificat'}
              />
              {user.role === 'admin' && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      color: 'primary.main',
                      fontWeight: 700,
                    }}
                  >
                    Administrator
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        ) : (
          <Box component="form" onSubmit={salveazaProfil} sx={{ textAlign: 'left' }}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                label="Nume utilizator"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                required
                fullWidth
                label="Telefon"
                name="numar_telefon"
                value={formData.numar_telefon}
                onChange={handleChange}
                disabled={loading}
              />
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
                disabled={loading}
                sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}
              >
                Salvează
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloseRoundedIcon />}
                onClick={anuleazaEditare}
                disabled={loading}
                sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}
              >
                Anulează
              </Button>
            </Stack>
          </Box>
        )}
      </Card>

      {editMode && (
        <Card
          component="form"
          onSubmit={schimbaParola}
          sx={{
            p: { xs: 3, md: 4 },
            mt: 3,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Schimbă parola
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Opțional — completează doar dacă vrei o parolă nouă.
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Parola curentă"
              name="curenta"
              type="password"
              value={parola.curenta}
              onChange={handleParolaChange}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Parola nouă"
              name="noua"
              type="password"
              value={parola.noua}
              onChange={handleParolaChange}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Confirmă parola nouă"
              name="confirmare"
              type="password"
              value={parola.confirmare}
              onChange={handleParolaChange}
              disabled={loading}
            />
          </Stack>

          <Button
            type="submit"
            variant="outlined"
            fullWidth
            disabled={loading || !parola.curenta || !parola.noua || !parola.confirmare}
            sx={{ mt: 2.5, textTransform: 'none', fontWeight: 600, minHeight: 48 }}
          >
            Actualizează parola
          </Button>
        </Card>
      )}

      {editMode && (
        <Card
          sx={{
            p: { xs: 3, md: 4 },
            mt: 3,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(theme.palette.error.main, 0.5),
            bgcolor: alpha(theme.palette.error.main, 0.06),
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', mb: 0.5 }}>
            Zonă periculoasă
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ștergerea contului este permanentă. Biletele tale rămân în sistem, dar nu vei mai putea accesa
            contul.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<DeleteForeverRoundedIcon />}
            onClick={() => {
              setParolaStergere('');
              setDialogStergere(true);
            }}
            disabled={loading}
            sx={{ textTransform: 'none', fontWeight: 700, minHeight: 48 }}
          >
            Șterge contul definitiv
          </Button>
        </Card>
      )}

      <Dialog open={dialogStergere} onClose={() => !loading && setDialogStergere(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Confirmă ștergerea contului
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Această acțiune nu poate fi anulată. Toate datele contului vor fi eliminate.
          </DialogContentText>
          <TextField
            fullWidth
            required
            label="Parola ta (confirmare)"
            type="password"
            value={parolaStergere}
            onChange={(e) => setParolaStergere(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogStergere(false)} disabled={loading}>
            Anulează
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={stergeCont}
            disabled={loading || !parolaStergere}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Șterge definitiv'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

export default Profile;
