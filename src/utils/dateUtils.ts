/**
 * Formatea una fecha YYYY-MM-DD al formato en español: "Día, DD de Mes"
 * Si la cadena no coincide con el formato YYYY-MM-DD, se retorna tal cual.
 */
export const formatDateSpanish = (dateStr: string): string => {
  if (!dateStr) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const [year, month, day] = dateStr.split('-').map(Number);
  // Usamos Date local sin desajuste de zona horaria
  const date = new Date(year, month - 1, day);
  
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  return `${dayName}, ${day} de ${monthName}`;
};

/**
 * Convierte una hora de 24h "HH:MM" a formato 12h "H:MM AM/PM"
 */
export const formatTime12h = (time24: string): string => {
  if (!time24) return '';
  const match = time24.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time24;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 se convierte en 12
  return `${hours}:${minutes} ${ampm}`;
};

/**
 * Convierte una hora de 12h "H:MM AM/PM" a formato 24h "HH:MM"
 */
export const parseTime12hTo24h = (time12h: string): string => {
  if (!time12h) return '';
  const match = time12h.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '';

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

/**
 * Parsea un rango de horas como "2:00 PM a 5:00 PM"
 * Retorna los valores de inicio y fin en formato 24h y si es un rango válido.
 */
export const parseTimeRange = (timeRange: string): { start24: string; end24: string; isRange: boolean } => {
  if (!timeRange) return { start24: '', end24: '', isRange: false };
  const parts = timeRange.split(/\s+a\s+/i);
  if (parts.length === 2) {
    const start24 = parseTime12hTo24h(parts[0]);
    const end24 = parseTime12hTo24h(parts[1]);
    if (start24 && end24) {
      return { start24, end24, isRange: true };
    }
  }
  return { start24: '', end24: '', isRange: false };
};
