import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  Grid,
  Chip,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { apiFetch } from '../api/client';
import EditEventDialog from '../components/admin/EditEventDialog';
import ManageAdminDialog from '../components/admin/ManageAdminDialog';
import EventLocationFields from '../components/admin/EventLocationFields';
import { afiseazaLocatie } from '../utils/locatie';
import { tokens } from '../theme/tokens';

const INITIAL_FORM = {
  titlu: '',
  descriere: '',
  data: '',
  ora: '',
  judet: '',
  localitate: '',
  pret: '',
  locuri_totale: '',
  durata_ore: '2',
};

function obtineDataMinima() {
  const azi = new Date();
  azi.setDate(azi.getDate() + 2);
  return azi.toISOString().slice(0, 10);
}

function formatDataEveniment(dataStr) {
  return new Date(dataStr).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatCard({ icon, label, value, accent }) {
  return (
    <Card
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(accent, 0.2),
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(accent, 0.15)} 0%, ${theme.palette.background.paper} 70%)`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(accent, 0.12),
            color: accent,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [imagini, setImagini] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [eventDeEditat, setEventDeEditat] = useState(null);
  const [eventDeSters, setEventDeSters] = useState(null);
  const [stergeInCurs, setStergeInCurs] = useState(false);
  const [dialogAdminDeschis, setDialogAdminDeschis] = useState(false);

  const showToast = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const incarcaDateAdmin = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [resEvents, resPart] = await Promise.all([
        apiFetch('/api/events/admin/list'),
        apiFetch('/api/tickets/admin/participants'),
      ]);
      const dataEvents = await resEvents.json();
      const dataPart = await resPart.json();

      if (resEvents.ok && resPart.ok) {
        setEvents(dataEvents);
        setParticipants(dataPart);
        setSelectedEventId((prev) => {
          if (prev && dataEvents.some((e) => String(e.id) === String(prev))) return prev;
          return dataEvents.length > 0 ? dataEvents[0].id : '';
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Nu s-au putut reîncărca datele.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    incarcaDateAdmin();
  }, [incarcaDateAdmin]);

  useEffect(() => {
    const urls = imagini.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imagini]);

  const stats = useMemo(() => {
    const totalBilete = participants.length;
    const prezente = participants.filter((p) => p.check_in).length;
    const activeEvents = events.filter((ev) => {
      const end = new Date(ev.data_eveniment);
      end.setHours(end.getHours() + Number(ev.durata_ore || 0));
      return end > new Date();
    }).length;

    return { totalBilete, prezente, activeEvents, totalEvents: events.length };
  }, [events, participants]);

  const selectedEvent = useMemo(
    () => events.find((e) => String(e.id) === String(selectedEventId)),
    [events, selectedEventId]
  );

  const eventParticipants = useMemo(
    () => participants.filter((p) => String(p.event_id) === String(selectedEventId)),
    [participants, selectedEventId]
  );

  const filteredParticipants = useMemo(() => {
    return eventParticipants.filter((p) => {
      const matchSearch = p.nume_buletin.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'present' && p.check_in) ||
        (statusFilter === 'absent' && !p.check_in);
      return matchSearch && matchStatus;
    });
  }, [eventParticipants, searchTerm, statusFilter]);

  const checkInStats = useMemo(() => {
    const total = eventParticipants.length;
    const present = eventParticipants.filter((p) => p.check_in).length;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent: total - present, percent };
  }, [eventParticipants]);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const fisiereNoi = Array.from(e.target.files);
    if (fisiereNoi.length === 0) return;

    const combinat = [...imagini, ...fisiereNoi];
    if (combinat.length > 8) {
      showToast(`Poți avea maximum 8 imagini. Ai deja ${imagini.length}, mai poți adăuga ${8 - imagini.length}.`, 'warning');
      e.target.value = '';
      return;
    }
    setImagini(combinat);
    e.target.value = '';
  };

  const removeImage = (index) => {
    const next = imagini.filter((_, i) => i !== index);
    setImagini(next);
    if (next.length === 0) {
      const input = document.getElementById('admin-file-input');
      if (input) input.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.data || !formData.ora) {
      showToast('Selectează data și ora evenimentului.', 'warning');
      return;
    }

    if (!formData.judet || !formData.localitate.trim()) {
      showToast('Selectează județul și introdu localitatea.', 'warning');
      return;
    }

    setSubmitting(true);
    const dataEvenimentCombinata = `${formData.data}T${formData.ora}:00`;
    const dataToSend = new FormData();
    dataToSend.append('titlu', formData.titlu);
    dataToSend.append('descriere', formData.descriere);
    dataToSend.append('data_eveniment', dataEvenimentCombinata);
    dataToSend.append('judet', formData.judet);
    dataToSend.append('localitate', formData.localitate.trim());
    dataToSend.append('pret', formData.pret);
    dataToSend.append('locuri_totale', formData.locuri_totale);
    dataToSend.append('durata_ore', formData.durata_ore);
    imagini.forEach((img) => dataToSend.append('imagini', img));

    try {
      const response = await apiFetch('/api/events', { method: 'POST', body: dataToSend });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      showToast(data.message || 'Evenimentul a fost publicat!');
      setFormData(INITIAL_FORM);
      setImagini([]);
      const input = document.getElementById('admin-file-input');
      if (input) input.value = '';
      await incarcaDateAdmin(true);
      setActiveTab(0);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStergeEveniment = async () => {
    if (!eventDeSters) return;
    setStergeInCurs(true);
    try {
      const response = await apiFetch(`/api/events/${eventDeSters.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const msg =
        data.bileteSterse > 0
          ? `${data.message} (${data.bileteSterse} bilete asociate au fost eliminate.)`
          : data.message;
      showToast(msg);
      setEventDeSters(null);
      await incarcaDateAdmin(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setStergeInCurs(false);
    }
  };

  const handleToggleCheckIn = async (ticketId, currentStatus) => {
    try {
      const response = await apiFetch(`/api/tickets/${ticketId}/checkin`, {
        method: 'PATCH',
        body: { check_in: !currentStatus },
      });
      if (response.ok) {
        setParticipants((prev) =>
          prev.map((p) => (p.id === ticketId ? { ...p, check_in: !currentStatus } : p))
        );
      } else {
        showToast('Eroare la actualizarea statusului.', 'error');
      }
    } catch {
      showToast('Eroare la comunicarea cu serverul.', 'error');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={48} color="primary" />
        <Typography color="text.secondary">Se încarcă panoul de administrare...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${tokens.background.default} 0%, #121a28 50%, ${alpha(tokens.primary.main, 0.25)} 100%)`,
          color: 'text.primary',
          borderBottom: `1px solid ${tokens.border}`,
          py: { xs: 4, md: 5 },
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <Box>
              <Chip
                label="Administrator"
                size="small"
                sx={{ bgcolor: alpha(tokens.primary.main, 0.2), color: 'primary.main', fontWeight: 700, mb: 1.5, border: `1px solid ${tokens.primary.main}` }}
              />
              <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                Panou ManFast
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mt: 0.5, maxWidth: 520 }}>
                Gestionează evenimentele, biletele și validarea participanților la poartă.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="contained"
                startIcon={<PersonAddAlt1RoundedIcon />}
                onClick={() => setDialogAdminDeschis(true)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                }}
              >
                Gestionare admini
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => incarcaDateAdmin(true)}
                disabled={refreshing}
                sx={{
                  color: '#fff',
                  borderColor: alpha('#fff', 0.5),
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.08) },
                }}
              >
                {refreshing ? 'Actualizare...' : 'Reîmprospătează'}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={<EventRoundedIcon />} label="Evenimente totale" value={stats.totalEvents} accent={tokens.primary.main} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={<EventRoundedIcon />} label="Evenimente active" value={stats.activeEvents} accent={tokens.success} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={<ConfirmationNumberOutlinedIcon />} label="Bilete emise" value={stats.totalBilete} accent={tokens.primary.main} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={<HowToRegRoundedIcon />} label="Prezenți (global)" value={stats.prezente} accent="#7b1fa2" />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(10,25,47,0.08)' }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="fullWidth"
            sx={{
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, py: 2, minHeight: 56 },
              '& .Mui-selected': { color: 'primary.main' },
              '& .MuiTabs-indicator': { height: 3, bgcolor: 'primary.main' },
            }}
          >
            <Tab icon={<DashboardRoundedIcon />} iconPosition="start" label="Prezentare" />
            <Tab icon={<AddCircleOutlineRoundedIcon />} iconPosition="start" label="Eveniment nou" />
            <Tab icon={<HowToRegRoundedIcon />} iconPosition="start" label="Poartă acces" />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper' }}>
            {/* TAB 0: Overview */}
            {activeTab === 0 && (
              <Box>
                <SectionTitle
                  title="Evenimentele tale"
                  subtitle="Privire de ansamblu asupra evenimentelor publicate și gradului de ocupare."
                />
                {events.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Nu există evenimente încă. Mergi la tab-ul „Eveniment nou” pentru a publica primul eveniment.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {events.map((ev) => {
                      const ocupate = Number(ev.locuri_totale) - Number(ev.locuri_disponibile);
                      const procent = ev.locuri_totale > 0 ? Math.round((ocupate / ev.locuri_totale) * 100) : 0;
                      const bileteEv = participants.filter((p) => String(p.event_id) === String(ev.id));
                      const prezenteEv = bileteEv.filter((p) => p.check_in).length;
                      const end = new Date(ev.data_eveniment);
                      end.setHours(end.getHours() + Number(ev.durata_ore || 0));
                      const esteActiva = end > new Date();

                      return (
                        <Grid key={ev.id} size={{ xs: 12, md: 6 }}>
                          <Card
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              border: '1px solid',
                              borderColor: alpha(tokens.text.secondary, 0.08),
                              transition: '0.2s',
                              '&:hover': { boxShadow: 4 },
                            }}
                          >
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', flex: 1 }}>
                                {ev.titlu}
                              </Typography>
                              <Chip
                                label={esteActiva ? 'Activă' : 'Încheiată'}
                                size="small"
                                color={esteActiva ? 'success' : 'default'}
                                sx={{ fontWeight: 600 }}
                              />
                            </Stack>
                            <Stack spacing={0.5} sx={{ mt: 1.5, mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EventRoundedIcon sx={{ fontSize: 16 }} />
                                {formatDataEveniment(ev.data_eveniment)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                                {afiseazaLocatie(ev)}
                              </Typography>
                            </Stack>
                            <Box sx={{ mb: 1 }}>
                              <Stack direction="row" sx={{ mb: 0.5, justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Locuri ocupate: {ocupate} / {ev.locuri_totale}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {procent}%
                                </Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={procent}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: alpha(tokens.primary.main, 0.1),
                                  '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 4 },
                                }}
                              />
                            </Box>
                            <Stack direction="row" spacing={2}>
                              <Typography variant="body2">
                                <strong>{bileteEv.length}</strong> bilete
                              </Typography>
                              <Typography variant="body2" color="success.main">
                                <strong>{prezenteEv}</strong> prezenți
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
                                {ev.pret} RON / bilet
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditRoundedIcon />}
                                onClick={() => setEventDeEditat(ev)}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                              >
                                Modifică
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteOutlineRoundedIcon />}
                                onClick={() => setEventDeSters(ev)}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                              >
                                Șterge
                              </Button>
                              <Button
                                size="small"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                onClick={() => {
                                  setSelectedEventId(ev.id);
                                  setActiveTab(2);
                                }}
                              >
                                Poartă acces →
                              </Button>
                            </Stack>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            )}

            {/* TAB 1: Create event */}
            {activeTab === 1 && (
              <Box component="form" onSubmit={handleSubmit}>
                <SectionTitle
                  title="Publică un eveniment nou"
                  subtitle="Completează detaliile evenimentului. Câmpurile marcate sunt obligatorii."
                />

                <Card variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, borderColor: alpha(tokens.text.secondary, 0.1) }}>
                  <SectionTitle title="Informații generale" />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField required fullWidth label="Titlu eveniment" name="titlu" value={formData.titlu} onChange={handleTextChange} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Descriere"
                        name="descriere"
                        value={formData.descriere}
                        onChange={handleTextChange}
                        placeholder="Detalii despre reguli, categorii, premii..."
                      />
                    </Grid>
                  </Grid>
                </Card>

                <Card variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, borderColor: alpha(tokens.text.secondary, 0.1) }}>
                  <SectionTitle title="Program & locație" />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        required
                        fullWidth
                        type="date"
                        label="Data"
                        name="data"
                        value={formData.data}
                        onChange={handleTextChange}
                        slotProps={{
                          inputLabel: { shrink: true },
                          htmlInput: { min: obtineDataMinima() },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        required
                        fullWidth
                        type="time"
                        label="Ora start"
                        name="ora"
                        value={formData.ora}
                        onChange={handleTextChange}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        required
                        fullWidth
                        type="number"
                        label="Durată (ore)"
                        name="durata_ore"
                        value={formData.durata_ore}
                        onChange={handleTextChange}
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    </Grid>
                    <EventLocationFields
                      judet={formData.judet}
                      localitate={formData.localitate}
                      onChange={handleTextChange}
                      disabled={submitting}
                    />
                  </Grid>
                </Card>

                <Card variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, borderColor: alpha(tokens.text.secondary, 0.1) }}>
                  <SectionTitle title="Bilete & capacitate" />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        required
                        fullWidth
                        type="number"
                        label="Preț bilet (RON)"
                        name="pret"
                        value={formData.pret}
                        onChange={handleTextChange}
                        slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        required
                        fullWidth
                        type="number"
                        label="Număr total locuri"
                        name="locuri_totale"
                        value={formData.locuri_totale}
                        onChange={handleTextChange}
                        slotProps={{
                          htmlInput: { min: 1 },
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <GroupsOutlinedIcon color="action" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Card>

                <Card variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, borderColor: alpha(tokens.text.secondary, 0.1) }}>
                  <SectionTitle
                    title="Galerie foto"
                    subtitle="Apasă de mai multe ori pentru a adăuga poze una câte una sau mai multe odată. Maximum 8 imagini."
                  />
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: alpha(tokens.primary.main, 0.35),
                      borderRadius: 3,
                      p: 4,
                      textAlign: 'center',
                      bgcolor: alpha(tokens.primary.main, 0.03),
                      cursor: 'pointer',
                      transition: '0.2s',
                      '&:hover': { borderColor: 'primary.main', bgcolor: alpha(tokens.primary.main, 0.06) },
                    }}
                    onClick={() => document.getElementById('admin-file-input')?.click()}
                  >
                    <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {imagini.length > 0 ? 'Adaugă încă o poză' : 'Adaugă prima poză'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {imagini.length}/8 imagini · PNG, JPG — max 5 MB fiecare
                    </Typography>
                    <input
                      id="admin-file-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </Box>
                  {previewUrls.length > 0 && (
                    <Grid container spacing={1.5} sx={{ mt: 2 }}>
                      {previewUrls.map((url, idx) => (
                        <Grid key={`${idx}-${imagini[idx]?.name || url}`} size={{ xs: 6, sm: 4, md: 3 }}>
                          <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', aspectRatio: '4/3' }}>
                            <Box
                              component="img"
                              src={url}
                              alt={`Preview ${idx + 1}`}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => removeImage(idx)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: alpha('#000', 0.6),
                                color: '#fff',
                                '&:hover': { bgcolor: '#000' },
                              }}
                            >
                              <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Card>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: '#e65100' },
                  }}
                >
                  {submitting ? 'Se publică...' : 'Publică evenimentul'}
                </Button>
              </Box>
            )}

            {/* TAB 2: Check-in */}
            {activeTab === 2 && (
              <Box>
                <SectionTitle
                  title="Poartă de acces"
                  subtitle="Validează participanții pe baza numelui din buletin."
                />

                {events.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Nu există evenimente. Publică unul pentru a gestiona accesul.
                  </Alert>
                ) : (
                  <>
                    <TextField
                      select
                      fullWidth
                      label="Eveniment selectat"
                      value={selectedEventId}
                      onChange={(e) => {
                        setSelectedEventId(e.target.value);
                        setSearchTerm('');
                      }}
                      sx={{ mb: 3, maxWidth: 480 }}
                    >
                      {events.map((ev) => (
                        <MenuItem key={ev.id} value={ev.id}>
                          {ev.titlu} — {afiseazaLocatie(ev)}
                        </MenuItem>
                      ))}
                    </TextField>

                    {selectedEvent && (
                      <Card
                        sx={{
                          p: 3,
                          mb: 3,
                          borderRadius: 3,
                          bgcolor: alpha(tokens.text.secondary, 0.03),
                          border: '1px solid',
                          borderColor: alpha(tokens.text.secondary, 0.08),
                        }}
                      >
                        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                          <Grid size={{ xs: 12, md: 8 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {selectedEvent.titlu}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDataEveniment(selectedEvent.data_eveniment)} · {afiseazaLocatie(selectedEvent)}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Stack direction="row" sx={{ mb: 0.5, justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Prezență la poartă
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {checkInStats.present} / {checkInStats.total} ({checkInStats.percent}%)
                                </Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={checkInStats.percent}
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                  bgcolor: alpha('#2e7d32', 0.15),
                                  '& .MuiLinearProgress-bar': { bgcolor: '#2e7d32', borderRadius: 5 },
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Stack direction="row" spacing={2} sx={{ justifyContent: { md: 'flex-end' } }}>
                              <Chip label={`${checkInStats.present} prezenți`} color="success" sx={{ fontWeight: 600 }} />
                              <Chip label={`${checkInStats.absent} așteptați`} variant="outlined" sx={{ fontWeight: 600 }} />
                            </Stack>
                          </Grid>
                        </Grid>
                      </Card>
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        placeholder="Caută după nume din buletin..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchRoundedIcon color="action" />
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{ maxWidth: { sm: 400 } }}
                      />
                      <ToggleButtonGroup
                        value={statusFilter}
                        exclusive
                        onChange={(_, v) => v && setStatusFilter(v)}
                        size="small"
                        sx={{ flexWrap: 'wrap' }}
                      >
                        <ToggleButton value="all" sx={{ textTransform: 'none', fontWeight: 600 }}>
                          Toți ({eventParticipants.length})
                        </ToggleButton>
                        <ToggleButton value="present" sx={{ textTransform: 'none', fontWeight: 600 }}>
                          Prezenți ({checkInStats.present})
                        </ToggleButton>
                        <ToggleButton value="absent" sx={{ textTransform: 'none', fontWeight: 600 }}>
                          Neprezentați ({checkInStats.absent})
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Stack>

                    {filteredParticipants.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        {searchTerm || statusFilter !== 'all'
                          ? 'Niciun participant nu corespunde filtrelor.'
                          : 'Nu există bilete emise pentru acest eveniment.'}
                      </Alert>
                    ) : (
                      <>
                        <TableContainer
                          component={Paper}
                          sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}
                        >
                          <Table>
                            <TableHead>
                              <TableRow sx={{ bgcolor: alpha(tokens.text.secondary, 0.04) }}>
                                <TableCell sx={{ fontWeight: 700 }}>Participant</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Acțiune</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredParticipants.map((p) => (
                                <TableRow
                                  key={p.id}
                                  hover
                                  sx={{
                                    bgcolor: p.check_in ? alpha('#2e7d32', 0.04) : 'inherit',
                                  }}
                                >
                                  <TableCell>
                                    <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                                      {p.nume_buletin}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {p.check_in ? (
                                      <Chip icon={<CheckCircleRoundedIcon />} label="Prezent" color="success" size="small" sx={{ fontWeight: 600 }} />
                                    ) : (
                                      <Chip label="Neprezentat" size="small" variant="outlined" />
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Button
                                      size="small"
                                      variant={p.check_in ? 'outlined' : 'contained'}
                                      color={p.check_in ? 'error' : 'success'}
                                      startIcon={p.check_in ? <CancelOutlinedIcon /> : <CheckCircleRoundedIcon />}
                                      onClick={() => handleToggleCheckIn(p.id, p.check_in)}
                                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                                    >
                                      {p.check_in ? 'Anulează' : 'Validează'}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
                          {filteredParticipants.map((p) => (
                            <Card
                              key={p.id}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                borderLeft: '5px solid',
                                borderColor: p.check_in ? '#2e7d32' : '#94a3b8',
                                boxShadow: 1,
                              }}
                            >
                              <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{p.nume_buletin}</Typography>
                                {p.check_in ? (
                                  <Chip label="Prezent" color="success" size="small" />
                                ) : (
                                  <Chip label="Neprezentat" size="small" variant="outlined" />
                                )}
                              </Stack>
                              <Button
                                fullWidth
                                variant={p.check_in ? 'outlined' : 'contained'}
                                color={p.check_in ? 'error' : 'success'}
                                onClick={() => handleToggleCheckIn(p.id, p.check_in)}
                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                              >
                                {p.check_in ? 'Anulează intrarea' : 'Validează buletinul'}
                              </Button>
                            </Card>
                          ))}
                        </Stack>
                      </>
                    )}
                  </>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      <EditEventDialog
        open={Boolean(eventDeEditat)}
        event={eventDeEditat}
        onClose={() => setEventDeEditat(null)}
        onSaved={(msg) => {
          showToast(msg);
          incarcaDateAdmin(true);
        }}
      />

      <ManageAdminDialog
        open={dialogAdminDeschis}
        onClose={() => setDialogAdminDeschis(false)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      <Dialog open={Boolean(eventDeSters)} onClose={() => !stergeInCurs && setEventDeSters(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmă ștergerea</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sigur vrei să ștergi evenimentul <strong>{eventDeSters?.titlu}</strong>?
            {eventDeSters && (
              <>
                {' '}
                Această acțiune va elimina și toate biletele asociate (
                {participants.filter((p) => String(p.event_id) === String(eventDeSters.id)).length}{' '}
                bilete) și nu poate fi anulată.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEventDeSters(null)} disabled={stergeInCurs}>
            Anulează
          </Button>
          <Button variant="contained" color="error" onClick={handleStergeEveniment} disabled={stergeInCurs}>
            {stergeInCurs ? 'Se șterge...' : 'Șterge definitiv'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminDashboard;
