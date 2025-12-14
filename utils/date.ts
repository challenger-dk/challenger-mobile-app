export const formatTime = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'long',
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatTimeRange = (startISO: string, endISO: string): string => {
  if (!startISO) return '';

  const getHour = (iso: string) =>
    new Date(iso).getHours().toString().padStart(2, '0');
  const start = getHour(startISO);

  if (!endISO) return `Kl. ${start}`;
  const end = getHour(endISO);

  return `Kl. ${start}-${end}`;
};

/**
 * Calculates age from a birthdate
 * @param birthDate - Can be a Date object, date string (ISO format), or undefined
 * @returns The age in years, or undefined if birthDate is invalid
 */
export const calculateAge = (birthDate: Date | string | undefined): number | undefined => {
  if (!birthDate) return undefined;

  try {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    
    // Check if date is valid
    if (isNaN(birth.getTime())) return undefined;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust age if birthday hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return undefined;
  }
};
