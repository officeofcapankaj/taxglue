// ============================================
// TaxGlue Shared Utilities
// Formatting and notification helpers
// ============================================

// ============================================
// FORMAT UTILITIES
// ============================================

/**
 * Format currency (Indian Rupees)
 * @param {number} amount - Amount to format
 * @param {string} symbol - Currency symbol (default: ₹)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, symbol = '₹') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${symbol}0`;
  }
  
  const num = Number(amount);
  if (num === 0) return `${symbol}0`;
  
  // Indian number format with commas
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${symbol}${formatted}`;
}

/**
 * Format date to Indian format
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Include time in output
 * @returns {string} Formatted date string
 */
export function formatDate(date, includeTime = false) {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '-';
  
  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return d.toLocaleDateString('en-IN', options);
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateForInput(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  return d.toISOString().split('T')[0];
}

/**
 * Format number with Indian locale
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  return Number(num).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format percentage
 * @param {number} value - Value (0-100 or 0-1)
 * @param {boolean} asDecimal - Value is decimal (0.05 = 5%)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, asDecimal = false) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  const num = Number(value);
  const percent = asDecimal ? num * 100 : num;
  
  return `${percent.toFixed(2)}%`;
}

/**
 * Format PAN number
 * @param {string} pan - PAN number
 * @returns {string} Formatted PAN
 */
export function formatPAN(pan) {
  if (!pan) return '-';
  pan = pan.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (pan.length === 10) {
    return `${pan.slice(0,5)}${pan.slice(5,9)}${pan.slice(9)}`;
  }
  return pan;
}

/**
 * Format GSTIN
 * @param {string} gstin - GSTIN number
 * @returns {string} Formatted GSTIN
 */
export function formatGSTIN(gstin) {
  if (!gstin) return '-';
  gstin = gstin.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (gstin.length === 15) {
    return `${gstin.slice(0,2)}${gstin.slice(2,7)}${gstin.slice(7,11)}${gstin.slice(11,15)}`;
  }
  return gstin;
}

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone
 */
export function formatPhone(phone) {
  if (!phone) return '-';
  phone = phone.replace(/[^0-9]/g, '');
  if (phone.length === 10) {
    return `${phone.slice(0,5)} ${phone.slice(5)}`;
  }
  if (phone.length === 12 && phone.startsWith('91')) {
    return `+91 ${phone.slice(2,7)} ${phone.slice(7)}`;
  }
  return phone;
}

/**
 * Get FY from date
 * @param {Date|string} date - Date object or string
 * @returns {string} FY string (e.g., "2024-25")
 */
export function getFY(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11
  
  if (month >= 3) { // April onwards
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

/**
 * Get current FY
 * @returns {string} Current FY
 */
export function getCurrentFY() {
  return getFY(new Date());
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate PAN number
 * @param {string} pan - PAN number
 * @returns {boolean} Is valid
 */
export function isValidPAN(pan) {
  if (!pan) return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
}

/**
 * Validate GSTIN
 * @param {string} gstin - GSTIN number
 * @returns {boolean} Is valid
 */
export function isValidGSTIN(gstin) {
  if (!gstin) return false;
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
}

/**
 * Validate email
 * @param {string} email - Email address
 * @returns {boolean} Is valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^[6-9][0-9]{9}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
}

/**
 * Validate PIN code
 * @param {string} pincode - PIN code
 * @returns {boolean} Is valid
 */
export function isValidPincode(pincode) {
  if (!pincode) return false;
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

// ============================================
// NOTIFICATION UTILITIES
// ============================================

let notificationContainer = null;

/**
 * Get or create notification container
 */
function getNotificationContainer() {
  if (!notificationContainer) {
    notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notificationContainer';
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
      
      // Add styles if not present
      if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
          .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
          }
          .notification {
            padding: 16px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
          }
          .notification.success { background: #10B981; color: white; }
          .notification.error { background: #EF4444; color: white; }
          .notification.warning { background: #F59E0B; color: white; }
          .notification.info { background: #3B82F6; color: white; }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }
  return notificationContainer;
}

/**
 * Show success notification
 * @param {string} message - Message to show
 * @param {number} duration - Duration in ms
 */
export function showSuccess(message, duration = 3000) {
  showNotification(message, 'success', duration);
}

/**
 * Show error notification
 * @param {string} message - Message to show
 * @param {number} duration - Duration in ms
 */
export function showError(message, duration = 5000) {
  showNotification(message, 'error', duration);
}

/**
 * Show warning notification
 * @param {string} message - Message to show
 * @param {number} duration - Duration in ms
 */
export function showWarning(message, duration = 4000) {
  showNotification(message, 'warning', duration);
}

/**
 * Show info notification
 * @param {string} message - Message to show
 * @param {number} duration - Duration in ms
 */
export function showInfo(message, duration = 3000) {
  showNotification(message, 'info', duration);
}

/**
 * Show notification
 * @param {string} message - Message to show
 * @param {string} type - Type: success, error, warning, info
 * @param {number} duration - Duration in ms
 */
export function showNotification(message, type = 'info', duration = 3000) {
  const container = getNotificationContainer();
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span class="notification-icon">${getIcon(type)}</span>
    <span class="notification-message">${message}</span>
  `;
  
  container.appendChild(notification);
  
  // Auto-remove
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/**
 * Get icon for notification type
 */
function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || 'ℹ';
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Formatting
  formatCurrency,
  formatDate,
  formatDateForInput,
  formatNumber,
  formatPercentage,
  formatPAN,
  formatGSTIN,
  formatPhone,
  getFY,
  getCurrentFY,
  
  // Validation
  isValidPAN,
  isValidGSTIN,
  isValidEmail,
  isValidPhone,
  isValidPincode,
  
  // Notifications
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showNotification
};