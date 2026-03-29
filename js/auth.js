// ============================================
// TaxGlue Authentication
// ============================================
// Supports both online (Supabase) and offline (local JSON) modes

import { supabase, getMode, API_URL } from "./config.js";

// Store user session in localStorage
const SESSION_KEY = 'taxglue_user';
const USERS_KEY = 'taxglue_users';

// Get mode
const mode = getMode();

/**
 * Login - supports both online and offline modes
 */
export async function login(email, password) {
  if (mode === 'offline') {
    return await loginOffline(email, password);
  }
  
  // Online mode - Supabase authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });
  
  if (error) {
    alert(error.message);
    return { error };
  }
  
  // Save session
  localStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
  window.location.href = '/app/dashboard.html';
  return { data };
}

/**
 * Offline login - uses local JSON storage
 */
async function loginOffline(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.error) {
      alert(data.error);
      return { error: data.error };
    }
    
    // Save session locally
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    window.location.href = '/app/dashboard.html';
    return { data };
  } catch (err) {
    alert('Login failed: ' + err.message);
    return { error: err.message };
  }
}

/**
 * Logout
 */
export async function logout() {
  if (mode === 'online') {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore errors in offline mode
    }
  }
  
  localStorage.removeItem(SESSION_KEY);
  window.location.href = '/';
}

/**
 * Get current user
 */
export function getCurrentUser() {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Register new user (offline mode)
 */
export async function register(email, password, fullName) {
  if (mode === 'offline') {
    // In offline mode, register directly via API
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName })
    });
    
    const data = await response.json();
    return data;
  }
  
  // Online mode - Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  
  return { data, error };
}
