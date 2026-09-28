/** Text afișat pentru locație (evenimente noi sau vechi). */
export function afiseazaLocatie(event) {
  if (!event) return '—';
  const localitate = (event.localitate || '').trim();
  const judet = (event.judet || '').trim();
  if (localitate && judet) return `${localitate}, ${judet}`;
  return (event.locatie || localitate || judet || '—').trim();
}

/** Populează câmpurile formularului din eveniment (inclusiv date vechi). */
export function locatieInFormular(event) {
  if (event?.judet && event?.localitate) {
    return { judet: event.judet, localitate: event.localitate };
  }
  return { judet: '', localitate: event?.locatie || '' };
}
