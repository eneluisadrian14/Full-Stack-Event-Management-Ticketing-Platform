import React, { useState, useEffect, useContext } from 'react';
import { Grid, Card, Box, Typography, Divider, alpha, useTheme } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';
import EmptyState from '../components/ui/EmptyState';
import StatusChip from '../components/ui/StatusChip';

function MyTickets() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTickets = async () => {
      if (!user) return;
      try {
        const response = await apiFetch('/api/tickets/my-tickets');
        if (response.ok) setTickets(await response.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, [user]);

  if (!user) {
    return (
      <PageContainer>
        <EmptyState title="Autentificare necesară" description="Loghează-te pentru a vedea biletele tale." />
      </PageContainer>
    );
  }

  if (loading) return <LoadingScreen message="Se încarcă biletele..." />;

  const acum = new Date();
  const bileteActive = [];
  const bileteTrecute = [];

  tickets.forEach((ticket) => {
    const dataStart = new Date(ticket.data_eveniment);
    const dataFinal = new Date(dataStart.getTime() + ticket.durata_ore * 60 * 60 * 1000);
    if (acum < dataFinal) bileteActive.push(ticket);
    else bileteTrecute.push(ticket);
  });

  const formatareData = (dataStr) =>
    new Date(dataStr).toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <PageContainer>
      <PageHeader
        title="Biletele mele"
        subtitle="Bilete nominale achiziționate securizat prin Stripe pentru evenimentele ManFast."
        align="left"
      />

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
        Bilete viitoare ({bileteActive.length})
      </Typography>
      {bileteActive.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontStyle: 'italic' }}>
          Nu ai bilete active pentru evenimente viitoare.
        </Typography>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {bileteActive.map((ticket) => (
            <Grid key={ticket.id} size={{ xs: 12, md: 6 }}>
              <TicketCard
                ticket={ticket}
                formatareData={formatareData}
                accentColor={theme.palette.primary.main}
                isPast={false}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
        Evenimente trecute ({bileteTrecute.length})
      </Typography>
      {bileteTrecute.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Nu ai participat la evenimente încheiate.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {bileteTrecute.map((ticket) => (
            <Grid key={ticket.id} size={{ xs: 12, md: 6 }}>
              <TicketCard ticket={ticket} formatareData={formatareData} isPast />
            </Grid>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}

function TicketCard({ ticket, formatareData, accentColor, isPast }) {
  const theme = useTheme();
  const borderColor = isPast ? theme.palette.divider : accentColor || theme.palette.primary.main;

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        borderLeft: `5px solid ${borderColor}`,
        opacity: isPast ? 0.85 : 1,
        bgcolor: isPast ? alpha(theme.palette.background.paper, 0.6) : 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {ticket.titlu}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ticket.locatie}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {formatareData(ticket.data_eveniment)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography variant="caption" color="text.secondary">
            Participant
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, color: isPast ? 'text.secondary' : 'primary.main' }}>
            {ticket.nume_buletin}
          </Typography>
          <Box sx={{ mt: 1 }}>
            {isPast ? (
              <StatusChip status="expired" />
            ) : ticket.check_in ? (
              <StatusChip status="checkedIn" />
            ) : (
              <StatusChip status="paid" />
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

export default MyTickets;
