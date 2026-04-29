// ============================================
// TaxGlue Financial Year Utility
// Dynamically generates FY options
// ============================================

// Get current FY based on current date
export function getCurrentFY() {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 11 = Dec
  const year = now.getFullYear();
  
  // If after March 31, use current year as starting FY
  // Otherwise use previous year as starting FY
  if (month >= 3) { // April onwards
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

// Generate FY list dynamically
export function generateFYOptions(startYearsBack = 5, startYearsAhead = 2) {
  const currentYear = new Date().getFullYear();
  const options = [];
  
  // Generate past years
  for (let i = startYearsBack; i >= 0; i--) {
    const startYr = currentYear - i;
    const endYr = startYr + 1;
    options.push(`${startYr}-${endYr.toString().slice(-2)}`);
  }
  
  // Generate future years
  for (let i = 1; i <= startYearsAhead; i++) {
    const startYr = currentYear + i;
    const endYr = startYr + 1;
    options.push(`${startYr}-${endYr.toString().slice(-2)}`);
  }
  
  return options;
}

// Get FY from date
export function getFYFromDate(date) {
  const d = new Date(date);
  const month = d.getMonth();
  const year = d.getFullYear();
  
  if (month >= 3) { // April onwards
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

// Validate FY format (e.g., "2024-25")
export function isValidFY(fy) {
  return /^\d{4}-\d{2}$/.test(fy);
}

// Get FY start and end dates
export function getFYDates(fy) {
  if (!isValidFY(fy)) return null;
  
  const startYear = parseInt(fy.split('-')[0]);
  const startDate = new Date(startYear, 3, 1); // April 1
  const endDate = new Date(startYear + 1, 2, 31); // March 31
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
}

// Generate HTML select options
export function getFYSelectHTML(selectedFY = null) {
  const options = generateFYOptions();
  const current = selectedFY || getCurrentFY();
  
  return options.map(fy => 
    `<option value="${fy}" ${fy === current ? 'selected' : ''}>FY ${fy}</option>`
  ).join('\n');
}

// Get quarters for a FY
export function getQuartersForFY(fy) {
  return ['Q1', 'Q2', 'Q3', 'Q4'];
}

// Get month names (April to March)
export function getFYMonths() {
  return ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
}

// Make available globally
if (typeof window !== 'undefined') {
  window.getCurrentFY = getCurrentFY;
  window.generateFYOptions = generateFYOptions;
  window.getFYFromDate = getFYFromDate;
  window.isValidFY = isValidFY;
  window.getFYDates = getFYDates;
  window.getFYSelectHTML = getFYSelectHTML;
  window.getQuartersForFY = getQuartersForFY;
  window.getFYMonths = getFYMonths;
}

export default {
  getCurrentFY,
  generateFYOptions,
  getFYFromDate,
  isValidFY,
  getFYDates,
  getFYSelectHTML,
  getQuartersForFY,
  getFYMonths
};