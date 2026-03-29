// ============================================
// TaxGlue Shared Components Index
// Central export for all shared utilities
// ============================================

// Sidebar
export { initSidebar, sidebarConfig } from './sidebar.js';

// Client Selector
export { 
  ClientSelector, 
  initClientSelector, 
  getSelectedClientId, 
  getSelectedFY, 
  getSelectedQuarter 
} from './client-selector.js';

// Utilities
export {
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
} from './utils.js';

// Default export
export default {
  initSidebar,
  initClientSelector,
  getSelectedClientId,
  getSelectedFY,
  getSelectedQuarter
};