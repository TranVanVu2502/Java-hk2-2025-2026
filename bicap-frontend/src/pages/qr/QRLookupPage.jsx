import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { qrService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Leaf, QrCode, Search, CheckCircle, XCircle, Hash, MapPin, Calendar, Package, LogOut } from 'lucide-react';

export default function QRLookupPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(paramCode || searchParams.get('code') || '');
  const [inputCode, setInputCode] = useState(paramCode || searchParams.get('code') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const isRetailer = user?.role === 'RETAILER';

  // Auto-search if code in URL
  useEffect(() => {
    if (paramCode) {
      setCode(paramCode);
      setInputCode(paramCode);
      doSearch(paramCode);
    }
  }, [paramCode]);

  const doSearch = async (c) => {
    if (!c?.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await qrService.lookup(c.trim());
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCode(inputCode);
    doSearch(inputCode);
  };

  const handleLogout = () => {
    logout();
    navigate('/products');
  };

  return (
    <div className="public-page">
      <header className="public-header">
        <div className="container">
          <div className="public-header-inner">
            <Link to="/" className="auth-logo" style={{ textDecoration: 'none' }}>
              <div className="logo-icon logo-sm"><Leaf size={18} /></div>
              <span className="logo-text">BICAP</span>
            </Link>
            <nav className="guest-nav">
              <Link to="/products" className="guest-nav-link">Sản phẩm</Link>
              <Link to="/qr" className="guest-nav-link active">Tra cứu QR</Link>
              {isRetailer ? (
                <div className="header-actions-group">
                  <Link to="/order" className="header-action-btn">Giỏ hàng</Link>
                  <Link to="/retailer/orders" className="header-action-btn">Xem lịch sử đơn hàng</Link>
                  <button onClick={handleLogout} className="header-action-btn">
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-outline-sm">Đăng nhập</Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="qr-hero">
        <div className="container">
          <div className="hero-badge">🔍 Truy xuất nguồn gốc minh bạch</div>
          <h1 className="hero-title">
            Tra cứu nguồn gốc<br />
            <span className="gradient-text">sản phẩm nông nghiệp</span>
          </h1>
          <p className="hero-desc">
            Nhập mã QR trên sản phẩm để xem toàn bộ thông tin trang trại, mùa vụ, quy trình canh tác và blockchain hash
          </p>
          <form className="qr-search-form" onSubmit={handleSubmit}>
            <div className="qr-input-group">
              <QrCode size={20} className="qr-input-icon" />
              <input
                id="qr-code-input"
                type="text"
                placeholder="Nhập mã QR code..."
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                className="qr-input"
              />
              <button type="submit" className="qr-search-btn" disabled={loading}>
                {loading ? <span className="spinner white"></span> : <><Search size={18} /> Tra cứu</>}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Result */}
      {searched && (
        <section className="qr-result-section">
          <div className="container">
            {loading ? (
              <div className="loading-state"><div className="loading-spinner-lg"></div><p>Đang tra cứu...</p></div>
            ) : data ? (
              <div className="qr-result-card">
                <div className="result-header">
                  <div className="result-verified"><CheckCircle size={20} /><span>Sản phẩm đã xác thực trên hệ thống BICAP</span></div>
                </div>
                <div className="result-grid">
                  <div className="result-section-block">
                    <h3><Package size={16} /> Thông tin sản phẩm</h3>
                    <div className="info-list">
                      <div className="info-item"><span className="info-label">Tên sản phẩm</span><span className="info-value">{data.productName}</span></div>
                      <div className="info-item"><span className="info-label">Số lượng</span><span className="info-value">{data.quantity} kg</span></div>
                      <div className="info-item"><span className="info-label">Trạng thái</span>
                        <span className={`badge ${data.productStatus === 'AVAILABLE' ? 'badge-green' : 'badge-gray'}`}>{data.productStatus}</span>
                      </div>
                    </div>
                  </div>
                  <div className="result-section-block">
                    <h3><MapPin size={16} /> Trang trại</h3>
                    <div className="info-list">
                      <div className="info-item"><span className="info-label">Tên trang trại</span><span className="info-value">{data.farmName}</span></div>
                      <div className="info-item"><span className="info-label">Địa chỉ</span><span className="info-value">{data.farmAddress}</span></div>
                      <div className="info-item"><span className="info-label">Chủ trang trại</span><span className="info-value">{data.ownerName}</span></div>
                    </div>
                  </div>
                  <div className="result-section-block">
                    <h3><Calendar size={16} /> Mùa vụ</h3>
                    <div className="info-list">
                      <div className="info-item"><span className="info-label">Tên mùa vụ</span><span className="info-value">{data.seasonName}</span></div>
                      <div className="info-item"><span className="info-label">Bắt đầu</span><span className="info-value">{data.seasonStart || '—'}</span></div>
                      <div className="info-item"><span className="info-label">Kết thúc</span><span className="info-value">{data.seasonEnd || '—'}</span></div>
                    </div>
                  </div>
                  {data.blockchainHash && (
                    <div className="result-section-block result-blockchain">
                      <h3><Hash size={16} /> Blockchain Hash</h3>
                      <p className="blockchain-hash">{data.blockchainHash}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-result">
                <XCircle size={48} className="empty-icon" />
                <h3>Không tìm thấy thông tin</h3>
                <p>Mã QR không hợp lệ hoặc sản phẩm chưa được đăng ký</p>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="public-footer">
        <div className="container"><p>© 2025 BICAP — Blockchain Integration in Clean Agricultural Production</p></div>
      </footer>
    </div>
  );
}
