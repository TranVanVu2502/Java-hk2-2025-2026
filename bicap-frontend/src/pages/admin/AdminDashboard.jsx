import { useEffect, useState } from 'react';
import { adminService } from '../../api/services';
import { Users, Building2, ShoppingCart, TrendingUp, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const MOCK_MONTHLY = [
  { month: 'T1', orders: 12, farms: 2 },
  { month: 'T2', orders: 18, farms: 3 },
  { month: 'T3', orders: 24, farms: 4 },
  { month: 'T4', orders: 31, farms: 5 },
  { month: 'T5', orders: 28, farms: 6 },
  { month: 'T6', orders: 42, farms: 7 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'white', border: '1px solid #e2e8f0', borderRadius: 10,
        padding: '10px 14px', boxShadow: '0 8px 20px rgba(0,0,0,.1)',
        fontSize: 13, fontFamily: 'Inter, sans-serif',
      }}>
        <p style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminService.getStats()
      .then(res => setStats(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cards = stats ? [
    {
      label: 'Tổng trang trại',
      value: stats.totalFarms ?? 0,
      sub: `${stats.pendingFarms ?? 0} chờ duyệt`,
      icon: Building2,
      color: 'green',
    },
    {
      label: 'Tổng người dùng',
      value: stats.totalUsers ?? 0,
      sub: 'Đang hoạt động',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Tổng đơn hàng',
      value: stats.totalOrders ?? 0,
      sub: 'Trên hệ thống',
      icon: ShoppingCart,
      color: 'indigo',
    },
    {
      label: 'Tăng trưởng',
      value: '+12%',
      sub: 'So với tháng trước',
      icon: TrendingUp,
      color: 'amber',
    },
  ] : [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard tổng quan</h1>
          <p className="page-subtitle">Theo dõi hoạt động toàn hệ thống BICAP</p>
        </div>
        <button className="btn-icon" onClick={load} title="Làm mới">
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
        </button>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="page-loading"><div className="loading-spinner-lg"></div></div>
      ) : (
        <>
          <div className="stats-grid">
            {cards.map(card => (
              <div key={card.label} className={`stat-card stat-card-${card.color}`}>
                <div className={`stat-icon stat-icon-${card.color}`}>
                  <card.icon size={22} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-sub">{card.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Bar chart - Orders */}
            <div className="section-card">
              <div className="section-card-header">
                <h3><ShoppingCart size={16} /> Đơn hàng theo tháng</h3>
              </div>
              <div className="chart-wrapper" style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_MONTHLY} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,.05)' }} />
                    <Bar dataKey="orders" name="Đơn hàng" fill="url(#barGreen)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area chart - Farms */}
            <div className="section-card">
              <div className="section-card-header">
                <h3><Building2 size={16} /> Trang trại đăng ký</h3>
              </div>
              <div className="chart-wrapper" style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_MONTHLY}>
                    <defs>
                      <linearGradient id="areaIndigo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="farms"
                      name="Trang trại"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#areaIndigo)"
                      dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick stats bottom */}
          {stats.pendingFarms > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '1.5px solid #fde68a',
              borderRadius: 12,
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>⚠️</span>
                <div>
                  <strong style={{ color: '#92400e', fontSize: 14 }}>
                    Có {stats.pendingFarms} trang trại đang chờ duyệt
                  </strong>
                  <p style={{ color: '#b45309', fontSize: 13, margin: 0 }}>Xem xét và phê duyệt để farm manager bắt đầu hoạt động</p>
                </div>
              </div>
              <a href="/admin/farms" className="btn-primary-sm" style={{ textDecoration: 'none', whiteSpace: 'nowrap', padding: '8px 16px' }}>
                Xem ngay →
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}