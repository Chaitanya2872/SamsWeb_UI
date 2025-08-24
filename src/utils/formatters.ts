import { format,  formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format a date using date-fns
 * @param date - Date string, Date object, or timestamp
 * @param formatStr - Format string (e.g., 'PP', 'PPp', 'yyyy-MM-dd')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | number, formatStr: string = 'PP'): string => {
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param date - Date string, Date object, or timestamp
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date | number): string => {
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Unknown time';
  }
};

/**
 * Format a number with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export const formatNumber = (value: number | null | undefined, decimals: number = 0): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format a currency value
 * @param value - Amount to format
 * @param currency - Currency code (default: 'INR')
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | null | undefined, currency: string = 'INR'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format a percentage value
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Format file size in human readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || isNaN(bytes)) {
    return '—';
  }
  
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Format a phone number
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '—';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Indian mobile number (10 digits)
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  // Check if it includes country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const number = cleaned.slice(2);
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  }
  
  return phone; // Return original if can't format
};

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export const truncateText = (
  text: string | null | undefined, 
  maxLength: number, 
  suffix: string = '...'
): string => {
  if (!text) return '—';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeWords = (text: string | null | undefined): string => {
  if (!text) return '';
  
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Format address for display
 * @param address - Address components
 * @returns Formatted address string
 */
export const formatAddress = (address: {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}): string => {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
    address.country
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : '—';
};

/**
 * Format coordinates for display
 * @param lat - Latitude
 * @param lng - Longitude
 * @param precision - Number of decimal places
 * @returns Formatted coordinates string
 */
export const formatCoordinates = (
  lat: number | null | undefined, 
  lng: number | null | undefined,
  precision: number = 6
): string => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return '—';
  }
  
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

/**
 * Format a rating score with color coding
 * @param rating - Rating value (1-5)
 * @returns Object with formatted rating and color class
 */
export const formatRating = (rating: number | null | undefined): {
  value: string;
  colorClass: string;
  label: string;
} => {
  if (rating === null || rating === undefined || isNaN(rating)) {
    return {
      value: '—',
      colorClass: 'text-secondary-500',
      label: 'Not rated'
    };
  }
  
  const roundedRating = Math.round(rating * 10) / 10;
  
  if (roundedRating >= 4) {
    return {
      value: roundedRating.toFixed(1),
      colorClass: 'text-success-600',
      label: 'Good'
    };
  } else if (roundedRating >= 3) {
    return {
      value: roundedRating.toFixed(1),
      colorClass: 'text-warning-600',
      label: 'Fair'
    };
  } else if (roundedRating >= 2) {
    return {
      value: roundedRating.toFixed(1),
      colorClass: 'text-warning-600',
      label: 'Poor'
    };
  } else {
    return {
      value: roundedRating.toFixed(1),
      colorClass: 'text-danger-600',
      label: 'Critical'
    };
  }
};

/**
 * Format enum values for display
 * @param value - Enum value
 * @returns Formatted display string
 */
export const formatEnumValue = (value: string | null | undefined): string => {
  if (!value) return '—';
  
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format health status with appropriate styling
 * @param health - Health status
 * @returns Object with formatted health and styling
 */
export const formatHealthStatus = (health: string | null | undefined): {
  label: string;
  colorClass: string;
  bgClass: string;
} => {
  if (!health) {
    return {
      label: 'Unknown',
      colorClass: 'text-secondary-500',
      bgClass: 'bg-secondary-100'
    };
  }
  
  const healthLower = health.toLowerCase();
  
  switch (healthLower) {
    case 'good':
      return {
        label: 'Good',
        colorClass: 'text-success-700',
        bgClass: 'bg-success-100'
      };
    case 'fair':
      return {
        label: 'Fair',
        colorClass: 'text-warning-700',
        bgClass: 'bg-warning-100'
      };
    case 'poor':
      return {
        label: 'Poor',
        colorClass: 'text-warning-700',
        bgClass: 'bg-warning-100'
      };
    case 'critical':
      return {
        label: 'Critical',
        colorClass: 'text-danger-700',
        bgClass: 'bg-danger-100'
      };
    default:
      return {
        label: capitalizeWords(health),
        colorClass: 'text-secondary-700',
        bgClass: 'bg-secondary-100'
      };
  }
};