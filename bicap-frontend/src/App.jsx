import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import { OrderProvider } from './context/OrderContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Product & QR
import ProductsPage from './pages/product/ProductsPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import QRLookupPage from './pages/qr/QRLookupPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFarms from './pages/admin/AdminFarms';
import AdminUsers from './pages/admin/AdminUsers';

// Farm Manager
import FarmDashboard from './pages/farm/FarmDashboard';
import FarmSeasons from './pages/farm/FarmSeasons';
import FarmSeasonDetail from './pages/farm/FarmSeasonDetail';
import FarmOrders from './pages/farm/FarmOrders';
import FarmOrderDetail from './pages/farm/FarmOrderDetail';

// Retailer
import RetailerOrderNew from './pages/retailer/RetailerOrderNew';
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import RetailerOrderDetail from './pages/retailer/RetailerOrderDetail';

/* ── Layout wrappers ── */
function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function FarmLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['FARM_MANAGER']}>
      <FarmProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </FarmProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
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

            {/* ── Farm Manager ── */}
            <Route path="/farm" element={<Navigate to="/farm/dashboard" replace />} />
            <Route path="/farm/dashboard" element={<FarmLayout><FarmDashboard /></FarmLayout>} />
            <Route path="/farm/seasons" element={<FarmLayout><FarmSeasons /></FarmLayout>} />
            <Route path="/farm/seasons/:id" element={<FarmLayout><FarmSeasonDetail /></FarmLayout>} />
            <Route path="/farm/orders" element={<FarmLayout><FarmOrders /></FarmLayout>} />
            <Route path="/farm/orders/:id" element={<FarmLayout><FarmOrderDetail /></FarmLayout>} />

            {/* ── Product & QR ── */}
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/qr" element={<QRLookupPage />} />
            <Route path="/qr/:code" element={<QRLookupPage />} />

            {/* ── Retailer ── */}
            <Route path="/retailer" element={<Navigate to="/retailer/orders" replace />} />
            <Route path="/retailer/orders" element={<ProtectedRoute allowedRoles={['RETAILER']}><RetailerDashboard /></ProtectedRoute>} />
            <Route path="/retailer/orders/:id" element={<ProtectedRoute allowedRoles={['RETAILER']}><RetailerOrderDetail /></ProtectedRoute>} />
            <Route path="/order" element={<ProtectedRoute allowedRoles={['RETAILER']}><RetailerOrderNew /></ProtectedRoute>} />
            <Route path="/retailer/*" element={<Navigate to="/retailer/orders" replace />} />

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
      </OrderProvider>
    </AuthProvider>
  );
}