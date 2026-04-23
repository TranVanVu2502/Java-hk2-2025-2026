import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService, qrService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { Leaf, ArrowLeft, QrCode, Package, MapPin, Calendar, CheckCircle, ShoppingCart, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { addToCart } = useOrder();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrData, setQrData] = useState(null);

    useEffect(() => {
        productService.getById(id)
            .then(res => setProduct(res.data))
            .catch(() => navigate('/products'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleViewQR = async () => {
        if (!product?.qrCode) return;
        setQrLoading(true);
        try {
            const res = await qrService.lookup(product.qrCode);
            setQrData(res.data);
        } catch {
            alert('Không tìm thấy thông tin QR');
        } finally {
            setQrLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/products');
    };

    const handleAddToCart = () => {
        if (!product || product.status !== 'AVAILABLE') return;
        addToCart(
            {
                productId: product.productId,
                farmId: product.farmId,
                farmName: product.farmName,
                name: product.name,
                price: product.price ? Number(product.price) : 0,
                maxQuantity: Number(product.quantity) || 0,
            },
            1
        );
        toast.success('Đã thêm sản phẩm vào giỏ hàng');
        navigate('/order');
    };

    if (loading) return <div className="page-loading" style={{ minHeight: '100vh' }}><div className="loading-spinner-lg"></div></div>;
    if (!product) return null;

    const statusMap = {
        AVAILABLE: { badge: 'badge-green', label: 'Còn hàng' },
        SOLD_OUT: { badge: 'badge-orange', label: 'Hết hàng' },
        HIDDEN: { badge: 'badge-gray', label: 'Ẩn' },
    };
    const meta = statusMap[product.status] || statusMap.AVAILABLE;

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
                            <Link to="/products" className="guest-nav-link active">Sản phẩm</Link>
                            <Link to="/qr" className="guest-nav-link">Tra cứu QR</Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="container" style={{ padding: '32px 24px 80px' }}>

                <div className="product-detail-grid">
                    {/* Left: Image / Visual */}
                    <div className="product-detail-visual">
                        <div className="product-detail-emoji" style={{
                            width: '100%',
                            height: '300px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            marginBottom: '16px',
                        }}>
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:8080${product.imageUrl}`}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span style={{ fontSize: '80px' }}>🌿</span>
                            )}
                        </div>


                        {product.status === 'AVAILABLE' ? (
                            <button
                                onClick={handleAddToCart}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: 8, width: '100%', marginTop: '10px',
                                    padding: '13px 24px', background: '#10b981', borderRadius: '10px',
                                    color: 'white', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer'
                                }}
                            >
                                <ShoppingCart size={18} /> Đặt hàng
                            </button>
                        ) : (
                            <button
                                onClick={navigate('/login')}
                                disabled={product.status !== 'AVAILABLE'}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: 8, width: '100%', marginTop: '10px',
                                    padding: '13px 24px',
                                    background: isRetailer ? '#d1d5db' : '#10b981',
                                    borderRadius: '10px',
                                    color: 'white', fontWeight: 600, fontSize: 14, border: 'none', 'not-allowed': 'pointer'
                                }}
                            >
                                <ShoppingCart size={18} />
                            </button>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="product-detail-info">
                        <h1 className="product-detail-name">{product.name}</h1>
                        <div className="product-detail-price">
                            {product.price ? `${Number(product.price).toLocaleString('vi-VN')} ₫/kg` : 'Liên hệ báo giá'}
                        </div>

                        <div className="detail-info-grid">
                            <div className="detail-info-block">
                                <h3><Package size={15} /> Thông tin sản phẩm</h3>
                                <div className="info-list">
                                    <div className="info-item">
                                        <span className="info-label">Số lượng</span>
                                        <span className="info-value">{product.quantity} kg</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Mã sản phẩm</span>
                                        <span className="info-value">#{product.productId}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Trạng thái</span>
                                        <span className={`badge ${meta.badge}`}>{meta.label}</span>
                                    </div>
                                </div>
                            </div>

                            {product.seasonName && (
                                <div className="detail-info-block">
                                    <h3><Calendar size={15} /> Mùa vụ</h3>
                                    <div className="info-list">
                                        <div className="info-item">
                                            <span className="info-label">Tên mùa vụ</span>
                                            <span className="info-value">{product.seasonName}</span>
                                        </div>
                                        {product.seasonStart && (
                                            <div className="info-item">
                                                <span className="info-label">Bắt đầu</span>
                                                <span className="info-value">{product.seasonStart}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {product.farmName && (
                                <div className="detail-info-block">
                                    <h3><MapPin size={15} /> Trang trại</h3>
                                    <div className="info-list">
                                        {product.farmId && (
                                            <div className="info-item">
                                                <span className="info-label">Mã trang trại</span>
                                                <span className="info-value">#{product.farmId}</span>
                                            </div>
                                        )}
                                        <div className="info-item">
                                            <span className="info-label">Tên trang trại</span>
                                            <span className="info-value">{product.farmName}</span>
                                        </div>
                                        {product.farmAddress && (
                                            <div className="info-item">
                                                <span className="info-label">Địa chỉ</span>
                                                <span className="info-value">{product.farmAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(product.qrCode || product.blockchainHash) && (
                                <div className="detail-info-block">
                                    <h3><QrCode size={15} /> Truy xuất nguồn gốc</h3>
                                    <div className="info-list">
                                        {product.qrCode && (
                                            <>
                                                <div className="info-item">
                                                    <span className="info-label">Mã QR</span>
                                                    <div className="info-value">
                                                        <img
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.origin + '/qr/' + product.qrCode)}`}
                                                            alt="QR Code"
                                                            style={{ width: 120, height: 120, borderRadius: 8, border: '1px solid #e5e7eb', padding: 4, background: '#fff' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Mã truy xuất</span>
                                                    <span className="info-value">{product.qrCode}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* QR Result */}
                {qrData && (
                    <div className="qr-result-card" style={{ marginTop: '32px' }}>
                        <div className="result-header">
                            <div className="result-verified"><CheckCircle size={20} /><span>Đã xác thực nguồn gốc</span></div>
                        </div>
                        <div className="result-grid">
                            {[
                                { label: 'Trang trại', value: qrData.farmName },
                                { label: 'Địa chỉ', value: qrData.farmAddress },
                                { label: 'Mùa vụ', value: qrData.seasonName },
                                { label: 'Blockchain Hash', value: qrData.blockchainHash },
                            ].filter(r => r.value).map(r => (
                                <div className="result-section-block" key={r.label}>
                                    <h3>{r.label}</h3>
                                    <p className={r.label === 'Blockchain Hash' ? 'blockchain-hash' : 'info-value'}>{r.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <footer className="public-footer">
                <div className="container">
                    <p>© 2025 BICAP — Blockchain Integration in Clean Agricultural Production</p>
                </div>
            </footer>
        </div>
    );
}