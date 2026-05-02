import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../api/services';
import { useFarm } from '../../context/FarmContext';
import { ShoppingCart, Check, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_META = {
  PENDING: { badge: 'badge-orange', label: 'Chờ xác nhận' },
  CONFIRMED: { badge: 'badge-blue', label: 'Đã xác nhận' },
  REJECTED: { badge: 'badge-red', label: 'Từ chối' },
  COMPLETED: { badge: 'badge-green', label: 'Hoàn thành' },
  CANCELLED: { badge: 'badge-gray', label: 'Đã hủy' },
};

export default function FarmOrders() {
  const { myFarm } = useFarm();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    // Gọi đúng endpoint cho Farm Manager
    orderService.getByFarm()
      .then(res => setOrders(res.data || []))
      .catch(() => toast.error('Không thể tải đơn hàng'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id) => {
    const order = orders.find(o => o.orderId === id);
    console.log('🔍 Xác nhận đơn #' + id, 'Trạng thái hiện tại:', order?.status);

    try {
      await orderService.confirm(id);
      toast.success('Đã xác nhận đơn hàng');
      load();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Thao tác thất bại';
      console.error('❌ Lỗi xác nhận đơn:', errorMsg, err);
      toast.error(errorMsg);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Từ chối đơn hàng này?')) return;

    const order = orders.find(o => o.orderId === id);
    console.log('🔍 Từ chối đơn #' + id, 'Trạng thái hiện tại:', order?.status);

    try {
      await orderService.cancel(id);
      toast.success('Đã từ chối đơn hàng');
      load();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Thao tác thất bại';
      console.error('❌ Lỗi từ chối đơn:', errorMsg, err);
      toast.error(errorMsg);
    }
  };

  const ALL_TABS = [
    { label: 'Chờ xác nhận', value: 'PENDING' },
    { label: 'Đã xác nhận', value: 'CONFIRMED' },
    { label: 'Tất cả', value: '' },
  ];

  const filtered = tab ? orders.filter(o => o.status === tab) : orders;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Đơn hàng từ Retailer</h1>
          <p className="page-subtitle"><ShoppingCart size={16} /> {orders.filter(o => o.status === 'PENDING').length} đơn đang chờ xác nhận</p>
        </div>
        <button className="btn-icon" onClick={load}><RefreshCw size={18} /></button>
      </div>

      <div className="tab-bar">
        {ALL_TABS.map(t => (
          <button key={t.value} id={`farm-order-tab-${t.value || 'all'}`}
            className={`tab-btn ${tab === t.value ? 'active' : ''}`}
            onClick={() => setTab(t.value)}>
            {t.label}
            {t.value === 'PENDING' && (
              <span className="tab-count urgent">{orders.filter(o => o.status === 'PENDING').length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="section-card">
        {loading ? (
          <div className="page-loading"><div className="loading-spinner-lg"></div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ID Đơn</th>
                <th>Nhà bán lẻ</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">Không có đơn hàng nào</td></tr>
              ) : filtered.map((order, i) => {
                const meta = STATUS_META[order.status] || STATUS_META.PENDING;
                return (
                  <tr key={order.orderId}>
                    <td className="td-muted">{i + 1}</td>
                    <td><strong>#{order.orderId}</strong></td>
                    <td>{order.retailerName || `Retailer #${order.retailerId}`}</td>
                    <td className="td-muted">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                    <td>
                      {order.status === 'PENDING' && (
                        <div className="action-group">
                          <button id={`confirm-order-${order.orderId}`} className="btn-green-sm"
                            onClick={() => handleConfirm(order.orderId)}>
                            <Check size={14} /> Chấp nhận
                          </button>
                          <button id={`reject-order-${order.orderId}`} className="btn-red-sm"
                            onClick={() => handleCancel(order.orderId)}>
                            <X size={14} /> Từ chối
                          </button>
                        </div>
                      )}
                      {order.status !== 'PENDING' && <span className="td-muted">—</span>}
                    </td>
                    <td>
                      <Link
                        id={`order-detail-${order.orderId}`}
                        to={`/farm/orders/${order.orderId}`}
                        className="btn-primary-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}