export const formatTime = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'long'
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatTimeRange = (startISO: string, endISO: string): string => {
  if (!startISO) return '';

  const getHour = (iso: string) => new Date(iso).getHours().toString().padStart(2, '0');
  const start = getHour(startISO);

  if (!endISO) return `Kl. ${start}`;
  const end = getHour(endISO);

  return `Kl. ${start}-${end}`;
};
