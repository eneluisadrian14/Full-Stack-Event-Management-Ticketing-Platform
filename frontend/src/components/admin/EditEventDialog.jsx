import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { apiFetch } from '../../api/client';
import EventLocationFields from './EventLocationFields';
import { locatieInFormular } from '../../utils/locatie';

function eventToForm(event) {
  const d = new Date(event.data_eveniment);
  const pad = (n) => String(n).padStart(2, '0');
  const { judet, localitate } = locatieInFormular(event);
  return {
    titlu: event.titlu || '',
    descriere: event.descriere || '',
    data: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    ora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    judet,
    localitate,
    pret: String(event.pret ?? ''),
    locuri_totale: String(event.locuri_totale ?? ''),
    durata_ore: String(event.durata_ore ?? '2'),
  };
}

function EditEventDialog({ open, event, onClose, onSaved }) {
  const theme = useTheme();
  const [formData, setFormData] = useState(null);
  const [imaginiExistente, setImaginiExistente] = useState([]);
  const [imaginiNoi, setImaginiNoi] = useState([]);
  const [previewNoi, setPreviewNoi] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && event) {
      setFormData(eventToForm(event));
      setImaginiExistente(Array.isArray(event.imagini) ? [...event.imagini] : []);
      setImaginiNoi([]);
      setPreviewNoi([]);
      setError('');
    }
  }, [open, event]);

  useEffect(() => {
    const urls = imaginiNoi.map((f) => URL.createObjectURL(f));
    setPreviewNoi(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [imaginiNoi]);

  if (!event || !formData) return null;

  const locuriVandute = Number(event.locuri_totale) - Number(event.locuri_disponibile);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const fisiereNoi = Array.from(e.target.files);
    if (fisiereNoi.length === 0) return;

    const combinat = [...imaginiNoi, ...fisiereNoi];
    const total = imaginiExistente.length + combinat.length;
    if (total > 8) {
      setError(
        `Maximum 8 imagini în total. Ai ${imaginiExistente.length} salvate și ${imaginiNoi.length} noi — mai poți adăuga ${8 - imaginiExistente.length - imaginiNoi.length}.`
      );
      e.target.value = '';
      return;
    }
    setImaginiNoi(combinat);
    setError('');
    e.target.value = '';
  };

  const removeExistingImage = (index) => {
    setImaginiExistente((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImaginiNoi((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.data || !formData.ora) {
      setError('Selectează data și ora.');
      return;
    }

    setSubmitting(true);
    const dataToSend = new FormData();
    dataToSend.append('titlu', formData.titlu);
    dataToSend.append('descriere', formData.descriere);
    dataToSend.append('data_eveniment', `${formData.data}T${formData.ora}:00`);
    dataToSend.append('judet', formData.judet);
    dataToSend.append('localitate', formData.localitate.trim());
    dataToSend.append('pret', formData.pret);
    dataToSend.append('locuri_totale', formData.locuri_totale);
    dataToSend.append('durata_ore', formData.durata_ore);
    dataToSend.append('imagini_pastrate', JSON.stringify(imaginiExistente));
    imaginiNoi.forEach((img) => dataToSend.append('imagini', img));

    try {
      const response = await apiFetch(`/api/events/${event.id}`, {
        method: 'PUT',
        body: dataToSend,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onSaved(data.message);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        Modifică evenimentul
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Typography color="error" sx={{ mb: 2, fontWeight: 600 }}>
              {error}
            </Typography>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField required fullWidth label="Titlu" name="titlu" value={formData.titlu} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descriere"
                name="descriere"
                value={formData.descriere}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                required
                fullWidth
                type="date"
                label="Data"
                name="data"
                value={formData.data}
                onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                required
                fullWidth
                type="time"
                label="Ora"
                name="ora"
                value={formData.ora}
                onChange={handleChange}
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
                onChange={handleChange}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Grid>
            <EventLocationFields
              judet={formData.judet}
              localitate={formData.localitate}
              onChange={handleChange}
              disabled={submitting}
            />
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                type="number"
                label="Preț bilet (RON)"
                name="pret"
                value={formData.pret}
                onChange={handleChange}
                slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                type="number"
                label="Număr total locuri"
                name="locuri_totale"
                value={formData.locuri_totale}
                onChange={handleChange}
                slotProps={{ htmlInput: { min: locuriVandute } }}
                helperText={`Minim ${locuriVandute} (${locuriVandute} bilete deja vândute)`}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Imagini curente
              </Typography>
              {imaginiExistente.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nici o imagine salvată.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {imaginiExistente.map((url, idx) => (
                    <Box key={url} sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={url}
                        alt=""
                        sx={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeExistingImage(idx)}
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          bgcolor: 'error.main',
                          color: '#fff',
                          width: 22,
                          height: 22,
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: alpha(theme.palette.primary.main, 0.35),
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                }}
                onClick={() => document.getElementById('edit-event-files')?.click()}
              >
                <CloudUploadOutlinedIcon color="primary" />
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {imaginiNoi.length > 0 ? 'Adaugă încă o poză' : 'Adaugă poză nouă'} ({imaginiExistente.length + imaginiNoi.length}/8)
                </Typography>
                <input
                  id="edit-event-files"
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Box>
              {previewNoi.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {previewNoi.map((url, idx) => (
                    <Box key={`nou-${idx}-${imaginiNoi[idx]?.name || url}`} sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={url}
                        alt=""
                        sx={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 1, display: 'block' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeNewImage(idx)}
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          bgcolor: 'error.main',
                          color: '#fff',
                          width: 22,
                          height: 22,
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Anulează
          </Button>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ minWidth: 140 }}>
            {submitting ? <CircularProgress size={22} color="inherit" /> : 'Salvează modificările'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default EditEventDialog;
