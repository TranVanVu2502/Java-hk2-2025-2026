import { useEffect, useState } from 'react';
import { adminService } from '../../api/services';
import toast from 'react-hot-toast';
import { Building2, CheckCircle, XCircle, Clock, Filter, RefreshCw, X } from 'lucide-react';

const STATUS_TABS = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Đã duyệt', value: 'APPROVED' },
    { label: 'Từ chối', value: 'REJECTED' },
];

const STATUS_META = {
    PENDING: { badge: 'badge-orange', label: 'Chờ duyệt' },
    APPROVED: { badge: 'badge-green', label: 'Đã duyệt' },
    REJECTED: { badge: 'badge-red', label: 'Từ chối' },
};

export default function AdminFarms() {
    const [farms, setFarms] = useState([]);
    const [tab, setTab] = useState('');
    const [loading, setLoading] = useState(true);
    const [rejectModal, setRejectModal] = useState(null); // farmId
    const [rejectReason, setRejectReason] = useState('');

    const load = () => {
        setLoading(true);
        adminService.getAllFarms(tab || undefined)
            .then((res) => setFarms(res.data))
            .catch(() => toast.error('Không thể tải danh sách trang trại'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [tab]);

    const handleApprove = async (farmId) => {
        try {
            await adminService.approveFarm(farmId);
            toast.success('Đã duyệt trang trại');
            load();
        } catch { toast.error('Thao tác thất bại'); }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return; }
        try {
            await adminService.rejectFarm(rejectModal, rejectReason);
            toast.success('Đã từ chối trang trại');
            setRejectModal(null);
            setRejectReason('');
            load();
        } catch { toast.error('Thao tác thất bại'); }
    };

    const rejectedFarm = farms.find((f) => f.farmId === rejectModal);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản lý trang trại</h1>
                    <p className="page-subtitle"><Building2 size={16} /> {farms.length} trang trại</p>
                </div>
                <button className="btn-icon" onClick={load}><RefreshCw size={18} /></button>
            </div>

            {/* Tabs */}
            <div className="tab-bar">
                {STATUS_TABS.map((t) => (
                    <button
                        key={t.value}
                        id={`farm-tab-${t.value || 'all'}`}
                        className={`tab-btn ${tab === t.value ? 'active' : ''}`}
                        onClick={() => setTab(t.value)}
                    >
                        {t.label}
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
                                <th>Tên trang trại</th>
                                <th>Chủ trang trại</th>
                                <th>Địa chỉ</th>
                                <th>Giấy phép KD</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {farms.length === 0 ? (
                                <tr><td colSpan={7} className="empty-row">Không có dữ liệu</td></tr>
                            ) : farms.map((farm, i) => {
                                const meta = STATUS_META[farm.status] || STATUS_META.PENDING;
                                return (
                                    <tr key={farm.farmId}>
                                        <td className="td-muted">{i + 1}</td>
                                        <td><strong>{farm.name}</strong></td>
                                        <td>{farm.ownerName}</td>
                                        <td className="td-muted">{farm.address}</td>
                                        <td className="td-muted td-truncate" title={farm.businessLicense}>{farm.businessLicense || '—'}</td>
                                        <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                                        <td>
                                            {farm.status === 'PENDING' && (
                                                <div className="action-group">
                                                    <button
                                                        id={`approve-farm-${farm.farmId}`}
                                                        className="btn-green-sm"
                                                        onClick={() => handleApprove(farm.farmId)}
                                                    >
                                                        <CheckCircle size={14} /> Duyệt
                                                    </button>
                                                    <button
                                                        id={`reject-farm-${farm.farmId}`}
                                                        className="btn-red-sm"
                                                        onClick={() => setRejectModal(farm.farmId)}
                                                    >
                                                        <XCircle size={14} /> Từ chối
                                                    </button>
                                                </div>
                                            )}
                                            {farm.status !== 'PENDING' && <span className="td-muted">—</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModal && rejectedFarm && (
                <div className="modal-overlay" onClick={() => setRejectModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header" style={{ borderBottom: '2px solid #fee2e2', paddingBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <XCircle size={24} style={{ color: '#dc2626' }} />
                                <h3 style={{ margin: 0, color: '#1f2937' }}>Từ chối trang trại</h3>
                            </div>
                            <button className="modal-close" onClick={() => setRejectModal(null)}><X size={20} /></button>
                        </div>

                        {/* Farm Info Card */}
                        <div style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            margin: '16px 0',
                            marginLeft: '24px',
                            marginRight: '24px',
                        }}>
                            <div style={{ marginBottom: '8px' }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Trang trại</p>
                                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1f2937' }}>{rejectedFarm.name}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                                <div>
                                    <p style={{ margin: '0 0 2px 0', color: '#6b7280', fontWeight: 500 }}>Chủ trang trại</p>
                                    <p style={{ margin: 0, color: '#374151' }}>{rejectedFarm.ownerName || '—'}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 2px 0', color: '#6b7280', fontWeight: 500 }}>Địa chỉ</p>
                                    <p style={{ margin: 0, color: '#374151' }}>{rejectedFarm.address || '—'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-body" style={{ paddingTop: 0 }}>
                            <label htmlFor="reject-reason" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                                Lý do từ chối <span className="required">*</span>
                            </label>
                            <textarea
                                id="reject-reason"
                                rows={5}
                                placeholder="Ví dụ: Thiếu giấy phép kinh doanh, địa chỉ không hợp lệ..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box',
                                    resize: 'vertical',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#dc2626'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; }}
                            />
                            {rejectReason.length > 0 && (
                                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                                    {rejectReason.length} ký tự
                                </p>
                            )}
                        </div>

                        <div className="modal-footer" style={{ gap: '12px', padding: '20px 24px' }}>
                            <button
                                className="btn-ghost-sm"
                                onClick={() => setRejectModal(null)}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    border: '1px solid #d1d5db',
                                    backgroundColor: '#fff',
                                    color: '#6b7280',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f3f4f6';
                                    e.target.style.borderColor = '#9ca3af';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#fff';
                                    e.target.style.borderColor = '#d1d5db';
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleReject}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    border: 'none',
                                    backgroundColor: '#dc2626',
                                    color: '#fff',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.3)',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#b91c1c';
                                    e.target.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#dc2626';
                                    e.target.style.boxShadow = '0 1px 3px rgba(220, 38, 38, 0.3)';
                                }}
                            >
                                <XCircle size={16} />
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}