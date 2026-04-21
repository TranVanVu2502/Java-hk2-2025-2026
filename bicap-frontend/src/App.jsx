import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Guest (public)
import ProductsPage from './pages/guest/ProductsPage';
import ProductDetailPage from './pages/guest/ProductDetailPage';
import QRLookupPage from './pages/guest/QRLookupPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFarms from './pages/admin/AdminFarms';
import AdminUsers from './pages/admin/AdminUsers';

/* ── Layout wrappers ── */
function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '12px', fontFamily: "'Inter', sans-serif", fontSize: '14px' },
          }}
        />
        <Routes>
          {/* ── Auth ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />


          {/* ── Admin ── */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/farms" element={<AdminLayout><AdminFarms /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />

          {/* ── Fallback ── */}
          <Route path="/unauthorized" element={
            <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'Inter, sans-serif' }}>
              <h1 style={{ fontSize: 48 }}>🚫</h1>
              <h2>Không có quyền truy cập</h2>
              <a href="/" style={{ color: '#10b981' }}>Về trang chủ</a>
            </div>
          } />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
