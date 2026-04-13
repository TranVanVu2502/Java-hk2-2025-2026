import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';


// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Guest (Các trang công khai đã hoàn thiện)
import ProductsPage from './pages/guest/ProductsPage';
import ProductDetailPage from './pages/guest/ProductDetailPage';
import QRLookupPage from './pages/guest/QRLookupPage';

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

          <Route path="*" element={<Navigate to="/products" replace />} />

          <Route path="/unauthorized" element={
            <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'Inter, sans-serif' }}>
              <h1 style={{ fontSize: 48 }}>🚧</h1>
              <h2>Tính năng đang được phát triển</h2>
              <p>Vui lòng quay lại sau.</p>
              <a href="/" style={{ color: '#10b981', fontWeight: 'bold' }}>Quay lại cửa hàng</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}