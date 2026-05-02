import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PublicHeader from '../../components/PublicHeader';
import { qrService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Search, CheckCircle, XCircle, MapPin, Calendar, Package, ShieldCheck, ExternalLink, Globe, FileText } from 'lucide-react';

// Helper: Chuyển đổi Hex sang String (UTF-8)
const hexToString = (hex) => {
  if (!hex || hex === '0x') return '';
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  try {
    const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error("Hex decode error:", e);
    return '';
  }
};

// Helper: SHA-256
const sha256 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export default function QRLookupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const [inputCode, setInputCode] = useState(paramCode || searchParams.get('code') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [verification, setVerification] = useState({ status: 'pending', message: 'Đang chuẩn bị đối soát...', onChainData: null });

  // Logic đối soát Blockchain
  const verifyOnChain = async (txHash, seasonId, seasonName, productId, productName, dbDescription, dbFinalHash) => {
    if (!txHash) return;
    try {
      // Gọi qua Proxy của Backend (Java) để tránh hoàn toàn lỗi CORS
      // Đây là cách duy nhất để trang Tra cứu hoạt động được trên mọi trình duyệt mà không cần cài Extension
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/blockchain/verify/${txHash}`);

      if (!res.ok) {
        setVerification({
          status: 'warning',
          message: 'KHÔNG TÌM THẤY: Giao dịch niêm phong chưa có trên Blockchain.',
          onChainData: null
        });
        return;
      }

      const tx = await res.json();

      if (!tx || !tx.clauses || tx.clauses.length === 0 || !tx.clauses[0].data) {
        setVerification({
          status: 'warning',
          message: 'KHÔNG TÌM THẤY: Giao dịch niêm phong chưa có trên Blockchain.',
          onChainData: null
        });
        return;
      }

      const hexData = tx.clauses[0].data;
      const decoded = hexToString(hexData);
      try {
        const onChain = JSON.parse(decoded);

        // 1. Kiểm tra Mùa vụ
        const nameMatch = onChain.seasonName === seasonName || onChain.name === seasonName;
        const idMatch = String(onChain.seasonId) === String(seasonId);

        // 2. Kiểm tra Sản phẩm
        let productMatch = false;
        if (onChain.products && Array.isArray(onChain.products)) {
          const foundProduct = onChain.products.find(p => String(p.id) === String(productId));
          if (foundProduct) {
            productMatch = foundProduct.name === productName;
            onChain.productName = foundProduct.name;
          }
        } else {
          productMatch = !onChain.productId || String(onChain.productId) === String(productId);
        }

        // 3. Kiểm tra tính toàn vẹn của Nhật ký (QUAN TRỌNG)
        const logs = dbDescription
          ? dbDescription.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "")
          : [];
        const currentLogHash = await sha256(logs.join(''));

        let hashMatch = true;
        if (onChain.finalHash) {
          hashMatch = (onChain.finalHash === currentLogHash);
        }

        if (nameMatch && idMatch && productMatch && hashMatch) {
          setVerification(prev => ({
            ...prev,
            status: 'success',
            message: 'Xác thực thành công: Dữ liệu trùng với thông tin trên Blockchain',
            onChainData: { ...prev.onChainData, ...onChain },
            rawHex: hexData
          }));
        } else {
          setVerification(prev => ({
            ...prev,
            status: 'warning',
            message: 'Cảnh báo: Phát hiện sai lệch dữ liệu so với Blockchain!',
            onChainData: { ...prev.onChainData, ...onChain },
            rawHex: hexData
          }));
        }
      } catch (e) {
        setVerification({
          status: 'none',
          message: 'Dữ liệu Blockchain không đúng định dạng đối soát.',
          rawHex: hexData
        });
      }
    } catch (err) {
      console.error(err);
      setVerification({
        status: 'error',
        message: 'LỖI KẾT NỐI: Không thể kết nối với mạng lưới Blockchain.',
        onChainData: null
      });
    }
  };

  const doSearch = async (c) => {
    if (!c?.trim()) return;

    // Nếu người dùng nhập nhầm URL thay vì mã QR
    if (c.trim().startsWith('http')) {
      setVerification({ status: 'error', message: 'Vui lòng nhập mã QR hợp lệ, không phải đường dẫn URL.' });
      return;
    }

    setLoading(true);
    setSearched(true);
    setVerification({ status: 'pending', message: 'Đang truy xuất dữ liệu...', onChainData: null });
    try {
      const res = await qrService.lookup(c.trim());
      const productData = res.data;
      setData(productData);
      setLoading(false); // Tắt loading chính ngay khi có dữ liệu từ DB để người dùng xem ngay

      if (productData && productData.blockchainHash) {
        setVerification(prev => ({ ...prev, message: 'Đang đối soát Blockchain...' }));
        // Chạy đối soát ngầm, không dùng await ở đây để không chặn UI
        verifyOnChain(productData.blockchainHash, productData.seasonId, productData.seasonName, productData.productId, productData.productName, productData.description, productData.finalHash);
      } else {
        setVerification({
          status: 'none',
          message: 'Sản phẩm chưa được niêm phong trên Blockchain.',
          onChainData: null
        });
      }
    } catch {
      setData(null);
      setVerification({ status: 'error', message: 'Không thể truy xuất dữ liệu.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramCode) {
      doSearch(paramCode);
    }
  }, [paramCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(inputCode);
  };

  const renderDescriptionWithLinks = (text) => {
    const blockchainLogs = verification.onChainData?.logs;
    const isFromBlockchain = !!(blockchainLogs && blockchainLogs.length > 0);

    const logSource = isFromBlockchain
      ? blockchainLogs.map(log => `[${log.date}] ${log.content}`)
      : (text ? text.split('\n').filter(l => l.trim() !== "") : []);

    if (logSource.length === 0 && !verification.onChainData?.ts) return <div style={{ padding: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Không có nhật ký canh tác</div>;

    const ActionButtons = ({ hash }) => (
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <a
          href={`https://insight.vecha.in/#/test/txs/${hash}`}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 8, color: '#64748b', fontWeight: 700, textDecoration: 'none', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}
        >
          Xem giao dịch Vechain<ExternalLink size={10} />
        </a>
      </div>
    );

    return (
      <div style={{ padding: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '31px', top: '32px', bottom: '32px', width: '2px', background: '#f1f5f9' }}></div>

        {/* 1. Điểm bắt đầu (IN_PROGRESS) */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, position: 'relative', zIndex: 1 }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#94a3b8', border: '4px solid white', marginTop: 4 }}></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>Bắt đầu vụ mùa</div>
            </div>
            <div>[{data?.startDate ? new Date(data.startDate).toLocaleDateString('vi-VN') : '---'}]</div>
          </div>
        </div>

        {/* 2. Các bước nhật ký */}
        {logSource.map((line, index) => (
          <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 32, position: 'relative', zIndex: 1 }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#cbd5e1', border: '2px solid white', marginTop: 6, marginLeft: 2 }}></div>
            <div style={{ fontSize: 14, color: '#334155' }}>{line}</div>
          </div>
        ))}

        {/* 3. Điểm kết thúc (EXPORTED) */}
        {data?.blockchainHash && (
          <div style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#059669', border: '4px solid white', marginTop: 4 }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>Xuất kho</div>
              <div>[{data?.endDate ? new Date(data.endDate).toLocaleDateString('vi-VN') : '---'}]</div>
              <ActionButtons hash={data.blockchainHash} />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper row component
  const InfoRow = ({ label, value, isWarning }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', padding: '8px 16px', alignItems: 'center' }}>
      <div style={{ width: '180px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: isWarning ? '#ef4444' : '#111827' }}>{value}</div>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, color = '#059669' }) => (
    <div style={{
      background: '#f8fafc',
      padding: '12px 16px',
      borderBottom: '2px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 24
    }}>
      <Icon size={18} color={color} />
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
    </div>
  );

  return (
    <div className="public-page">
      <PublicHeader />

      <section className="product-hero">
        <div className="container">
          <div className="product-hero-badge">🛡️ Blockchain-Powered Provenance</div>
          <h1 className="product-hero-title">
            Truy xuất nguồn gốc<br />
            <span className="gradient-text">Minh bạch & Tin cậy</span>
          </h1>
          <p className="product-hero-desc">
            Sử dụng công nghệ Blockchain VeChain để đảm bảo thông tin sản phẩm từ nông trại đến tay người tiêu dùng là duy nhất và không thể làm giả.
          </p>
          <form className="qr-search-form" onSubmit={handleSubmit} style={{ marginTop: 32 }}>
            <div className="qr-input-group">
              <QrCode size={20} className="qr-input-icon" />
              <input
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

      {searched && (
        <section className="qr-result-section" style={{ paddingBottom: 100 }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            {loading ? (
              <div className="loading-state" style={{ padding: '60px 0', textAlign: 'center' }}>
                <div className="loading-spinner-lg" style={{ margin: '0 auto 20px' }}></div>
                <p>Đang truy xuất dữ liệu Blockchain...</p>
              </div>
            ) : data ? (
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>

                {/* STATUS BANNER */}
                <div style={{
                  background: verification.status === 'success' ? '#059669' :
                    verification.status === 'none' ? '#94a3b8' :
                      verification.status === 'pending' ? '#3b82f6' : '#ef4444',
                  color: 'white',
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  {verification.status === 'success' ? <CheckCircle size={24} /> :
                    verification.status === 'none' ? <ShieldCheck size={24} /> :
                      verification.status === 'pending' ? <div className="spinner white"></div> : <XCircle size={24} />}
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{verification.message}</span>
                </div>


                {/* 2. THÔNG TIN SẢN PHẨM */}
                <SectionHeader icon={Package} title="Thông tin sản phẩm" />
                <InfoRow label="Mã sản phẩm" value={`#${data.productId}`} />
                <InfoRow
                  label="Tên sản phẩm"
                  value={verification.onChainData?.productName && verification.onChainData.productName !== data.productName ? (
                    <><span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: 8 }}>{data.productName}</span> {verification.onChainData.productName} (GỐC)</>
                  ) : data.productName}
                  isWarning={verification.onChainData?.productName && verification.onChainData.productName !== data.productName}
                />

                {/* NÔNG TRẠI SẢN XUẤT */}
                <SectionHeader icon={MapPin} title="Nông trại sản xuất" />
                <InfoRow label="Tên nông trại" value={data.farmName} />
                <InfoRow label="Địa chỉ" value={data.farmAddress} />

                {/* 4. CHI TIẾT MÙA VỤ */}
                <SectionHeader icon={Calendar} title="Chi tiết mùa vụ" />
                <InfoRow
                  label="Mã vụ mùa"
                  value={verification.onChainData?.seasonId && String(verification.onChainData.seasonId) !== String(data.seasonId) ? (
                    <><span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: 8 }}>{data.seasonId}</span> {verification.onChainData.seasonId} (GỐC)</>
                  ) : `#${data.seasonId}`}
                  isWarning={verification.onChainData?.seasonId && String(verification.onChainData.seasonId) !== String(data.seasonId)}
                />
                <InfoRow
                  label="Tên vụ mùa"
                  value={verification.onChainData?.name && verification.onChainData.name !== data.seasonName ? (
                    <><span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: 8 }}>{data.seasonName}</span> {verification.onChainData.name} (GỐC)</>
                  ) : data.seasonName}
                  isWarning={verification.onChainData?.name && verification.onChainData.name !== data.seasonName}
                />


                {/* QUY TRÌNH SẢN PHẨM */}
                <SectionHeader icon={FileText} title="Quy trình sản phẩm (Nhật ký)" />
                <div style={{ padding: '16px' }}>
                  {renderDescriptionWithLinks(data.description)}
                </div>

              </div>
            ) : (
              <div className="empty-state">
                <ShoppingBag size={56} />
                <h3>Không tìm thấy sản phẩm nào</h3>
                <p>Thử từ khóa khác hoặc xem tất cả sản phẩm</p>
                <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}
                  onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>
                  Xem tất cả sản phẩm
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="public-footer">
        <div className="container">
          <p>© 2025 BICAP — Blockchain Integration in Clean Agricultural Production</p>
        </div>
      </footer>
    </div>
  );
}