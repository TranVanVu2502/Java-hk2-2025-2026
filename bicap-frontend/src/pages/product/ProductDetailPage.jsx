import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService, qrService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Package, MapPin, Calendar, CheckCircle, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        productService.getById(id)
            .then(res => setProduct(res.data))
            .catch(() => {
                toast.error('Không tìm thấy sản phẩm');
                navigate('/products');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) return (
        <div className="page-loading" style={{ minHeight: '100vh' }}>
            <div className="loading-spinner-lg"></div>
        </div>
    );

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
                    {/* Cột trái: Hình ảnh & Hành động chính */}
                    <div className="product-detail-visual">
                        <div className="product-detail-emoji" style={{
                            width: '100%', height: '300px', backgroundColor: '#f9fafb',
                            borderRadius: '12px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', overflow: 'hidden', marginBottom: '16px',
                            border: '1px solid #f1f5f9'
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

                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <span className={`badge ${meta.badge}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
                                {meta.label}
                            </span>
                        </div>

                        {product.qrCode && (
                            <button
                                className="btn-primary"
                                style={{ width: '100%', marginBottom: '10px' }}
                                onClick={handleViewQR}
                                disabled={qrLoading}
                            >
                                {qrLoading ? <span className="spinner white"></span> : <><QrCode size={18} /> Truy xuất nguồn gốc</>}
                            </button>
                        )}

                        <button
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: 8, width: '100%', padding: '13px 24px',
                                background: '#f3f4f6', borderRadius: '10px',
                                color: '#374151', fontWeight: 600, fontSize: 14, border: '1px solid #d1d5db',
                                cursor: 'pointer'
                            }}
                            onClick={() => toast('Tính năng đặt hàng đang được phát triển', { icon: '🚧' })}
                        >
                            <Phone size={18} /> Liên hệ hỗ trợ
                        </button>
                    </div>

                    {/* Cột phải: Thông tin chi tiết */}
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
                                        <span className="info-label">Sản lượng còn</span>
                                        <span className="info-value">{product.quantity} kg</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Mã số lô</span>
                                        <span className="info-value">#{product.productId}</span>
                                    </div>
                                </div>
                            </div>

                            {product.seasonName && (
                                <div className="detail-info-block">
                                    <h3><Calendar size={15} /> Chu kỳ mùa vụ</h3>
                                    <div className="info-list">
                                        <div className="info-item">
                                            <span className="info-label">Mùa vụ</span>
                                            <span className="info-value">{product.seasonName}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {product.farmName && (
                                <div className="detail-info-block">
                                    <h3><MapPin size={15} /> Nơi sản xuất</h3>
                                    <div className="info-list">
                                        <div className="info-item">
                                            <span className="info-label">Trang trại</span>
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
                        </div>
                    </div>
                </div>
            </div>

            <footer className="public-footer">
                <div className="container">
                    <p>© 2025 BICAP — Hệ thống quản lý nông sản sạch Blockchain</p>
                </div>
            </footer>
        </div>
    );
}