/**
 * Dynamic Excel Template Generator
 * Generates Excel templates based on page fields
 */

const XLSX = window.XLSX;

// Template definitions
const TEMPLATES = {
  clients: {
    name: 'Client Template',
    headers: ['Name', 'Constitution', 'Address', 'City', 'District', 'State', 'Pincode', 'Phone', 'Email', 'GSTIN', 'PAN'],
    widths: [30, 20, 40, 20, 20, 20, 15, 20, 30, 20, 20]
  },
  accounts: {
    name: 'Account Template',
    headers: ['Code', 'Name', 'Nature', 'Type', 'Opening Balance'],
    widths: [15, 30, 20, 20, 18]
  },
  vouchers: {
    name: 'Voucher Template',
    headers: ['Date', 'Voucher No', 'Type', 'Narration', 'Account Name', 'Debit', 'Credit'],
    widths: [15, 15, 15, 40, 30, 15, 15]
  },
  employees: {
    name: 'Employee Template',
    headers: ['Employee Code', 'First Name', 'Last Name', 'Date of Joining', 'Department', 'Designation', 'PAN', 'Aadhaar', 'UAN', 'Bank Name', 'Account No', 'IFSC'],
    widths: [18, 20, 20, 18, 20, 20, 20, 20, 20, 20, 20, 15]
  }
};

// Generate and download Excel template
function generateExcelTemplate(templateType) {
  const template = TEMPLATES[templateType];
  if (!template) {
    console.error('Unknown template type:', templateType);
    return;
  }
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet with headers
  const ws = XLSX.utils.aoa_to_sheet([template.headers]);
  
  // Set column widths
  const col widths = {};
  template.widths.forEach((w, i) => {
    col widths[i] = { wch: w };
  });
  ws['!cols'] = col widths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, template.name);
  
  // Generate filename
  const filename = `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Download file
  XLSX.writeFile(wb, filename);
}

// Generate template with sample data
function generateExcelTemplateWithSample(templateType) {
  const template = TEMPLATES[templateType];
  if (!template) {
    console.error('Unknown template type:', templateType);
    return;
  }
  
  // Generate sample data based on template type
  const sampleData = getSampleData(templateType);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet with headers and sample data
  const ws = XLSX.utils.aoa_to_sheet([template.headers, ...sampleData]);
  
  // Set column widths
  const col widths = {};
  template.widths.forEach((w, i) => {
    col widths[i] = { wch: w };
  });
  ws['!cols'] = col widths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, template.name);
  
  // Generate filename
  const filename = `${template.name.replace(/\s+/g, '_')}_Template_With_Example.xlsx`;
  
  // Download file
  XLSX.writeFile(wb, filename);
}

// Get sample data for each template type
function getSampleData(templateType) {
  switch (templateType) {
    case 'clients':
      return [
        ['ABC Pvt Ltd', 'Private Limited', '123 Business Street', 'Mumbai', 'Mumbai', 'Maharashtra', '400001', '9876543210', 'contact@abcpvtltd.com', '27ABCDE1234F1Z5', 'ABCDE1234F'],
        ['XYZ Ltd', 'Public Limited', '456 Corporate Ave', 'Delhi', 'New Delhi', 'Delhi', '110001', '9876543211', 'info@xyzltd.com', '27XYZXYZ1234F1Z6', 'XYZXYZ1234F']
      ];
    case 'accounts':
      return [
        ['001', 'Capital Account', 'Liabilities', 'Capital', 0],
        ['002', 'Cash in Hand', 'Assets', 'Direct', 0],
        ['003', 'Cash at Bank', 'Assets', 'Direct', 0],
        ['004', 'Sundry Debtors', 'Assets', 'Direct', 0],
        ['005', 'Sundry Creditors', 'Liabilities', 'Direct', 0],
        ['006', 'Sales', 'Income', 'Revenue', 0],
        ['007', 'Purchase', 'Expense', 'Direct', 0],
        ['008', 'Salaries', 'Expense', 'Direct', 0]
      ];
    case 'vouchers':
      return [
        ['2024-04-01', 'JV/0001', 'Journal', 'Opening balance entry', 'Capital Account', 100000, 0],
        ['2024-04-02', 'JV/0002', 'Journal', 'Cash deposit', 'Cash in Hand', 50000, 0],
        ['2024-04-03', 'PMT/0001', 'Payment', 'Office rent', 'Rent', 0, 15000]
      ];
    case 'employees':
      return [
        ['EMP001', 'John', 'Doe', '2024-01-01', 'Finance', 'Accountant', 'ABCDE1234F', '123456789012', 'UAN123456789', 'State Bank', '12345678901', 'SBIN0001234'],
        ['EMP002', 'Jane', 'Smith', '2024-02-15', 'IT', 'Developer', 'VWXYZ1234F', '987654321098', 'UAN987654321', 'HDFC Bank', '09876543210', 'HDFC0001234']
      ];
    default:
      return [];
  }
}

// Create download template button
function createDownloadTemplateButton(templateType, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Container not found:', containerId);
    return;
  }
  
  const button = document.createElement('button');
  button.className = 'btn btn-secondary';
  button.innerHTML = '<i class="fas fa-download"></i> Download Template';
  button.onclick = () => generateExcelTemplate(templateType);
  
  container.appendChild(button);
}

// Create download template button with sample
function createDownloadTemplateWithSampleButton(templateType, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Container not found:', containerId);
    return;
  }
  
  const button = document.createElement('button');
  button.className = 'btn btn-secondary';
  button.innerHTML = '<i class="fas fa-download"></i> Download Template with Example';
  button.onclick = () => generateExcelTemplateWithSample(templateType);
  
  container.appendChild(button);
}

// Initialize template buttons on page load
function initTemplateButtons() {
  // Auto-initialize buttons with data-template attribute
  const buttons = document.querySelectorAll('[data-template]');
  buttons.forEach(btn => {
    const templateType = btn.getAttribute('data-template');
    btn.addEventListener('click', () => generateExcelTemplate(templateType));
  });
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTemplateButtons);
} else {
  initTemplateButtons();
}