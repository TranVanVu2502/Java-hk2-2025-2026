import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';

const ROLES = [
  { value: 'FARM_MANAGER', label: 'Chủ trang trại', icon: '🌾', desc: 'Quản lý farm, mùa vụ, sản phẩm' },
  { value: 'RETAILER', label: 'Nhà bán lẻ', icon: '🏪', desc: 'Đặt hàng, theo dõi nguồn gốc' },
];

export default function RegisterPage() {
  const [role, setRole] = useState('FARM_MANAGER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Mật khẩu ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      const res = await authService.register({ email, password, role });
      const { token, email: resEmail, role: resRole } = res.data;
      login({ email: resEmail, role: resRole }, token);
      toast.success('Đăng ký thành công!');
      if (resRole === 'FARM_MANAGER') navigate('/farm/dashboard');
      else navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        {/* Logo */}
        <Link to="/products" className="auth-logo" style={{ marginBottom: 28, display: 'inline-flex' }}>
          <div className="logo-icon">
            <Leaf size={20} />
          </div>
          <span className="logo-text">BICAP</span>
        </Link>

        {/* Header */}
        <div className="auth-card-header">
          <h1 className="auth-title">Tạo tài khoản mới</h1>
          <p className="auth-subtitle">Tham gia hệ thống truy xuất nguồn gốc nông sản</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Role Selector */}
          <div className="form-group">
            <label>Chọn vai trò</label>
            <div className="role-selector">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  id={`role-${r.value.toLowerCase()}`}
                  className={`role-option ${role === r.value ? 'selected' : ''}`}
                  onClick={() => setRole(r.value)}
                >
                  <span className="role-option-icon">{r.icon}</span>
                  <span className="role-option-label">{r.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 400 }}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <span className="input-icon"><Mail size={16} /></span>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-with-icon">
              <span className="input-icon"><Lock size={16} /></span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                required
                minLength={6}
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

          <button id="register-btn" type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? <><span className="spinner white" /> Đang tạo tài khoản...</>
              : <><ArrowRight size={18} /> Đăng ký</>
            }
          </button>

          <p className="auth-link-row">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
