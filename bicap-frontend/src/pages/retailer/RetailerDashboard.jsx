import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicHeader from '../../components/PublicHeader';
import { orderService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingCart, XCircle, ArrowLeft, Leaf, LogOut } from 'lucide-react';

const ORDER_STATUS = {
  PENDING: { badge: 'badge-orange', label: 'Chờ xác nhận' },
  CONFIRMED: { badge: 'badge-blue', label: 'Đã xác nhận' },
  REJECTED: { badge: 'badge-red', label: 'Từ chối' },
  COMPLETED: { badge: 'badge-green', label: 'Hoàn thành' },
  CANCELLED: { badge: 'badge-gray', label: 'Đã hủy' },
};

export default function RetailerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const isRetailer = user?.role === 'RETAILER';

  const load = () => {
    setLoading(true);
    orderService.getAll()
      .then((res) => setOrders(res.data || []))
      .catch(() => toast.error('Không thể tải đơn hàng'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Bạn chắc chắn muốn hủy đơn hàng?')) return;
    try {
      await orderService.cancel(id);
      toast.success('Đã hủy đơn hàng');
      load();
    } catch { toast.error('Không thể hủy đơn hàng'); }
  };

  const handleLogout = () => {
    logout();
    navigate('/products');
  };

  const ORDER_TABS = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const TAB_LABELS = { '': 'Tất cả', PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };

  const filtered = activeTab ? orders.filter((o) => o.status === activeTab) : orders;

  return (
    <div className="public-page">
      <PublicHeader />

      <div className="container public-page-content">
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">Lịch sử đơn hàng</h1>
              <p className="page-subtitle"><ShoppingCart size={16} /> {orders.length} đơn hàng</p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {[
              { label: 'Chờ xác nhận', count: orders.filter(o => o.status === 'PENDING').length, color: '#f59e0b' },
              { label: 'Đã xác nhận', count: orders.filter(o => o.status === 'CONFIRMED').length, color: '#3b82f6' },
              { label: 'Hoàn thành', count: orders.filter(o => o.status === 'COMPLETED').length, color: '#10b981' },
              { label: 'Đã hủy', count: orders.filter(o => o.status === 'CANCELLED').length, color: '#ef4444' },
            ].map((s) => (
              <div className="stat-card mini" key={s.label}>
                <span className="stat-value" style={{ color: s.color }}>{s.count}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            {ORDER_TABS.map((t) => (
              <button
                key={t}
                id={`order-tab-${t || 'all'}`}
                className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {TAB_LABELS[t]}
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
                    <th>Trang trại</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="empty-row">Không có đơn hàng nào</td></tr>
                  ) : filtered.map((order, i) => {
                    const meta = ORDER_STATUS[order.status] || ORDER_STATUS.PENDING;
                    return (
                      <tr key={order.orderId}>
                        <td className="td-muted">{i + 1}</td>
                        <td><strong>#{order.orderId}</strong></td>
                        <td>{order.farmName || `Farm #${order.farmId}`}</td>
                        <td className="td-muted">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                        <td>
                          <div className="action-group">
                            {order.status === 'PENDING' && (
                              <button id={`cancel-order-${order.orderId}`} className="btn-red-sm" onClick={() => handleCancel(order.orderId)}>
                                <XCircle size={14} /> Hủy
                              </button>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <button id={`cancel-order-${order.orderId}`} className="btn-red-sm" onClick={() => handleCancel(order.orderId)}>
                                <XCircle size={14} /> Hủy
                              </button>
                            )}
                            {(order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.status === 'REJECTED') && (
                              <span className="td-muted">—</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <Link
                            id={`order-detail-${order.orderId}`}
                            to={`/retailer/orders/${order.orderId}`}
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
      </div>
    </div>
  );
}