import React from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { JUDETE_ROMANIA } from '../../constants/judeteRomania';

/** Județul evenimentului (câmp nou sau extras din locatie veche). */
export function getJudetEveniment(event) {
  if (event.judet?.trim()) return event.judet.trim();
  const loc = (event.locatie || '').trim();
  if (loc.includes(',')) return loc.split(',').pop().trim();
  return '';
}

function esteInZiua(dataEveniment, dataFiltru) {
  if (!dataFiltru) return true;
  const ev = new Date(dataEveniment);
  const [y, m, d] = dataFiltru.split('-').map(Number);
  return ev.getFullYear() === y && ev.getMonth() === m - 1 && ev.getDate() === d;
}

export function filtreazaEvenimente(events, { nume, judet, data }) {
  const termNume = (nume || '').trim().toLowerCase();
  const judetFiltru = (judet || '').trim();

  return events.filter((event) => {
    if (termNume && !(event.titlu || '').toLowerCase().includes(termNume)) {
      return false;
    }
    if (judetFiltru && getJudetEveniment(event) !== judetFiltru) {
      return false;
    }
    if (!esteInZiua(event.data_eveniment, data)) {
      return false;
    }
    return true;
  });
}

function EventSearchFilters({
  nume,
  judet,
  data,
  onNumeChange,
  onJudetChange,
  onDataChange,
  onReset,
}) {
  const theme = useTheme();
  const areFiltre = Boolean((nume || '').trim() || judet || data);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.15),
        bgcolor: alpha(theme.palette.background.paper, 0.6),
      }}
    >
      <Grid container spacing={2} sx={{ alignItems: 'flex-end' }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            label="Caută după nume"
            placeholder="Concert, festival, conferință..."
            value={nume}
            onChange={(e) => onNumeChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Județ"
            value={judet}
            onChange={(e) => onJudetChange(e.target.value)}
            slotProps={{
              select: { displayEmpty: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MapOutlinedIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          >
            <MenuItem value="">
              <em>Toate județele</em>
            </MenuItem>
            {JUDETE_ROMANIA.map((j) => (
              <MenuItem key={j} value={j}>
                {j}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            type="date"
            label="Data"
            value={data}
            onChange={(e) => onDataChange(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EventRoundedIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ClearRoundedIcon />}
            onClick={onReset}
            disabled={!areFiltre}
            sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }}
          >
            Resetează
          </Button>
        </Grid>
      </Grid>
      {areFiltre && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Filtre active — rezultatele se actualizează automat.
        </Typography>
      )}
    </Paper>
  );
}

export default EventSearchFilters;
