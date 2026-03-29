// ============================================
// TaxGlue Supabase API Client
// Direct Supabase calls - no backend server needed
// ============================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://jgjeuybgideeqcjxvlmn.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnamV1eWJnaWRlZXFjanh2bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjIxNDAsImV4cCI6MjA4ODY5ODE0MH0.etglAIrYa5r67QuS7qKMR-lYodu_jxeJaozwKESuiD0"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// TDS APIs
export const tdsAPI = {
  // Deductors
  async getDeductors(clientId, fy) {
    let query = supabase.from('tds_deductors').select('*').order('name')
    if (clientId) query = query.eq('client_id', clientId)
    if (fy) query = query.eq('fy', fy)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async createDeductor(deductor) {
    const { data, error } = await supabase.from('tds_deductors').insert(deductor).select()
    if (error) throw error
    return data[0]
  },

  async updateDeductor(id, deductor) {
    const { data, error } = await supabase.from('tds_deductors').update(deductor).eq('id', id).select()
    if (error) throw error
    return data[0]
  },

  async deleteDeductor(id) {
    const { error } = await supabase.from('tds_deductors').delete().eq('id', id)
    if (error) throw error
    return true
  },

  // Deductees
  async getDeductees(clientId, fy) {
    let query = supabase.from('tds_deductees').select('*').order('name')
    if (clientId) query = query.eq('client_id', clientId)
    if (fy) query = query.eq('fy', fy)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async createDeductee(deductee) {
    const { data, error } = await supabase.from('tds_deductees').insert(deductee).select()
    if (error) throw error
    return data[0]
  },

  async updateDeductee(id, deductee) {
    const { data, error } = await supabase.from('tds_deductees').update(deductee).eq('id', id).select()
    if (error) throw error
    return data[0]
  },

  async deleteDeductee(id) {
    const { error } = await supabase.from('tds_deductees').delete().eq('id', id)
    if (error) throw error
    return true
  },

  // Transactions
  async getTransactions(clientId, fy, quarter) {
    let query = supabase.from('tds_transactions').select('*').order('payment_date', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    if (fy) query = query.eq('fy', fy)
    if (quarter) query = query.eq('quarter', quarter)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async createTransaction(transaction) {
    const { data, error } = await supabase.from('tds_transactions').insert(transaction).select()
    if (error) throw error
    return data[0]
  },

  async deleteTransaction(id) {
    const { error } = await supabase.from('tds_transactions').delete().eq('id', id)
    if (error) throw error
    return true
  },

  // Challans
  async getChallans(clientId, fy) {
    let query = supabase.from('tds_challans').select('*').order('challan_date', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    if (fy) query = query.eq('fy', fy)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async createChallan(challan) {
    const { data, error } = await supabase.from('tds_challans').insert(challan).select()
    if (error) throw error
    return data[0]
  },

  // Returns
  async getReturns(clientId, fy) {
    let query = supabase.from('tds_returns').select('*').order('quarter', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    if (fy) query = query.eq('fy', fy)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async createReturn(returns) {
    const { data, error } = await supabase.from('tds_returns').insert(returns).select()
    if (error) throw error
    return data[0]
  },

  async updateReturn(id, returns) {
    const { data, error } = await supabase.from('tds_returns').update(returns).eq('id', id).select()
    if (error) throw error
    return data[0]
  },

  // Rates
  async getRates() {
    const { data, error } = await supabase.from('tds_section_rates').select('*').order('section')
    if (error) throw error
    return data
  },

  // Summary
  async getSummary(clientId, fy, quarter) {
    let transactionsQuery = supabase.from('tds_transactions').select('amount,tds_amount,status')
    if (clientId) transactionsQuery = transactionsQuery.eq('client_id', clientId)
    if (fy) transactionsQuery = transactionsQuery.eq('fy', fy)
    if (quarter) transactionsQuery = transactionsQuery.eq('quarter', quarter)
    
    const { data: transactions } = await transactionsQuery
    
    let challansQuery = supabase.from('tds_challans').select('total_amount')
    if (clientId) challansQuery = challansQuery.eq('client_id', clientId)
    if (fy) challansQuery = challansQuery.eq('fy', fy)
    
    const { data: challans } = await challansQuery
    
    const totalDeduction = (transactions || []).reduce((sum, t) => sum + (t.tds_amount || 0), 0)
    const totalDeposited = (challans || []).reduce((sum, c) => sum + (c.total_amount || 0), 0)
    
    return {
      total_deduction: totalDeduction,
      total_deposited: totalDeposited,
      balance_due: totalDeduction - totalDeposited,
      total_transactions: (transactions || []).length
    }
  }
}

// Clients API
export const clientsAPI = {
  async getAll() {
    const { data, error } = await supabase.from('clients').select('*').order('name')
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id)
    if (error) throw error
    return data[0]
  },

  async create(client) {
    const { data, error } = await supabase.from('clients').insert(client).select()
    if (error) throw error
    return data[0]
  },

  async update(id, client) {
    const { data, error } = await supabase.from('clients').update(client).eq('id', id).select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) throw error
    return true
  }
}

// GST API
export const gstAPI = {
  async getInvoices(clientId, fy, quarter) {
    let query = supabase.from('gst_invoices').select('*').order('invoice_date', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    if (fy) query = query.eq('fy', fy)
    if (quarter) query = query.eq('quarter', quarter)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async createInvoice(invoice) {
    const { data, error } = await supabase.from('gst_invoices').insert(invoice).select()
    if (error) throw error
    return data[0]
  },

  async deleteInvoice(id) {
    const { error } = await supabase.from('gst_invoices').delete().eq('id', id)
    if (error) throw error
    return true
  },

  async getReturns(clientId, fy) {
    let query = supabase.from('gst_returns').select('*').order('period', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    if (fy) query = query.eq('fy', fy)
    const { data, error } = await query
    if (error) throw error
    return data
  }
}

// Auth API
export const authAPI = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// GST API
export const gstAPI = {
  async getInvoices(clientId, fy, quarter) {
    let query = supabase.from('gst_invoices').select('*').order('invoice_date', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    if (fy) query = query.eq('fy', fy)
    if (quarter) query = query.eq('quarter', quarter)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async createInvoice(invoice) {
    const { data, error } = await supabase.from('gst_invoices').insert(invoice).select()
    if (error) throw error
    return data[0]
  },

  async updateInvoice(id, invoice) {
    const { data, error } = await supabase.from('gst_invoices').update(invoice).eq('id', id).select()
    if (error) throw error
    return data[0]
  },

  async deleteInvoice(id) {
    const { error } = await supabase.from('gst_invoices').delete().eq('id', id)
    if (error) throw error
    return true
  },

  async getReturns(clientId, fy) {
    let query = supabase.from('gst_returns').select('*').order('period', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    if (fy) query = query.eq('fy', fy)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async createReturn(gstReturn) {
    const { data, error } = await supabase.from('gst_returns').insert(gstReturn).select()
    if (error) throw error
    return data[0]
  },

  async updateReturn(id, gstReturn) {
    const { data, error } = await supabase.from('gst_returns').update(gstReturn).eq('id', id).select()
    if (error) throw error
    return data[0]
  },

  async getEwaybills(clientId, fy) {
    let query = supabase.from('gst_ewaybills').select('*').order('date', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    if (fy) query = query.eq('fy', fy)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getRates() {
    const { data, error } = await supabase.from('gst_rates').select('*').order('rate')
    if (error) throw error
    return data
  },

  async getSummary(clientId, fy, quarter) {
    let invoicesQuery = supabase.from('gst_invoices').select('invoice_value,cgst,sgst,igst,cess')
    if (clientId) invoicesQuery = invoicesQuery.eq('client_id', clientId)
    if (fy) invoicesQuery = invoicesQuery.eq('fy', fy)
    if (quarter) invoicesQuery = invoicesQuery.eq('quarter', quarter)
    
    const { data: invoices } = await invoicesQuery
    
    const totalSales = (invoices || []).reduce((sum, i) => sum + (i.invoice_value || 0), 0)
    const totalCGST = (invoices || []).reduce((sum, i) => sum + (i.cgst || 0), 0)
    const totalSGST = (invoices || []).reduce((sum, i) => sum + (i.sgst || 0), 0)
    const totalIGST = (invoices || []).reduce((sum, i) => sum + (i.igst || 0), 0)
    
    return {
      total_sales: totalSales,
      total_cgst: totalCGST,
      total_sgst: totalSGST,
      total_igst: totalIGST,
      total_tax: totalCGST + totalSGST + totalIGST,
      invoice_count: (invoices || []).length
    }
  }
}

export default supabase