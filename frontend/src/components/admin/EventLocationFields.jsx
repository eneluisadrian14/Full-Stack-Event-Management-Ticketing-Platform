import React from 'react';
import { Grid, TextField, MenuItem, InputAdornment } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { JUDETE_ROMANIA } from '../../constants/judeteRomania';

function EventLocationFields({ judet, localitate, onChange, disabled = false }) {
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          required
          fullWidth
          label="Județ"
          name="judet"
          value={judet}
          onChange={onChange}
          disabled={disabled}
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
          <MenuItem value="" disabled>
            Selectează județul
          </MenuItem>
          {JUDETE_ROMANIA.map((j) => (
            <MenuItem key={j} value={j}>
              {j}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          required
          fullWidth
          label="Localitate"
          name="localitate"
          value={localitate}
          onChange={onChange}
          disabled={disabled}
          placeholder="ex: Cluj-Napoca, Timișoara, Brașov"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnOutlinedIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
    </>
  );
}

export default EventLocationFields;
