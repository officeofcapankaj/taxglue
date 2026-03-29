/**
 * Excel Import Handler
 * Parses uploaded Excel files and inserts into database
 */

const XLSX = window.XLSX;

// Import Excel file and convert to JSON
async function importExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Import Clients from Excel
async function importClientsFromExcel(file) {
  try {
    const data = await importExcelFile(file);
    
    // Skip header row
    const rows = data.slice(1);
    
    const clients = [];
    for (const row of rows) {
      // Skip empty rows
      if (!row[0] && !row[1]) continue;
      
      const client = {
        name: row[0] || '',
        constitution: row[1] || '',
        address: row[2] || '',
        city: row[3] || '',
        district: row[4] || '',
        state: row[5] || '',
        pincode: row[6] || '',
        phone: row[7] || '',
        email: row[8] || '',
        gstin: row[9] || '',
        pan: row[10] || ''
      };
      
      if (client.name) {
        clients.push(client);
      }
    }
    
    return clients;
  } catch (err) {
    console.error('Error importing clients:', err);
    throw err;
  }
}

// Import Accounts from Excel
async function importAccountsFromExcel(file, clientId, fy) {
  try {
    const data = await importExcelFile(file);
    
    // Skip header row
    const rows = data.slice(1);
    
    const accounts = [];
    for (const row of rows) {
      // Skip empty rows
      if (!row[0] && !row[1]) continue;
      
      const account = {
        client_id: clientId,
        fy: fy || '2024-25',
        code: row[0] || '',
        name: row[1] || '',
        nature: row[2] || '',
        account_type: row[3] || '',
        opening_balance: parseFloat(row[4]) || 0
      };
      
      if (account.name) {
        accounts.push(account);
      }
    }
    
    return accounts;
  } catch (err) {
    console.error('Error importing accounts:', err);
    throw err;
  }
}

// Import Vouchers from Excel
async function importVouchersFromExcel(file, clientId, fy) {
  try {
    const data = await importExcelFile(file);
    
    // Skip header row
    const rows = data.slice(1);
    
    const vouchers = [];
    let voucherNo = await getNextVoucherNo(clientId, fy);
    
    for (const row of rows) {
      // Skip empty rows
      if (!row[0] && !row[1]) continue;
      
      const date = row[0];
      const accountName = row[4];
      const debit = parseFloat(row[5]) || 0;
      const credit = parseFloat(row[6]) || 0;
      
      if (!date || !accountName) continue;
      
      // Find account by name
      const account = await findAccountByName(clientId, fy, accountName);
      if (!account) {
        console.warn(`Account not found: ${accountName}`);
        continue;
      }
      
      const voucher = {
        client_id: clientId,
        fy: fy || '2024-25',
        date: date,
        voucher_no: voucherNo,
        voucher_type: row[2] || 'journal',
        narration: row[3] || '',
        lines: [{
          account_id: account.id,
          debit: debit,
          credit: credit
        }]
      };
      
      vouchers.push(voucher);
      voucherNo++;
    }
    
    return vouchers;
  } catch (err) {
    console.error('Error importing vouchers:', err);
    throw err;
  }
}

// Import Employees from Excel
async function importEmployeesFromExcel(file, clientId, fy) {
  try {
    const data = await importExcelFile(file);
    
    // Skip header row
    const rows = data.slice(1);
    
    const employees = [];
    for (const row of rows) {
      // Skip empty rows
      if (!row[0] && !row[1]) continue;
      
      const employee = {
        client_id: clientId,
        fy: fy || '2024-25',
        employee_code: row[0] || '',
        first_name: row[1] || '',
        last_name: row[2] || '',
        date_of_joining: row[3] || '',
        department: row[4] || '',
        designation: row[5] || '',
        pan_number: row[6] || '',
        aadhaar_number: row[7] || '',
        uan_number: row[8] || '',
        bank_name: row[9] || '',
        bank_account_no: row[10] || '',
        bank_ifsc_code: row[11] || ''
      };
      
      if (employee.employee_code && employee.first_name) {
        employees.push(employee);
      }
    }
    
    return employees;
  } catch (err) {
    console.error('Error importing employees:', err);
    throw err;
  }
}

// Upload imported data to server
async function uploadImportedData(dataType, data) {
  const token = localStorage.getItem('token');
  
  let endpoint = '';
  switch (dataType) {
    case 'clients':
      endpoint = '/api/clients';
      break;
    case 'accounts':
      endpoint = '/api/accounts/bulk';
      break;
    case 'vouchers':
      endpoint = '/api/vouchers/bulk';
      break;
    case 'employees':
      endpoint = '/api/employees/bulk';
      break;
    default:
      throw new Error('Unknown data type');
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload data');
  }
  
  return response.json();
}

// Helper: Get next voucher number
async function getNextVoucherNo(clientId, fy) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/vouchers/next-no?clientId=${clientId}&fy=${fy}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.voucherNo;
}

// Helper: Find account by name
async function findAccountByName(clientId, fy, name) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/accounts/by-name?clientId=${clientId}&fy=${fy}&name=${encodeURIComponent(name)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const accounts = await response.json();
  return accounts.length > 0 ? accounts[0] : null;
}

// Create file input for Excel import
function createExcelImportButton(dataType, callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.style.display = 'none';
  
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      let data;
      const clientId = localStorage.getItem('currentClientId');
      const fy = localStorage.getItem('currentFy') || '2024-25';
      
      switch (dataType) {
        case 'clients':
          data = await importClientsFromExcel(file);
          break;
        case 'accounts':
          data = await importAccountsFromExcel(file, clientId, fy);
          break;
        case 'vouchers':
          data = await importVouchersFromExcel(file, clientId, fy);
          break;
        case 'employees':
          data = await importEmployeesFromExcel(file, clientId, fy);
          break;
        default:
          throw new Error('Unknown data type');
      }
      
      callback(data);
    } catch (err) {
      alert('Error importing file: ' + err.message);
    }
  });
  
  document.body.appendChild(input);
  input.click();
  input.remove();
}