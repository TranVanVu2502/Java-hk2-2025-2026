import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicHeader from '../../components/PublicHeader';
import { orderService } from '../../api/services';
import { ShoppingCart, Package } from 'lucide-react';

const STATUS_META = {
  PENDING: { badge: 'badge-orange', label: 'Chờ xác nhận' },
  CONFIRMED: { badge: 'badge-blue', label: 'Đã xác nhận' },
  REJECTED: { badge: 'badge-red', label: 'Từ chối' },
  COMPLETED: { badge: 'badge-green', label: 'Hoàn thành' },
  CANCELLED: { badge: 'badge-gray', label: 'Đã hủy' },
};

export default function RetailerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getById(id)
      .then(res => setOrder(res.data))
      .catch(() => navigate('/retailer/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirmReceived = async () => {
    try {
      await orderService.confirm(id);
      alert('Đã xác nhận nhận hàng!');
      setOrder(o => ({ ...o, status: 'COMPLETED' }));
    } catch { alert('Thao tác thất bại'); }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner-lg"></div></div>;
  if (!order) return null;

  const meta = STATUS_META[order.status] || STATUS_META.PENDING;

  return (
    <div className="public-page">
      <PublicHeader />
      <div className="container public-page-content">
        <div className="page" style={{ minHeight: '80vh' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Chi tiết đơn hàng #{order.orderId}</h1>
              <p className="page-subtitle">
                <span className={`badge ${meta.badge}`}>{meta.label}</span>
              </p>
            </div>
            {order.status === 'CONFIRMED' && (
              <button id="confirm-received-btn" className="btn-success-sm" onClick={handleConfirmReceived}>
                <ShoppingCart size={14} /> Xác nhận nhận hàng
              </button>
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
                        <td>
                          <Link to={`/products/${d.productId}`} style={{ color: '#1f2937', textDecoration: 'none' }}>
                            <strong>{d.productName || `Sản phẩm #${d.productId}`}</strong>
                          </Link>
                        </td>
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

            {/* Right: Order Info */}
            <div>
              <div className="section-card">
                <div className="section-card-header"><h3>Thông tin đơn hàng</h3></div>
                <div className="farm-info-grid" style={{ padding: '16px 22px' }}>
                  {[
                    { label: 'Mã đơn', value: `#${order.orderId}` },
                    { label: 'Trang trại', value: order.farmName || `Farm #${order.farmId}` },
                    { label: 'Ngày tạo', value: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—' },
                    { label: 'Trạng thái', badge: true },
                  ].map(item => (
                    <div className="farm-info-item" key={item.label}>
                      <span className="info-label">{item.label}</span>
                      {item.badge
                        ? <span className={`badge ${meta.badge}`}>{meta.label}</span>
                        : <span className="info-value">{item.value}</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="public-footer">
        <div className="container">
          <p>© 2025 BICAP — Blockchain Integration in Clean Agricultural Production</p>
        </div>
      </footer>
    </div>
  );
}