import React from 'react';
import {
  Card,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { EVENT_PLACEHOLDER_IMAGE } from '../../theme/tokens';
import { afiseazaLocatie } from '../../utils/locatie';

function EventListItem({ event, onDetails }) {
  const theme = useTheme();
  const imagineCoperta =
    event.imagini && event.imagini.length > 0 ? event.imagini[0] : EVENT_PLACEHOLDER_IMAGE;

  const dataFormata = new Date(event.data_eveniment).toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleClick = () => onDetails(event.id);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
        cursor: 'pointer',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.45),
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
          transform: { sm: 'translateX(4px)' },
        },
      }}
      onClick={handleClick}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: '100%', sm: 300, md: 320 },
          height: { xs: 'auto', sm: 200 },
          aspectRatio: { xs: '16 / 9', sm: 'unset' },
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <Box
          component="img"
          src={imagineCoperta}
          alt={event.titlu}
          sx={{
            width: '100%',
            height: { xs: '100%', sm: 200 },
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </Box>

      <Stack
        sx={{
          flex: 1,
          p: { xs: 2, sm: 2.5, md: 3 },
          justifyContent: 'center',
          minWidth: 0,
        }}
        spacing={1.5}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.15rem', md: '1.35rem' },
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.titlu}
        </Typography>

        <Stack spacing={0.75}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <EventRoundedIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.15, flexShrink: 0 }} />
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              {dataFormata}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.15, flexShrink: 0 }} />
            <Typography variant="body1" color="text.secondary">
              {afiseazaLocatie(event)}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            pt: 0.5,
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Preț bilet
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {event.pret} RON
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {event.locuri_disponibile > 0 && (
              <Chip
                label={`${event.locuri_disponibile} locuri`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <Button
              variant="contained"
              endIcon={<ChevronRightRoundedIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              sx={{
                minHeight: 44,
                px: 2.5,
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              Detalii
            </Button>
          </Stack>
        </Stack>

        <Button
          variant="contained"
          fullWidth
          endIcon={<ConfirmationNumberOutlinedIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          sx={{ minHeight: 44, display: { xs: 'inline-flex', sm: 'none' } }}
        >
          Vezi detalii
        </Button>
      </Stack>
    </Card>
  );
}

export default EventListItem;
