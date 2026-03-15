/**
 * TaxGlue - Global Client Selection Manager
 * This file provides client selection functionality across all modules
 */

// Client Selection Keys
const CLIENT_SELECTOR_KEY = 'taxglue_selected_client';
const CLIENT_SELECTOR_FY_KEY = 'taxglue_selected_fy';

// Initialize client selector on all pages
document.addEventListener('DOMContentLoaded', async () => {
  initClientSelector();
});

/**
 * Initialize the global client selector in sidebar
 */
async function initClientSelector() {
  // Check if client selector already exists in sidebar
  const existingSelector = document.getElementById('globalClientSelector');
  if (!existingSelector) return;

  // Load clients from Supabase
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, constitution')
      .order('name');

    if (error) throw error;

    // Populate the selector
    const select = document.getElementById('globalClientSelect');
    if (select && clients) {
      // Add default option
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = '-- Select Client --';
      select.appendChild(defaultOpt);

      // Add client options
      clients.forEach(client => {
        const opt = document.createElement('option');
        opt.value = client.id;
        opt.textContent = `${client.name} (${client.constitution || 'N/A'})`;
        opt.dataset.name = client.name;
        select.appendChild(opt);
      });

      // Restore previously selected client
      const savedClientId = localStorage.getItem(CLIENT_SELECTOR_KEY);
      if (savedClientId) {
        select.value = savedClientId;
        // Trigger change event to update UI
        select.dispatchEvent(new Event('change'));
      }
    }
  } catch (e) {
    console.error('Error loading clients for global selector:', e);
  }
}

/**
 * Handle client selection change
 * Updates localStorage and notifies all open pages
 */
function onGlobalClientChange(selectElement) {
  const clientId = selectElement.value;
  const clientName = selectElement.options[selectElement.selectedIndex]?.dataset?.name || '';

  // Save to localStorage
  if (clientId) {
    localStorage.setItem(CLIENT_SELECTOR_KEY, clientId);
    localStorage.setItem(CLIENT_SELECTOR_KEY + '_name', clientName);
  } else {
    localStorage.removeItem(CLIENT_SELECTOR_KEY);
    localStorage.removeItem(CLIENT_SELECTOR_KEY + '_name');
  }

  // Dispatch custom event for other components to listen
  window.dispatchEvent(new CustomEvent('clientChanged', {
    detail: { clientId, clientName }
  }));

  // Update all module-level client selectors if they exist
  updateModuleSelectors(clientId);

  // Show/hide client-specific UI elements
  updateClientUIVisibility(clientId);
}

/**
 * Update all module-level client selectors
 */
function updateModuleSelectors(clientId) {
  // Find all client select elements in the page
  const moduleSelectors = document.querySelectorAll('[id*="clientSelect"], [id*="clientSelect"]');
  moduleSelectors.forEach(select => {
    if (select.id !== 'globalClientSelect' && select.value !== clientId) {
      select.value = clientId;
      // Trigger change event if it exists
      select.dispatchEvent(new Event('change'));
    }
  });
}

/**
 * Show/hide elements based on client selection
 */
function updateClientUIVisibility(clientId) {
  const clientRequiredElements = document.querySelectorAll('.client-required');
  clientRequiredElements.forEach(el => {
    if (clientId) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });

  // Show notification to select client if none selected
  const noClientWarning = document.getElementById('noClientWarning');
  if (noClientWarning) {
    noClientWarning.style.display = clientId ? 'none' : 'block';
  }
}

/**
 * Get currently selected client ID
 */
function getSelectedClientId() {
  return localStorage.getItem(CLIENT_SELECTOR_KEY) || '';
}

/**
 * Get currently selected client name
 */
function getSelectedClientName() {
  return localStorage.getItem(CLIENT_SELECTOR_KEY + '_name') || '';
}

/**
 * Get selected financial year
 */
function getSelectedFY() {
  return localStorage.getItem(CLIENT_SELECTOR_FY_KEY) || '2024-25';
}

/**
 * Set selected financial year
 */
function setSelectedFY(fy) {
  localStorage.setItem(CLIENT_SELECTOR_FY_KEY, fy);
}

/**
 * Require client selection before proceeding
 * Shows alert if no client is selected
 */
function requireClientSelection() {
  const clientId = getSelectedClientId();
  if (!clientId) {
    alert('Please select a client first using the dropdown in the sidebar.');
    // Focus the global client selector
    const globalSelect = document.getElementById('globalClientSelect');
    if (globalSelect) globalSelect.focus();
    return false;
  }
  return true;
}

/**
 * Add client selector to a page programmatically
 * Returns the select element
 */
function createClientSelector(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const {
    onChange,
    required = true,
    showAllOption = false,
    selectedClientId = getSelectedClientId()
  } = options;

  // Create select element
  const select = document.createElement('select');
  select.id = 'clientSelect_' + containerId;
  select.className = 'form-select';
  select.style.minWidth = '200px';

  if (required) {
    select.required = true;
  }

  // Add default option
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = showAllOption ? '-- All Clients --' : '-- Select Client --';
  select.appendChild(defaultOpt);

  // Load and populate clients
  supabase
    .from('clients')
    .select('id, name, constitution')
    .order('name')
    .then(({ data, error }) => {
      if (error) {
        console.error('Error loading clients:', error);
        return;
      }
      data.forEach(client => {
        const opt = document.createElement('option');
        opt.value = client.id;
        opt.textContent = `${client.name} (${client.constitution || 'N/A'})`;
        opt.dataset.name = client.name;
        select.appendChild(opt);
      });

      // Set selected value
      if (selectedClientId) {
        select.value = selectedClientId;
      }
    });

  // Add change listener
  if (onChange) {
    select.addEventListener('change', (e) => onChange(e.target.value));
  }

  container.appendChild(select);
  return select;
}
