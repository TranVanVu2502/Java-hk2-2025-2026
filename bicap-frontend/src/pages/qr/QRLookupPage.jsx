import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PublicHeader from '../../components/PublicHeader';
import { qrService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Search, CheckCircle, XCircle, Hash, MapPin, Calendar, Package, ShieldCheck, ExternalLink, Globe } from 'lucide-react';

export default function QRLookupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const [inputCode, setInputCode] = useState(paramCode || searchParams.get('code') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (paramCode) {
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
    doSearch(inputCode);
  };

  return (
    <div className="public-page">
      <PublicHeader />

      <section className="qr-hero">
        <div className="container">
          <div className="hero-badge">🛡️ Blockchain-Powered Provenance</div>
          <h1 className="hero-title">
            Truy xuất nguồn gốc<br />
            <span className="gradient-text">Minh bạch & Tin cậy</span>
          </h1>
          <p className="hero-desc">
            Sử dụng công nghệ Blockchain VeChain để đảm bảo thông tin sản phẩm từ nông trại đến tay người tiêu dùng là duy nhất và không thể làm giả.
          </p>
          <form className="qr-search-form" onSubmit={handleSubmit}>
            <div className="qr-input-group">
              <QrCode size={20} className="qr-input-icon" />
              <input
                type="text"
                placeholder="Nhập mã QR code trên bao bì..."
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

      {searched && (
        <section className="qr-result-section">
          <div className="container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner-lg"></div>
                <p>Đang kết nối với mạng lưới Blockchain...</p>
              </div>
            ) : data ? (
              <div className="qr-result-container">
                
                {/* 1. BLOCKCHAIN CERTIFICATE (Phần quan trọng nhất) */}
                <div className="blockchain-cert-card" style={{ 
                  background: 'linear-gradient(135deg, #064e3b, #065f46)', 
                  color: 'white', 
                  borderRadius: '24px', 
                  padding: '32px', 
                  marginBottom: '32px',
                  boxShadow: '0 20px 40px rgba(6, 78, 59, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative Elements */}
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}><ShieldCheck size={200} /></div>
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: '12px' }}>
                        <ShieldCheck size={28} color="#34d399" />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>CHỨNG NHẬN BLOCKCHAIN THẬT</h2>
                        <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Xác thực bởi mạng lưới VeChain Thor Blockchain</p>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 24, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, display: 'block', marginBottom: 4 }}>Mã Hash giao dịch (Immutable ID)</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Hash size={14} color="#34d399" />
                          <code style={{ fontSize: 14, wordBreak: 'break-all', fontFamily: 'monospace', color: '#a7f3d0' }}>{data.blockchainHash}</code>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
                        <div>
                          <span style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.7, display: 'block' }}>Mạng lưới</span>
                          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={14} /> VeChain Mainnet/Testnet</span>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.7, display: 'block' }}>Tính toàn vẹn</span>
                          <span style={{ fontWeight: 600, color: '#34d399' }}>✓ Đã niêm phong</span>
                        </div>
                      </div>
                    </div>

                    <a 
                      href={data.blockchainExplorer} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="verify-explorer-btn"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        marginTop: 24, 
                        background: '#34d399', 
                        color: '#064e3b', 
                        padding: '12px 24px', 
                        borderRadius: '12px', 
                        fontWeight: 700, 
                        fontSize: 14,
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <ExternalLink size={16} /> Kiểm tra thực tế trên VeChain Explorer
                    </a>
                  </div>
                </div>

                <div className="qr-result-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                  {/* Product Info */}
                  <div className="qr-card">
                    <div className="qr-card-header"><Package size={20} /> <h3>Thông tin sản phẩm</h3></div>
                    <div className="qr-card-body">
                      <div className="qr-info-row"><span className="label">Tên sản phẩm:</span><span className="value">{data.productName}</span></div>
                      <div className="qr-info-row"><span className="label">Khối lượng:</span><span className="value">{data.quantity} kg</span></div>
                      <div className="qr-info-row"><span className="label">Giá niêm yết:</span><span className="value">{data.price?.toLocaleString()} đ</span></div>
                      <div className="qr-info-row">
                        <span className="label">Trạng thái:</span>
                        <span className="badge badge-green">✓ Sẵn sàng bán</span>
                      </div>
                    </div>
                  </div>

                  {/* Farm Info */}
                  <div className="qr-card">
                    <div className="qr-card-header"><MapPin size={20} /> <h3>Trang trại sản xuất</h3></div>
                    <div className="qr-card-body">
                      <div className="qr-info-row"><span className="label">Trang trại:</span><span className="value">{data.farmName}</span></div>
                      <div className="qr-info-row"><span className="label">Địa chỉ:</span><span className="value">{data.farmAddress}</span></div>
                      <div className="qr-info-row"><span className="label">Khu vực:</span><span className="value">Vùng nguyên liệu BICAP</span></div>
                    </div>
                  </div>

                  {/* Season Info */}
                  <div className="qr-card">
                    <div className="qr-card-header"><Calendar size={20} /> <h3>Chi tiết mùa vụ</h3></div>
                    <div className="qr-card-body">
                      <div className="qr-info-row"><span className="label">Tên mùa vụ:</span><span className="value">{data.seasonName}</span></div>
                      <div className="qr-info-row"><span className="label">Ngày bắt đầu:</span><span className="value">{data.startDate || 'Đang cập nhật'}</span></div>
                      <div className="qr-info-row"><span className="label">Ngày thu hoạch:</span><span className="value">{data.endDate || 'Đang cập nhật'}</span></div>
                      <div className="qr-info-row"><span className="label">Ghi chú:</span><span className="value">{data.description || 'Quy trình chuẩn'}</span></div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="empty-result">
                <XCircle size={64} color="#ef4444" />
                <h3>Không tìm thấy dữ liệu Blockchain</h3>
                <p>Mã QR này không tồn tại trong hệ thống xác thực của BICAP. Vui lòng kiểm tra lại.</p>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="public-footer">
        <div className="container">
          <p>© 2025 BICAP System — Powered by VeChain Blockchain Technology</p>
        </div>
      </footer>
    </div>
  );
}