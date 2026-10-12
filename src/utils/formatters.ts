// Currency formatting with Pakistani numbering grouping: Rs. 1,25,000
export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rs. 0';
  const isNegative = amount < 0;
  const absVal = Math.round(Math.abs(amount));
  
  // Format with en-PK or fallback grouping
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 0,
    }).format(absVal);
  } catch {
    formatted = absVal.toLocaleString();
  }

  return `${isNegative ? '-' : ''}Rs. ${formatted}`;
}

export function formatCompactPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rs. 0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}Rs. ${(abs / 10000000).toFixed(1)} Cr`;
  }
  if (abs >= 1000000) {
    return `${sign}Rs. ${(abs / 1000000).toFixed(1)}M`;
  }
  if (abs >= 100000) {
    return `${sign}Rs. ${(abs / 100000).toFixed(1)} Lakh`;
  }
  if (abs >= 1000) {
    return `${sign}Rs. ${(abs / 1000).toFixed(0)}k`;
  }
  return `${sign}Rs. ${abs}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }); // e.g. "12 Oct 2026"
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const datePart = d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart}, ${timePart}`;
  } catch {
    return isoString;
  }
}

// Convert Pakistani 0300xxxxxxx to 92300xxxxxxx
export function cleanPakistaniPhone(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('03')) {
    digits = '92' + digits.substring(1);
  } else if (digits.startsWith('9203')) {
    digits = '92' + digits.substring(3);
  } else if (digits.startsWith('3') && digits.length === 10) {
    digits = '92' + digits;
  }
  return digits;
}

export function openWhatsAppLink(phone: string, text: string): void {
  const cleanPhone = cleanPakistaniPhone(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (val: string | number) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const MONTH_OPTIONS = [
  { key: '2026-10', label: 'Oct 2026' },
  { key: '2026-09', label: 'Sep 2026' },
  { key: '2026-08', label: 'Aug 2026' },
  { key: '2026-07', label: 'Jul 2026' },
  { key: '2026-06', label: 'Jun 2026' },
  { key: '2026-05', label: 'May 2026' },
];
