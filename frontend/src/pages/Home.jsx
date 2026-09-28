import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Alert } from '@mui/material';
import { apiFetch } from '../api/client';
import PageContainer from '../components/layout/PageContainer';
import EventListItem from '../components/ui/EventListItem';
import LoadingScreen from '../components/ui/LoadingScreen';
import EmptyState from '../components/ui/EmptyState';
import EventSearchFilters, { filtreazaEvenimente } from '../components/ui/EventSearchFilters';

function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtruNume, setFiltruNume] = useState('');
  const [filtruJudet, setFiltruJudet] = useState('');
  const [filtruData, setFiltruData] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiFetch('/api/events', { auth: false });
        if (!response.ok) throw new Error('Nu am putut prelua evenimentele.');
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const evenimenteFiltrate = useMemo(
    () =>
      filtreazaEvenimente(events, {
        nume: filtruNume,
        judet: filtruJudet,
        data: filtruData,
      }),
    [events, filtruNume, filtruJudet, filtruData]
  );

  const resetFiltre = () => {
    setFiltruNume('');
    setFiltruJudet('');
    setFiltruData('');
  };

  if (loading) return <LoadingScreen message="Se încarcă evenimentele..." />;

  if (error) {
    return (
      <PageContainer>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <EventSearchFilters
        nume={filtruNume}
        judet={filtruJudet}
        data={filtruData}
        onNumeChange={setFiltruNume}
        onJudetChange={setFiltruJudet}
        onDataChange={setFiltruData}
        onReset={resetFiltre}
      />

      {events.length === 0 ? (
        <EmptyState
          title="Niciun eveniment disponibil"
          description="Momentan nu sunt evenimente publicate. Revino curând pentru noi experiențe!"
        />
      ) : evenimenteFiltrate.length === 0 ? (
        <EmptyState
          title="Niciun rezultat"
          description="Nu am găsit evenimente care să corespundă filtrelor. Încearcă alt nume, județ sau dată."
        />
      ) : (
        <Stack spacing={2.5}>
          {evenimenteFiltrate.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              onDetails={(id) => navigate(`/events/${id}`)}
            />
          ))}
        </Stack>
      )}
    </PageContainer>
  );
}

export default Home;
