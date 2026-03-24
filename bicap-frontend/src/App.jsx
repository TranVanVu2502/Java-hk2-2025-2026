import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/guest/ProductsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/" element={<Navigate to="/products" replace />} />

          {/* ── Private Routes (Cấu trúc mẫu) ── */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<div>Admin Dashboard</div>} />
                    {/* Thêm các route admin khác ở đây */}
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* ── Error Routes ── */}
          <Route path="/unauthorized" element={<h2>Không có quyền truy cập</h2>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}