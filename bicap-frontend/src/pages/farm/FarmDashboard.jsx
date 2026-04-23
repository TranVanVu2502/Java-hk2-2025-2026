import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { farmService } from '../../api/services';
import { useFarm } from '../../context/FarmContext';
import { Building2, Plus, CheckCircle, Clock, XCircle, Edit, ChevronRight, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_META = {
  PENDING: { icon: Clock, color: '#f59e0b', bg: '#fffbeb', badge: 'badge-orange', label: 'Chờ Admin duyệt' },
  APPROVED: { icon: CheckCircle, color: '#10b981', bg: '#ecfdf5', badge: 'badge-green', label: 'Đã được duyệt' },
  REJECTED: { icon: XCircle, color: '#ef4444', bg: '#fef2f2', badge: 'badge-red', label: 'Bị từ chối' },
};

export default function FarmDashboard() {
  const { myFarm, loading, reload } = useFarm();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', ownerName: '', businessLicense: '' });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await farmService.create(form);
      toast.success('Đã gửi đăng ký trang trại. Vui lòng chờ Admin duyệt!');
      setShowForm(false);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner-lg"></div></div>;

  const status = myFarm ? STATUS_META[myFarm.status] : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard trang trại</h1>
          <p className="page-subtitle">Quản lý thông tin và hoạt động trang trại của bạn</p>
        </div>
      </div>

      {!myFarm ? (
        /* ---- Chưa có farm ---- */
        <div className="farm-welcome-card">
          <div className="farm-welcome-icon">🌾</div>
          <h2>Bạn chưa có trang trại nào</h2>
          <p>Đăng ký trang trại để bắt đầu quản lý mùa vụ và sản phẩm nông sản</p>
          {!showForm ? (
            <button id="create-farm-btn" className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }}
              onClick={() => setShowForm(true)}>
              <Plus size={18} /> Đăng ký trang trại
            </button>
          ) : (
            <form className="farm-register-form" onSubmit={handleCreate}>
              <h3>Thông tin trang trại</h3>
              <div className="form-grid">
                {[
                  { label: 'Tên trang trại *', name: 'name', required: true, placeholder: 'VD: Trang trại Sơn Hà' },
                  { label: 'Địa chỉ', name: 'address', placeholder: 'Thôn, xã, huyện, tỉnh' },
                  { label: 'Tên chủ trang trại', name: 'ownerName', placeholder: 'Họ và tên' },
                  { label: 'Giấy phép kinh doanh', name: 'businessLicense', placeholder: 'Số GPKD (nếu có)' },
                ].map(f => (
                  <div className="form-group" key={f.name}>
                    <label>{f.label}</label>
                    <input id={`farm-${f.name}`} type="text" required={f.required} placeholder={f.placeholder}
                      value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-ghost-sm" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} disabled={saving}>
                  {saving ? <span className="spinner white"></span> : 'Gửi đăng ký'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* ---- Đã có farm ---- */
        <>
          {/* Status banner */}
          <div className="farm-status-banner" style={{ background: status?.bg, borderColor: status?.color }}>
            <div className="farm-status-icon" style={{ color: status?.color }}>
              {status?.icon && <status.icon size={24} />}
            </div>
            <div>
              <strong style={{ color: status?.color }}>{status?.label}</strong>
              {myFarm.status === 'PENDING' && <p>Trang trại đang chờ Admin xem xét và phê duyệt. Bạn sẽ nhận được thông báo sớm.</p>}
              {myFarm.status === 'APPROVED' && <p>Trang trại đã được duyệt. Bạn có thể tạo mùa vụ và quản lý sản phẩm.</p>}
              {myFarm.status === 'REJECTED' && <p>Trang trại bị từ chối. Vui lòng liên hệ Admin để biết thêm chi tiết.</p>}
            </div>
          </div>

          {/* Farm info card */}
          <div className="section-card" style={{ marginTop: 20 }}>
            <div className="section-card-header">
              <h3><Building2 size={18} /> {myFarm.name}</h3>
              <Link to="/farm/seasons" className="btn-primary-sm" style={{ textDecoration: 'none' }}>
                Xem mùa vụ <ChevronRight size={14} />
              </Link>
            </div>
            <div className="farm-info-grid">
              {[
                { label: 'Địa chỉ', value: myFarm.address || '—' },
                { label: 'Chủ trang trại', value: myFarm.ownerName || '—' },
                { label: 'Giấy phép KD', value: myFarm.businessLicense || '—' },
                { label: 'Trạng thái', value: null, badge: myFarm.status },
              ].map(item => (
                <div className="farm-info-item" key={item.label}>
                  <span className="info-label">{item.label}</span>
                  {item.badge
                    ? <span className={`badge ${status?.badge}`}>{status?.label}</span>
                    : <span className="info-value">{item.value}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}