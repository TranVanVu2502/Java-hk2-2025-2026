import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../../api/services';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';

const STATUS_META = {
  PENDING:   { badge: 'badge-orange', label: 'Chờ xác nhận' },
  CONFIRMED: { badge: 'badge-blue',   label: 'Đã xác nhận' },
  REJECTED:  { badge: 'badge-red',    label: 'Từ chối' },
  COMPLETED: { badge: 'badge-green',  label: 'Hoàn thành' },
  CANCELLED: { badge: 'badge-gray',   label: 'Đã hủy' },
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
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/retailer/orders')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">Chi tiết đơn hàng #{order.orderId}</h1>
            <p className="page-subtitle">
              <span className={`badge ${meta.badge}`}>{meta.label}</span>
            </p>
          </div>
        </div>
        {order.status === 'CONFIRMED' && (
          <button id="confirm-received-btn" className="btn-success-sm" onClick={handleConfirmReceived}>
            <ShoppingCart size={14} /> Xác nhận nhận hàng
          </button>
        )}
      </div>

      <div className="season-detail-grid">
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

        <div className="section-card">
          <div className="section-card-header"><h3><Package size={18} /> Sản phẩm đặt hàng</h3></div>
          {!order.orderDetails || order.orderDetails.length === 0 ? (
            <div className="empty-table"><p>Không có chi tiết sản phẩm</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Sản phẩm</th><th>Số lượng (kg)</th></tr>
              </thead>
              <tbody>
                {order.orderDetails.map((d, i) => (
                  <tr key={i}>
                    <td>{d.productName || `Sản phẩm #${d.productId}`}</td>
                    <td>{d.quantity} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
