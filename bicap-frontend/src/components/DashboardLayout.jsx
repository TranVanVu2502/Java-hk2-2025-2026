import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, LogOut,
  ShoppingCart, Package, Plus, ChevronLeft, ChevronRight,
  Leaf, BarChart3, QrCode, Menu
} from 'lucide-react';

/* ── Navigation definition ── */
const NAV = {
  ADMIN: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/farms', label: 'Duyệt Farm', icon: Building2 },
    { path: '/admin/users', label: 'Quản lý User', icon: Users },
  ],
  FARM_MANAGER: [
    { path: '/farm/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/farm/seasons', label: 'Mùa vụ', icon: BarChart3 },
    { path: '/farm/orders', label: 'Đơn hàng', icon: ShoppingCart }
  ],
  RETAILER: [
    { path: '/order', label: 'Giỏ hàng', icon: Package },
    { path: '/retailer/orders', label: 'Lịch sử đơn hàng', icon: ShoppingCart },
  ],
};

const ROLE_LABELS = {
  ADMIN: { name: 'Quản trị viên', color: '#e0e7ff', text: '#4338ca' },
  FARM_MANAGER: { name: 'Chủ trang trại', color: '#d1fae5', text: '#047857' },
  RETAILER: { name: 'Nhà bán lẻ', color: '#fef3c7', text: '#b45309' },
};

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/farms': 'Duyệt Farm',
  '/admin/users': 'Quản lý User',
  '/farm/dashboard': 'Dashboard trang trại',
  '/farm/seasons': 'Mùa vụ',
  '/farm/orders': 'Đơn hàng Farm',
  '/order': 'Giỏ hàng',
  '/retailer/orders': 'Lịch sử đơn hàng',
};

/* ── Avatar initials ── */
function getInitials(email = '') {
  return email.split('@')[0].slice(0, 2).toUpperCase() || 'U';
}

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = NAV[user?.role] || [];
  const roleLabel = ROLE_LABELS[user?.role] || ROLE_LABELS.ADMIN;

  const isActive = (path) => {
    if (path === location.pathname) return true;
    if (path !== '/farm/dashboard' && path !== '/admin/dashboard' && path !== '/retailer/products') {
      return location.pathname.startsWith(path);
    }
    return false;
  };

  const pageTitle = Object.entries(PAGE_TITLES).find(([k]) => location.pathname.startsWith(k))?.[1] || 'BICAP';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-root">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <Leaf size={18} />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-name">BICAP</span>
              <span className="sidebar-logo-sub">AgriChain Platform</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {!collapsed && (
            <div className="sidebar-section-title">Điều hướng</div>
          )}
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              id={`nav-${path.replace(/\//g, '-').slice(1)}`}
              className={`sidebar-link ${isActive(path) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
            >
              <span className="sidebar-link-icon">
                <Icon size={17} />
              </span>
              {!collapsed && <span className="sidebar-link-label">{label}</span>}
            </Link>
          ))}

        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card" title={user?.email}>
            <div className="sidebar-avatar">{getInitials(user?.email)}</div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-email">{user?.email}</div>
                <div className="sidebar-user-role">{roleLabel.name}</div>
              </div>
            )}
            {!collapsed && (
              <button
                id="logout-btn"
                className="sidebar-logout-btn"
                onClick={handleLogout}
                title="Đăng xuất"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              className="sidebar-logout-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>


      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
            zIndex: 49, backdropFilter: 'blur(2px)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Mobile menu btn */}
            <button
              className="btn-icon"
              style={{ display: 'none' }}
              id="mobile-menu-btn"
              onClick={() => setMobileOpen(o => !o)}
            >
              <Menu size={18} />
            </button>
            <div className="topbar-breadcrumb">
              <span>BICAP</span>
              <span style={{ color: '#d1d5db' }}>/</span>
              <span className="topbar-breadcrumb-current">{pageTitle}</span>
            </div>
          </div>
          <div className="topbar-right">
            <div
              className="topbar-badge"
              style={{ background: roleLabel.color + '80', borderColor: roleLabel.color, color: roleLabel.text }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: roleLabel.text, flexShrink: 0 }} />
              {roleLabel.name}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}