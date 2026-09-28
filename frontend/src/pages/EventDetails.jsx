import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Typography,
  Card,
  Button,
  Box,
  TextField,
  MenuItem,
  Divider,
  Alert,
  Chip,
  Stack,
  Paper,
  alpha,
  useTheme,

} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { afiseazaLocatie } from '../utils/locatie';
import PageContainer from '../components/layout/PageContainer';
import LoadingScreen from '../components/ui/LoadingScreen';
import { EVENT_PLACEHOLDER_IMAGE } from '../theme/tokens';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantitate, setCantitate] = useState(1);
  const [numeParticipanti, setNumeParticipanti] = useState(['']);
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await apiFetch(`/api/events/${id}`, { auth: false });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setEvent(data);
        setCoverImage(data.imagini?.[0] || EVENT_PLACEHOLDER_IMAGE);
      } catch (err) {
        alert(err.message || 'Eroare la preluarea evenimentului.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id, navigate]);

  const handleCantitateChange = (e) => {
    const qty = parseInt(e.target.value, 10);
    setCantitate(qty);
    setNumeParticipanti(Array(qty).fill('').map((_, i) => numeParticipanti[i] || ''));
  };

  const handleNumeChange = (index, valoare) => {
    const updateNume = [...numeParticipanti];
    updateNume[index] = valoare;
    setNumeParticipanti(updateNume);
  };

  const handleCumpara = async (e) => {
    e.preventDefault();
    if (numeParticipanti.some((n) => n.trim() === '')) {
      alert('Introdu numele din buletin pentru toți participanții.');
      return;
    }
    try {
      const response = await apiFetch('/api/tickets/create-checkout-session', {
        method: 'POST',
        body: { event_id: id, nume_participanti: numeParticipanti },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Eroare la inițierea plății.');
      window.location.href = data.url;
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !event) return <LoadingScreen message="Se încarcă evenimentul..." />;

  const dataStart = new Date(event.data_eveniment);
  const dataFinalizare = new Date(dataStart.getTime() + event.durata_ore * 60 * 60 * 1000);
  const esteExpirat = new Date() > dataFinalizare;
  const locuriEpuizate = event.locuri_disponibile === 0;
  const poateCumpara = user && !esteExpirat && !locuriEpuizate;

  const dataScurta = dataStart.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const oraScurta = dataStart.toLocaleTimeString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dataCompleta = dataStart.toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const imagini = event.imagini?.length > 0 ? event.imagini : [EVENT_PLACEHOLDER_IMAGE];

  return (
    <PageContainer sx={{ pb: { xs: 4, md: 6 } }}>
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackRoundedIcon />}
        sx={{
          mb: 2,
          textTransform: 'none',
          fontWeight: 600,
          color: 'text.secondary',
          '&:hover': { color: 'primary.main' },
        }}
      >
        Înapoi la evenimente
      </Button>

      {/* Hero imagine */}
      <Card
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: { xs: '16 / 9', md: '21 / 9' },
            maxHeight: { md: 440 },
            bgcolor: 'background.default',
          }}
        >
          <Box
            component="img"
            src={coverImage}
            alt={event.titlu}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to top, ${alpha(theme.palette.background.default, 0.92)} 0%, transparent 50%)`,
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: { xs: 2, md: 3 },
              display: { xs: 'block', md: 'none' },
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {event.titlu}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Titlu + chips (desktop) */}
      <Box sx={{ mb: 3, display: { xs: 'none', md: 'block' } }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
          {event.titlu}
        </Typography>
        <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
          <MetaChip icon={<EventRoundedIcon />} label={`${dataScurta}, ${oraScurta}`} />
          <MetaChip icon={<LocationOnOutlinedIcon />} label={afiseazaLocatie(event)} />
          <MetaChip icon={<ScheduleRoundedIcon />} label={`${event.durata_ore} ore`} />
          {!esteExpirat && (
            <Chip
              icon={<GroupsOutlinedIcon />}
              label={
                locuriEpuizate
                  ? 'Locuri epuizate'
                  : `${event.locuri_disponibile} locuri disponibile`
              }
              color={locuriEpuizate ? 'error' : 'success'}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
          {esteExpirat && (
            <Chip label="Eveniment încheiat" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
          )}
        </Stack>
      </Box>

      {/* Chips mobil */}
      <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap', mb: 3, display: { md: 'none' } }}>
        <MetaChip icon={<EventRoundedIcon />} label={`${dataScurta}, ${oraScurta}`} />
        <MetaChip icon={<LocationOnOutlinedIcon />} label={afiseazaLocatie(event)} />
      </Stack>

      <Grid container spacing={4}>
        {/* Coloana stânga: galerie + descriere */}
        <Grid size={{ xs: 12, lg: 7 }}>
          {imagini.length > 1 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                Galerie foto
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  overflowX: 'auto',
                  pb: 1,
                  '&::-webkit-scrollbar': { height: 6 },
                }}
              >
                {imagini.map((img, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setCoverImage(img)}
                    sx={{
                      flexShrink: 0,
                      width: { xs: 100, sm: 120 },
                      height: { xs: 72, sm: 84 },
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: coverImage === img ? 'primary.main' : 'divider',
                      opacity: coverImage === img ? 1 : 0.7,
                      transition: '0.2s',
                      '&:hover': { opacity: 1, borderColor: 'primary.main' },
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={`Imagine ${idx + 1}`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Despre eveniment
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ whiteSpace: 'pre-line', lineHeight: 1.85, fontSize: '1.05rem' }}
            >
              {event.descriere || 'Organizatorul nu a adăugat încă o descriere detaliată pentru acest eveniment.'}
            </Typography>

            <Divider sx={{ my: 2.5 }} />

            <Stack spacing={1.5}>
              <InfoRow label="Data și ora" value={dataCompleta} />
              <InfoRow label="Locație" value={afiseazaLocatie(event)} />
              <InfoRow label="Durată" value={`${event.durata_ore} ore`} />
              <InfoRow
                label="Capacitate"
                value={`${event.locuri_totale - event.locuri_disponibile} / ${event.locuri_totale} locuri ocupate`}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Coloana dreapta: rezervare */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              position: { lg: 'sticky' },
              top: 88,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${theme.palette.background.paper} 45%)`,
              boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
              <ConfirmationNumberOutlinedIcon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Rezervă bilet
              </Typography>
            </Stack>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                mb: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Preț per bilet
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
                {event.pret} <Typography component="span" variant="h6">RON</Typography>
              </Typography>
            </Box>

            {esteExpirat && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                Înscrierile s-au încheiat — evenimentul a trecut.
              </Alert>
            )}
            {!esteExpirat && locuriEpuizate && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                Toate locurile au fost rezervate.
              </Alert>
            )}

            {!user ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    mx: 'auto',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  }}
                >
                  <LockOutlinedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 280, mx: 'auto' }}>
                  Creează un cont sau autentifică-te pentru a cumpăra bilete nominale.
                </Typography>
                <Stack spacing={1.5}>
                  <Button fullWidth variant="contained" size="large" onClick={() => navigate('/login')} sx={{ minHeight: 48 }}>
                    Autentificare
                  </Button>
                  <Button fullWidth variant="outlined" onClick={() => navigate('/register')} sx={{ minHeight: 44 }}>
                    Înregistrare
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleCumpara}>
                <TextField
                  select
                  fullWidth
                  label="Câte bilete?"
                  value={cantitate}
                  onChange={handleCantitateChange}
                  disabled={!poateCumpara}
                  sx={{ mb: 2.5 }}
                >
                  {Array.from({ length: Math.min(6, Math.max(0, event.locuri_disponibile)) }, (_, i) => i + 1).map(
                    (num) => (
                      <MenuItem key={num} value={num}>
                        {num} {num === 1 ? 'bilet' : 'bilete'}
                      </MenuItem>
                    )
                  )}
                </TextField>

                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.secondary' }}>
                  Nume pe buletin (câte unul per bilet)
                </Typography>
                <Stack spacing={1} sx={{ mb: 2.5 }}>
                  {numeParticipanti.map((nume, index) => (
                    <TextField
                      key={index}
                      required
                      fullWidth
                      size="small"
                      label={`Participant ${index + 1}`}
                      placeholder="Nume complet"
                      value={nume}
                      onChange={(e) => handleNumeChange(index, e.target.value)}
                      disabled={!poateCumpara}
                    />
                  ))}
                </Stack>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    px: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    Total de plată
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {(Number(event.pret) * cantitate).toFixed(2)} RON
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!poateCumpara}
                  sx={{
                    minHeight: 52,
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    boxShadow: poateCumpara
                      ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`
                      : 'none',
                  }}
                >
                  {esteExpirat ? 'Înscrieri închise' : locuriEpuizate ? 'Locuri epuizate' : 'Continuă spre plată'}
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5, textAlign: 'center' }}>
                  Plată securizată prin Stripe
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}

function MetaChip({ icon, label }) {
  return (
    <Chip
      icon={icon}
      label={label}
      variant="outlined"
      sx={{
        fontWeight: 600,
        maxWidth: '100%',
        height: 'auto',
        py: 0.75,
        '& .MuiChip-label': { whiteSpace: 'normal', lineHeight: 1.3 },
        '& .MuiChip-icon': { color: 'primary.main' },
      }}
    />
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.25, sm: 2 } }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default EventDetails;
