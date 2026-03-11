// ============================================
// TaxGlue Supabase Client
// ============================================

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Authentication Functions
// ============================================

// Sign up with email and password
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
}

// Sign in with email and password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// Get user profile
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { profile: data, error };
}

// ============================================
// TDS Module Functions
// ============================================

// Get TDS deductors
export async function getTdsDeductors(userId) {
  const { data, error } = await supabase
    .from('tds_deductors')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { deductors: data, error };
}

// Create TDS deductor
export async function createTdsDeductor(deductor) {
  const { data, error } = await supabase
    .from('tds_deductors')
    .insert(deductor)
    .select()
    .single();
  return { deductor: data, error };
}

// Update TDS deductor
export async function updateTdsDeductor(id, updates) {
  const { data, error } = await supabase
    .from('tds_deductors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { deductor: data, error };
}

// Delete TDS deductor
export async function deleteTdsDeductor(id) {
  const { error } = await supabase
    .from('tds_deductors')
    .delete()
    .eq('id', id);
  return { error };
}

// Get TDS deductees
export async function getTdsDeductees(userId, deductorId) {
  let query = supabase
    .from('tds_deductees')
    .select('*')
    .eq('user_id', userId);
  
  if (deductorId) {
    query = query.eq('deductor_id', deductorId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  return { deductees: data, error };
}

// Create TDS deductee
export async function createTdsDeductee(deductee) {
  const { data, error } = await supabase
    .from('tds_deductees')
    .insert(deductee)
    .select()
    .single();
  return { deductee: data, error };
}

// Get TDS transactions
export async function getTdsTransactions(userId, filters = {}) {
  let query = supabase
    .from('tds_transactions')
    .select('*')
    .eq('user_id', userId);
  
  if (filters.deductorId) {
    query = query.eq('deductor_id', filters.deductorId);
  }
  if (filters.fy) {
    query = query.eq('fy', filters.fy);
  }
  if (filters.quarter) {
    query = query.eq('quarter', filters.quarter);
  }
  
  const { data, error } = await query.order('payment_date', { ascending: false });
  return { transactions: data, error };
}

// Create TDS transaction
export async function createTdsTransaction(transaction) {
  const { data, error } = await supabase
    .from('tds_transactions')
    .insert(transaction)
    .select()
    .single();
  return { transaction: data, error };
}

// Get TDS section rates
export async function getTdsRates() {
  const { data, error } = await supabase
    .from('tds_section_rates')
    .select('*')
    .eq('is_active', true)
    .order('section');
  return { rates: data, error };
}

// ============================================
// GST Module Functions
// ============================================

// Get GST invoices
export async function getGstInvoices(userId, filters = {}) {
  let query = supabase
    .from('gst_invoices')
    .select('*')
    .eq('user_id', userId);
  
  if (filters.clientId) {
    query = query.eq('client_id', filters.clientId);
  }
  if (filters.fy) {
    query = query.eq('fy', filters.fy);
  }
  
  const { data, error } = await query.order('invoice_date', { ascending: false });
  return { invoices: data, error };
}

// Create GST invoice
export async function createGstInvoice(invoice) {
  const { data, error } = await supabase
    .from('gst_invoices')
    .insert(invoice)
    .select()
    .single();
  return { invoice: data, error };
}

// Get GST returns
export async function getGstReturns(userId) {
  const { data, error } = await supabase
    .from('gst_returns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { returns: data, error };
}

// Create GST return
export async function createGstReturn(gstReturn) {
  const { data, error } = await supabase
    .from('gst_returns')
    .insert(gstReturn)
    .select()
    .single();
  return { return: data, error };
}

// Get E-way bills
export async function getEWayBills(userId) {
  const { data, error } = await supabase
    .from('eway_bills')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return { ewaybills: data, error };
}

// Create E-way bill
export async function createEWayBill(ewaybill) {
  const { data, error } = await supabase
    .from('eway_bills')
    .insert(ewaybill)
    .select()
    .single();
  return { ewaybill: data, error };
}

// Get GST rates
export async function getGstRates() {
  const { data, error } = await supabase
    .from('gst_rates')
    .select('*')
    .eq('is_active', true)
    .order('rate');
  return { rates: data, error };
}

// ============================================
// Income Tax Module Functions
// ============================================

// Get ITR filings
export async function getItrFilings(userId) {
  const { data, error } = await supabase
    .from('income_tax_returns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { filings: data, error };
}

// Create ITR filing
export async function createItrFiling(itr) {
  const { data, error } = await supabase
    .from('income_tax_returns')
    .insert(itr)
    .select()
    .single();
  return { filing: data, error };
}

// Get Form 16 certificates
export async function getForm16(userId) {
  const { data, error } = await supabase
    .from('form16')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { certificates: data, error };
}

// Create Form 16
export async function createForm16(certificate) {
  const { data, error } = await supabase
    .from('form16')
    .insert(certificate)
    .select()
    .single();
  return { certificate: data, error };
}

// Get tax computations
export async function getTaxComputations(userId) {
  const { data, error } = await supabase
    .from('tax_computations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { computations: data, error };
}

// Create tax computation
export async function createTaxComputation(computation) {
  const { data, error } = await supabase
    .from('tax_computations')
    .insert(computation)
    .select()
    .single();
  return { computation: data, error };
}

// ============================================
// Clients Module Functions
// ============================================

// Get clients
export async function getClients(userId) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { clients: data, error };
}

// Create client
export async function createClient(client) {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single();
  return { client: data, error };
}

// Update client
export async function updateClient(id, updates) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { client: data, error };
}

// Delete client
export async function deleteClient(id) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  return { error };
}

// ============================================
// Documents Module Functions
// ============================================

// Upload document
export async function uploadDocument(userId, file, documentType, clientId = null) {
  const filePath = `${userId}/${documentType}/${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file);
  
  if (error) return { data: null, error };
  
  // Create document record
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      client_id: clientId,
      document_type: documentType,
      file_name: file.name,
      file_path: data.path,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();
  
  return { document: doc, error: docError };
}

// Get document URL
export async function getDocumentUrl(filePath) {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);
  return data.publicUrl;
}

// Delete document
export async function deleteDocument(id, filePath) {
  // Delete from storage
  await supabase.storage.from('documents').remove([filePath]);
  
  // Delete record
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  
  return { error };
}

// ============================================
// Bookkeeping Module Functions
// ============================================

// Get accounts
export async function getAccounts(clientId, fy) {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('client_id', clientId)
    .eq('fy', fy)
    .order('code');
  return { accounts: data, error };
}

// Create account
export async function createAccount(account) {
  const { data, error } = await supabase
    .from('accounts')
    .insert(account)
    .select()
    .single();
  return { account: data, error };
}

// Get vouchers
export async function getVouchers(clientId, fy) {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .eq('client_id', clientId)
    .eq('fy', fy)
    .order('date', { ascending: false });
  return { vouchers: data, error };
}

// Create voucher
export async function createVoucher(voucher) {
  const { data, error } = await supabase
    .from('vouchers')
    .insert(voucher)
    .select()
    .single();
  return { voucher: data, error };
}

// Get trial balance
export async function getTrialBalance(clientId, fy) {
  const { data, error } = await supabase
    .from('trial_balance')
    .select('*')
    .eq('client_id', clientId)
    .eq('fy', fy)
    .single();
  return { trialBalance: data, error };
}

// ============================================
// Payroll Module Functions
// ============================================

// Get employees
export async function getEmployees(clientId, fy) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('client_id', clientId)
    .eq('fy', fy)
    .order('employee_code');
  return { employees: data, error };
}

// Create employee
export async function createEmployee(employee) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single();
  return { employee: data, error };
}

// Get salary payments
export async function getSalaryPayments(clientId, year, month) {
  let query = supabase
    .from('salary_payments')
    .select('*, employees(*)')
    .eq('client_id', clientId);
  
  if (year) query = query.eq('year', year);
  if (month) query = query.eq('month', month);
  
  const { data, error } = await query.order('employee_id');
  return { payments: data, error };
}

// Create salary payment
export async function createSalaryPayment(payment) {
  const { data, error } = await supabase
    .from('salary_payments')
    .insert(payment)
    .select()
    .single();
  return { payment: data, error };
}

// ============================================
// Utility Functions
// ============================================

// Subscribe to realtime changes
export function subscribeToTable(table, callback, filter = {}) {
  return supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table, filter }, callback)
    .subscribe();
}

// Log audit event
export async function logAuditEvent(userId, action, tableName, recordId, oldValues, newValues) {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
    });
  return { error };
}
