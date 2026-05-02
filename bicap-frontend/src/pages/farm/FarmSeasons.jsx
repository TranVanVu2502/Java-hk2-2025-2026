import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { seasonService } from '../../api/services';
import { useFarm } from '../../context/FarmContext';
import { Plus, Calendar, RefreshCw, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Đang canh tác', value: 'IN_PROGRESS' },
  { label: 'Đang thu hoạch', value: 'HARVESTED' },
  { label: 'Đã xuất', value: 'EXPORTED' },
];

const STATUS_META = {
  IN_PROGRESS: { badge: 'badge-blue', label: 'Đang canh tác' },
  HARVESTED: { badge: 'badge-orange', label: 'Đang thu hoạch' },
  EXPORTED: { badge: 'badge-green', label: 'Đã xuất' },
};

export default function FarmSeasons() {
  const { myFarm } = useFarm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('status') || '';
  const setTab = (val) => {
    if (val) setSearchParams({ status: val });
    else setSearchParams({});
  };

  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!myFarm?.farmId) return;
    setLoading(true);
    seasonService.getByFarm(myFarm.farmId)
      .then(res => setSeasons(res.data || []))
      .catch(() => toast.error('Không thể tải mùa vụ'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [myFarm]);

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
          <button id="add-season-btn" className="btn-primary" onClick={() => navigate('/farm/seasons/new')}>
            <Plus size={18} /> Tạo mùa vụ
          </button>
        </div>
      </div>


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
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link
                          id={`season-detail-${s.seasonId}`}
                          to={`/farm/seasons/${s.seasonId}`}
                          className="btn-primary-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          Chi tiết
                        </Link>
                      </div>
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