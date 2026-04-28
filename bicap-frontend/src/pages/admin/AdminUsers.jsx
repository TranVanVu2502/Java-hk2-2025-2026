import { useEffect, useState } from 'react';
import { adminService } from '../../api/services';
import toast from 'react-hot-toast';
import { Users, Lock, Unlock, Search, RefreshCw } from 'lucide-react';

const ROLE_LABELS = {
  ADMIN: { label: 'Admin', color: '#ef4444' },
  FARM_MANAGER: { label: 'Farm Manager', color: '#10b981' },
  RETAILER: { label: 'Retailer', color: '#3b82f6' },
  GUEST: { label: 'Guest', color: '#6b7280' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminService.getAllUsers()
      .then((res) => {
        setUsers(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error('Không thể tải danh sách người dùng'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter((u) =>
      u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const handleToggle = async (userId) => {
    try {
      await adminService.toggleLock(userId);
      toast.success('Đã cập nhật trạng thái người dùng');
      load();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý người dùng</h1>
          <p className="page-subtitle">
            <Users size={16} /> {users.length} tài khoản trong hệ thống
          </p>
        </div>
        <button className="btn-icon" onClick={load} title="Làm mới">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="section-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              id="user-search"
              type="text"
              placeholder="Tìm kiếm theo email hoặc vai trò..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner-lg"></div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">Không có dữ liệu</td></tr>
              ) : filtered.map((u, i) => {
                const roleMeta = ROLE_LABELS[u.role] || ROLE_LABELS.GUEST;
                return (
                  <tr key={u.userId}>
                    <td className="td-muted">{i + 1}</td>
                    <td><strong>{u.email}</strong></td>
                    <td>
                      <span className="role-tag" style={{ color: roleMeta.color, borderColor: roleMeta.color }}>
                        {roleMeta.label}
                      </span>
                    </td>
                    <td className="td-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>
                      <span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>
                        {u.active ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn-action ${u.active ? 'btn-danger-sm' : 'btn-success-sm'}`}
                        onClick={() => handleToggle(u.userId)}
                        id={`toggle-user-${u.userId}`}
                      >
                        {u.active ? <><Lock size={14}/> Khóa</> : <><Unlock size={14}/> Mở khóa</>}
                      </button>
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
