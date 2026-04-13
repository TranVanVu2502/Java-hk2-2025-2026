import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Leaf, QrCode, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { token, email: resEmail, role } = res.data;
      login({ email: resEmail, role }, token);
      toast.success('Đăng nhập thành công!');
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'FARM_MANAGER') navigate('/farm/dashboard');
      else if (role === 'RETAILER') navigate('/products');
      else navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <Link to="/products" className="auth-logo" style={{ marginBottom: 28, display: 'inline-flex' }}>
          <div className="logo-icon">
            <Leaf size={20} />
          </div>
          <span className="logo-text">BICAP</span>
        </Link>

        {/* Header */}
        <div className="auth-card-header">
          <h1 className="auth-title">Chào mừng trở lại 👋</h1>
          <p className="auth-subtitle">Đăng nhập vào hệ thống truy xuất nguồn gốc</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <span className="input-icon"><Mail size={16} /></span>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-with-icon">
              <span className="input-icon"><Lock size={16} /></span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <span className="input-btn-right">
                <button type="button" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </div>
          </div>

          <button id="login-btn" type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? <><span className="spinner white" /> Đang đăng nhập...</>
              : <><ArrowRight size={18} /> Đăng nhập</>
            }
          </button>

          <div className="auth-divider">hoặc</div>

          <Link to="/products" className="auth-public-btn">
            <QrCode size={16} />
            Xem sản phẩm mà không cần đăng nhập
          </Link>

          <p className="auth-link-row">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
