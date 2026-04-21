import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { seasonService } from '../../api/services';
import { useFarm } from '../../context/FarmContext';
import { Plus, Calendar, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Đang canh tác', value: 'IN_PROGRESS' },
  { label: 'Đã xuất', value: 'EXPORTED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

const STATUS_META = {
  IN_PROGRESS: { badge: 'badge-blue',   label: 'Đang canh tác' },
  EXPORTED:    { badge: 'badge-green',  label: 'Đã xuất' },
  CANCELLED:   { badge: 'badge-red',    label: 'Đã hủy' },
};

export default function FarmSeasons() {
  const { myFarm } = useFarm();
  const [seasons, setSeasons] = useState([]);
  const [tab, setTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!myFarm?.farmId) return;
    setLoading(true);
    seasonService.getByFarm(myFarm.farmId)
      .then(res => setSeasons(res.data || []))
      .catch(() => toast.error('Không thể tải mùa vụ'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [myFarm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await seasonService.create(myFarm.farmId, form);
      toast.success('Đã tạo mùa vụ mới');
      setShowForm(false);
      setForm({ name: '', startDate: '', endDate: '', description: '' });
      load();
    } catch { toast.error('Tạo mùa vụ thất bại'); }
    finally { setSaving(false); }
  };

  const filtered = tab ? seasons.filter(s => s.status === tab) : seasons;

  if (!myFarm) return (
    <div className="page"><div className="empty-state">
      <Calendar size={56} />
      <h3>Chưa có trang trại</h3>
      <p>Bạn cần đăng ký trang trại trước</p>
      <Link to="/farm/dashboard" className="btn-primary" style={{ textDecoration: 'none', width: 'auto', padding: '10px 24px' }}>Về Dashboard</Link>
    </div></div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mùa vụ — {myFarm.name}</h1>
          <p className="page-subtitle">{seasons.length} mùa vụ</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={load}><RefreshCw size={18} /></button>
          <button id="add-season-btn" className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Tạo mùa vụ
          </button>
        </div>
      </div>

      {/* Create form inline */}
      {showForm && (
        <div className="inline-form-card">
          <div className="inline-form-header">
            <h3>Tạo mùa vụ mới</h3>
            <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
          </div>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Tên mùa vụ *</label>
                <input id="season-name" type="text" required placeholder="VD: Vụ Hè Thu 2025"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Ngày bắt đầu</label>
                <input id="season-start" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc</label>
                <input id="season-end" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Mô tả quy trình</label>
                <textarea id="season-desc" rows={3} placeholder="Mô tả quy trình canh tác..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn-ghost-sm" onClick={() => setShowForm(false)}>Hủy</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} disabled={saving}>
                {saving ? <span className="spinner white"></span> : 'Tạo mùa vụ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar">
        {STATUS_TABS.map(t => (
          <button key={t.value} id={`season-tab-${t.value || 'all'}`}
            className={`tab-btn ${tab === t.value ? 'active' : ''}`}
            onClick={() => setTab(t.value)}>
            {t.label}
            {t.value && <span className="tab-count">{seasons.filter(s => s.status === t.value).length}</span>}
          </button>
        ))}
      </div>

      <div className="section-card">
        {loading ? (
          <div className="page-loading"><div className="loading-spinner-lg"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-table">
            <Calendar size={40} />
            <p>{tab ? 'Không có mùa vụ nào với trạng thái này' : 'Chưa có mùa vụ nào. Nhấn "Tạo mùa vụ" để bắt đầu.'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên mùa vụ</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const meta = STATUS_META[s.status] || STATUS_META.IN_PROGRESS;
                return (
                  <tr key={s.seasonId}>
                    <td className="td-muted">{i + 1}</td>
                    <td><strong>{s.name}</strong></td>
                    <td className="td-muted">{s.startDate || '—'}</td>
                    <td className="td-muted">{s.endDate || '—'}</td>
                    <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                    <td>
                      <Link
                        id={`season-detail-${s.seasonId}`}
                        to={`/farm/seasons/${s.seasonId}`}
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
