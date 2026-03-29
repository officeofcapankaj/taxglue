// ============================================
// TaxGlue Shared Sidebar Component
// Reusable navigation sidebar
// ============================================

export const sidebarConfig = {
  // Define the navigation items
  navItems: [
    { icon: '🏠', label: 'Dashboard', href: '/app/dashboard.html', active: false },
    { icon: '👥', label: 'Clients', href: '/app/clients.html', active: false },
    { icon: '🎓', label: 'CA Master', href: '/app/ca-master.html', active: false },
    { icon: '📒', label: 'Book-Keeping', href: '/modules/bookkeeping.html', active: false },
    { icon: '📊', label: 'Trial Balance', href: '/modules/trial-balance.html', active: false },
    { icon: '⚖️', label: 'Financial Statements', href: '/modules/financial-statements.html', active: false },
    { icon: '💼', label: 'GST Returns', href: '/app/gst.html', active: false },
    { icon: '💰', label: 'TDS Management', href: '/app/tds.html', active: false },
    { icon: '📋', label: 'Tax Calendar', href: '#', active: false },
    { icon: '📁', label: 'Documents', href: '#', active: false },
    { icon: '👥', label: 'Payroll', href: '/modules/payroll.html', active: false },
    { icon: '🔄', label: 'Updates', href: '/modules/updates.html', active: false },
    { icon: '⚙️', label: 'Settings', href: '#', active: false }
  ],
  
  // Get active page from URL
  getActivePage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'dashboard.html';
  },
  
  // Check if item is active
  isActive(item, currentPage) {
    const itemPage = item.href.split('/').pop();
    return itemPage === currentPage;
  },
  
  // Generate HTML for nav items
  renderNavItems(currentPage) {
    return this.navItems.map(item => {
      const activeClass = this.isActive(item, currentPage) ? 'active' : '';
      return `
        <a href="${item.href}" class="${activeClass}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `;
    }).join('');
  }
};

// Initialize sidebar
export function initSidebar(options = {}) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) {
    console.warn('Sidebar element not found');
    return;
  }
  
  const currentPage = options.activePage || sidebarConfig.getActivePage();
  const userName = options.userName || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  
  // Set active state
  sidebarConfig.navItems.forEach(item => {
    item.active = sidebarConfig.isActive(item, currentPage);
  });
  
  // Render sidebar HTML
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">📊</span>
        <span class="logo-text">TaxGlue</span>
      </div>
    </div>
    <div class="sidebar-nav">
      ${sidebarConfig.renderNavItems(currentPage)}
    </div>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">${userInitial}</div>
        <div class="user-details">
          <span class="user-name">${userName}</span>
          <span class="user-role">Admin</span>
        </div>
      </div>
      <a href="/app/login.html" class="logout-btn">Logout</a>
    </div>
  `;
  
  return sidebar;
}

// Export default
export default { initSidebar, config: sidebarConfig };