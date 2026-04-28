import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../api/services';
import { Check, X, User, MapPin, Building, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_META = {
    PENDING: { badge: 'badge-orange', label: 'Chờ xác nhận' },
    CONFIRMED: { badge: 'badge-blue', label: 'Đã xác nhận' },
    REJECTED: { badge: 'badge-red', label: 'Từ chối' },
    COMPLETED: { badge: 'badge-green', label: 'Hoàn thành' },
    CANCELLED: { badge: 'badge-gray', label: 'Đã hủy' },
};

export default function FarmOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderService.getById(id)
            .then(res => setOrder(res.data))
            .catch(() => {
                toast.error('Không tìm thấy đơn hàng');
                navigate('/farm/orders');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleConfirm = async () => {
        try {
            await orderService.confirm(id);
            toast.success('Đã xác nhận đơn hàng');
            setOrder(prev => ({ ...prev, status: 'CONFIRMED' }));
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Thao tác thất bại';
            toast.error(errorMsg);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Từ chối đơn hàng này?')) return;
        try {
            await orderService.cancel(id);
            toast.success('Đã từ chối đơn hàng');
            setOrder(prev => ({ ...prev, status: 'CANCELLED' }));
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Thao tác thất bại';
            toast.error(errorMsg);
        }
    };

    if (loading) return <div className="page-loading"><div className="loading-spinner-lg"></div></div>;
    if (!order) return null;

    const meta = STATUS_META[order.status] || STATUS_META.PENDING;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Chi tiết đơn hàng #{order.orderId}</h1>
                    <p className="page-subtitle">
                        <span className={`badge ${meta.badge}`}>{meta.label}</span>
                    </p>
                </div>
                {order.status === 'PENDING' && (
                    <div className="header-actions">
                        <button className="btn-success-sm" onClick={handleConfirm}>
                            <Check size={14} /> Chấp nhận
                        </button>
                        <button className="btn-danger-sm" onClick={handleCancel}>
                            <X size={14} /> Từ chối
                        </button>
                    </div>
                )}
            </div>

            <div className="season-detail-grid">
                {/* Left: Products list */}
                <div className="section-card">
                    <div className="section-card-header">
                        <h3><Package size={18} /> Danh sách sản phẩm</h3>
                    </div>
                    {!order.orderDetails || order.orderDetails.length === 0 ? (
                        <div className="empty-table"><Package size={32} /><p>Không có chi tiết sản phẩm</p></div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 60 }}>Ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Số lượng (kg)</th>
                                    <th>Đơn giá</th>
                                    <th>Tổng tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.orderDetails.map((d, i) => (
                                    <tr key={i}>
                                        <td>
                                            {d.productImage ? (
                                                <img
                                                    src={d.productImage.startsWith('http') ? d.productImage : `http://localhost:8080${d.productImage}`}
                                                    alt={d.productName}
                                                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                                                />
                                            ) : (
                                                <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 6 }}>
                                                    📦
                                                </div>
                                            )}
                                        </td>
                                        <td><strong>{d.productName || `Sản phẩm #${d.productId}`}</strong></td>
                                        <td>{d.quantity}</td>
                                        <td className="td-muted">{d.price ? `${Number(d.price).toLocaleString('vi-VN')} ₫` : '—'}</td>
                                        <td><strong>{(d.quantity && d.price) ? `${Number(d.quantity * d.price).toLocaleString('vi-VN')} ₫` : '—'}</strong></td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'right', color: '#6b7280' }}><strong>Tổng cộng:</strong></td>
                                    <td style={{ color: '#10b981', fontSize: '15px' }}><strong>
                                        {Number(
                                            order.orderDetails.reduce((sum, d) => sum + ((d.quantity || 0) * (d.price || 0)), 0)
                                        ).toLocaleString('vi-VN')} ₫
                                    </strong></td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Right: Retailer info */}
                <div>
                    <div className="section-card">
                        <div className="section-card-header">
                            <h3><Building size={18} /> Thông tin Nhà Bán Lẻ</h3>
                        </div>
                        <div className="farm-info-grid" style={{ padding: '20px 22px' }}>
                            <div className="farm-info-item">
                                <span className="info-label"><Building size={14} style={{ display: 'inline', marginRight: 4 }} /> Tên doanh nghiệp</span>
                                <span className="info-value">{order.retailerName || 'Chưa cập nhật'}</span>
                            </div>
                            <div className="farm-info-item">
                                <span className="info-label"><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> Địa chỉ</span>
                                <span className="info-value">{order.retailerAddress || 'Chưa cập nhật'}</span>
                            </div>
                            <div className="farm-info-item">
                                <span className="info-label"><User size={14} style={{ display: 'inline', marginRight: 4 }} />Số GPKD</span>
                                <span className="info-value">{order.retailerBusinessLicense || 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}