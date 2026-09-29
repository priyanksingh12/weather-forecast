export function formatUtcToIst(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' IST';
  } catch {
    return isoString;
  }
}

export function formatUtcShort(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' UTC';
  } catch {
    return isoString;
  }
}

export function formatPercent(val: number): string {
  return `${Math.round(val * 100)}%`;
}

export function formatVariableLabel(variable: string): string {
  switch (variable) {
    case 'rainfall':
      return '24h Rainfall Accumulation';
    case 'tmax':
      return 'Maximum Temperature (Tmax)';
    case 'tmin':
      return 'Minimum Temperature (Tmin)';
    case 'wind':
      return '10m Surface Wind Speed';
    case 'mslp':
      return 'Mean Sea Level Pressure (MSLP)';
    case 'humidity':
      return 'Surface Relative Humidity';
    default:
      return variable;
  }
}

export function getVariableUnit(variable: string): string {
  switch (variable) {
    case 'rainfall':
      return 'mm/24h';
    case 'tmax':
    case 'tmin':
      return '°C';
    case 'wind':
      return 'm/s';
    case 'mslp':
      return 'hPa';
    case 'humidity':
      return '%';
    default:
      return '';
  }
}
