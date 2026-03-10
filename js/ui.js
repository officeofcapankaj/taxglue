/**
 * ui.js – Toast notifications, modal, and view navigation
 */

/* ============================================================
   VIEW NAVIGATION
============================================================ */
const VIEWS = ['viewLanding', 'viewSetup', 'viewTrialBalance', 'viewBalanceSheet', 'viewMySheets'];

function showView(viewId) {
  VIEWS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ============================================================
   TOAST NOTIFICATIONS
============================================================ */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ============================================================
   MODAL – Confirm / Alert
============================================================ */
let _modalConfirmCallback = null;

function showConfirmModal(title, message, onConfirm) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMsg').textContent = message;
  _modalConfirmCallback = onConfirm;
  document.getElementById('modalConfirm').style.display = 'flex';
}

document.getElementById('btnModalCancel').addEventListener('click', () => {
  document.getElementById('modalConfirm').style.display = 'none';
  _modalConfirmCallback = null;
});

document.getElementById('btnModalConfirm').addEventListener('click', () => {
  document.getElementById('modalConfirm').style.display = 'none';
  if (_modalConfirmCallback) _modalConfirmCallback();
  _modalConfirmCallback = null;
});

// Close on overlay click
document.getElementById('modalConfirm').addEventListener('click', function (e) {
  if (e.target === this) {
    this.style.display = 'none';
    _modalConfirmCallback = null;
  }
});
