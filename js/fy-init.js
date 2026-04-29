<!-- ============================================
TaxGlue FY Auto-Initialization
This script automatically populates all FY dropdowns with dynamic options
============================================ --><script type="module">
// Auto-populate all FY select elements on the page
function initFYDropdowns() {
  const fySelects = document.querySelectorAll('select.fy-select, select[id*="fy"], select[name*="fy"]');
  
  // Get current and generate options
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Calculate current FY
  let currentFY;
  if (currentMonth >= 3) { // April onwards
    currentFY = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  } else {
    currentFY = `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
  }
  
  // Generate FY options (5 years back, 2 years ahead)
  const fyOptions = [];
  for (let i = 5; i >= 0; i--) {
    const startYr = currentYear - i;
    fyOptions.push(`${startYr}-${(startYr + 1).toString().slice(-2)}`);
  }
  for (let i = 1; i <= 2; i++) {
    const startYr = currentYear + i;
    fyOptions.push(`${startYr}-${(startYr + 1).toString().slice(-2)}`);
  }
  
  const optionsHTML = fyOptions.map(fy => 
    `<option value="${fy}" ${fy === currentFY ? 'selected' : ''}>FY ${fy}</option>`
  ).join('');
  
  // Update all FY selects
  fySelects.forEach(select => {
    // Clear existing options
    select.innerHTML = optionsHTML;
  });
  
  console.log('FY dropdowns initialized:', fySelects.length);
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFYDropdowns);
} else {
  initFYDropdowns();
}

// Also make available globally
window.initFYDropdowns = initFYDropdowns;
</script>