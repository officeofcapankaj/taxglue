// ============================================
// TaxGlue Shared Client Selector Component
// Reusable client and FY selector
// ============================================

import { clientsAPI } from '../supabase-api.js';

// Default FY list
const defaultFYList = [
  '2026-27', '2025-26', '2024-25', '2023-24', '2022-23'
];

// Default Quarter list
const quarterList = [
  { value: 'Q1', label: 'Q1 (Apr-Jun)' },
  { value: 'Q2', label: 'Q2 (Jul-Sep)' },
  { value: 'Q3', label: 'Q3 (Oct-Dec)' },
  { value: 'Q4', label: 'Q4 (Jan-Mar)' }
];

export class ClientSelector {
  constructor(options = {}) {
    this.clientSelectorId = options.clientSelectorId || 'clientSelector';
    this.fySelectorId = options.fySelectorId || 'fySelect';
    this.quarterSelectorId = options.quarterSelectorId || 'quarterSelect';
    this.onClientChange = options.onClientChange || (() => {});
    this.onFYChange = options.onFYChange || (() => {});
    this.onQuarterChange = options.onQuarterChange || (() => {});
    this.clients = [];
    this.selectedClient = null;
    this.selectedFY = '';
  }
  
  // Initialize the client selector
  async init(options = {}) {
    const clientSelect = document.getElementById(this.clientSelectorId);
    const fySelect = document.getElementById(this.fySelectorId);
    const quarterSelect = document.getElementById(this.quarterSelectorId);
    
    // Load clients if selector exists
    if (clientSelect) {
      await this.loadClients(clientSelect);
      clientSelect.addEventListener('change', (e) => {
        this.selectedClient = e.target.value;
        this.onClientChange(e.target.value);
      });
    }
    
    // Initialize FY selector
    if (fySelect) {
      this.initFYSelector(fySelect, options.defaultFY);
      fySelect.addEventListener('change', (e) => {
        this.selectedFY = e.target.value;
        this.onFYChange(e.target.value);
      });
    }
    
    // Initialize Quarter selector
    if (quarterSelect) {
      this.initQuarterSelector(quarterSelect, options.defaultQuarter);
      quarterSelect.addEventListener('change', (e) => {
        this.onQuarterChange(e.target.value);
      });
    }
  }
  
  // Load clients from API
  async loadClients(selectElement) {
    try {
      this.clients = await clientsAPI.getAll();
      this.renderClients(selectElement);
    } catch (e) {
      console.error('Error loading clients:', e);
      // Fallback to localStorage
      const stored = localStorage.getItem('clients');
      if (stored) {
        try {
          this.clients = JSON.parse(stored);
          this.renderClients(selectElement);
        } catch (e2) {
          console.error('Error parsing stored clients:', e2);
        }
      }
    }
  }
  
  // Render clients in select
  renderClients(selectElement) {
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="">-- Select Client --</option>';
    
    if (this.clients && this.clients.length > 0) {
      this.clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        const name = client.name || client.client_name || 'Unnamed';
        const constitution = client.constitution || '';
        option.textContent = `${name} (${constitution})`;
        selectElement.appendChild(option);
      });
    }
  }
  
  // Initialize FY selector
  initFYSelector(selectElement, defaultFY) {
    if (!selectElement) return;
    
    selectElement.innerHTML = '';
    
    const currentFY = defaultFY || this.getCurrentFY();
    
    defaultFYList.forEach(fy => {
      const option = document.createElement('option');
      option.value = fy;
      option.textContent = fy;
      if (fy === currentFY) {
        option.selected = true;
        this.selectedFY = currentFY;
      }
      selectElement.appendChild(option);
    });
  }
  
  // Initialize Quarter selector
  initQuarterSelector(selectElement, defaultQuarter) {
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="">All Quarters</option>';
    
    quarterList.forEach(q => {
      const option = document.createElement('option');
      option.value = q.value;
      option.textContent = q.label;
      if (q.value === defaultQuarter) {
        option.selected = true;
      }
      selectElement.appendChild(option);
    });
  }
  
  // Get current FY based on date
  getCurrentFY() {
    const today = new Date();
    const month = today.getMonth(); // 0-11
    const year = today.getFullYear();
    
    if (month >= 3) { // April onwards
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }
  
  // Get selected client ID
  getSelectedClientId() {
    const select = document.getElementById(this.clientSelectorId);
    return select ? select.value : null;
  }
  
  // Get selected FY
  getSelectedFY() {
    const select = document.getElementById(this.fySelectorId);
    return select ? select.value : this.getCurrentFY();
  }
  
  // Get selected quarter
  getSelectedQuarter() {
    const select = document.getElementById(this.quarterSelectorId);
    return select ? select.value : '';
  }
  
  // Set selected client
  setSelectedClient(clientId) {
    const select = document.getElementById(this.clientSelectorId);
    if (select) {
      select.value = clientId;
      this.selectedClient = clientId;
    }
  }
  
  // Set selected FY
  setSelectedFY(fy) {
    const select = document.getElementById(this.fySelectorId);
    if (select) {
      select.value = fy;
      this.selectedFY = fy;
    }
  }
  
  // Set selected quarter
  setSelectedQuarter(quarter) {
    const select = document.getElementById(this.quarterSelectorId);
    if (select) {
      select.value = quarter;
    }
  }
  
  // Refresh clients from API
  async refresh() {
    const select = document.getElementById(this.clientSelectorId);
    if (select) {
      await this.loadClients(select);
    }
  }
}

// Export convenience function
export function initClientSelector(options = {}) {
  const selector = new ClientSelector(options);
  selector.init(options);
  return selector;
}

// Export convenience function for getting selected values
export function getSelectedClientId() {
  const select = document.getElementById('clientSelector');
  return select ? select.value : null;
}

export function getSelectedFY() {
  const select = document.getElementById('fySelect');
  if (select) return select.value;
  
  // Calculate current FY
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  if (month >= 3) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

export function getSelectedQuarter() {
  const select = document.getElementById('quarterSelect');
  return select ? select.value : '';
}

// Export default
export default { ClientSelector, initClientSelector, getSelectedClientId, getSelectedFY, getSelectedQuarter };