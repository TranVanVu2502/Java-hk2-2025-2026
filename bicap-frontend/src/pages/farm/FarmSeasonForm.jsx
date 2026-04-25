import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { seasonService } from '../../api/services';
import { useFarm } from '../../context/FarmContext';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_META = {
    IN_PROGRESS: { badge: 'badge-blue', label: 'Đang canh tác' },
    EXPORTED: { badge: 'badge-green', label: 'Đã xuất' },
    CANCELLED: { badge: 'badge-red', label: 'Đã hủy' },
};

export default function FarmSeasonForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { myFarm } = useFarm();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name: '',
        startDate: '',
        endDate: '',
        description: '',
    });

    const [season, setSeason] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            seasonService.getById(id)
                .then(res => {
                    const s = res.data;
                    setSeason(s);
                    setForm({
                        name: s.name || '',
                        startDate: s.startDate || '',
                        endDate: s.endDate || '',
                        description: s.description || '',
                    });
                })
                .catch(() => {
                    toast.error('Không tìm thấy mùa vụ');
                    navigate('/farm/seasons');
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!myFarm?.farmId) {
            toast.error('Không tìm thấy thông tin trang trại');
            return;
        }

        setSaving(true);
        try {
            if (isEdit) {
                await seasonService.update(id, form);
                toast.success('Cập nhật thành công');
            } else {
                await seasonService.create(myFarm.farmId, form);
                toast.success('Thêm mùa vụ thành công');
            }
            navigate('/farm/seasons');
        } catch {
            toast.error('Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        if (!confirm('Xuất mùa vụ sẽ đổi trạng thái thành EXPORTED và không thể hoàn tác. Tiếp tục?')) return;
        setExporting(true);
        try {
            await seasonService.export(id);
            toast.success('Mùa vụ đã được xuất thành công!');
            navigate('/farm/seasons');
        } catch { toast.error('Xuất mùa vụ thất bại'); }
        finally { setExporting(false); }
    };

    if (loading) return <div className="page-loading"><div className="loading-spinner-lg"></div></div>;

    const meta = season ? (STATUS_META[season.status] || STATUS_META.IN_PROGRESS) : null;
    const isEditable = !isEdit || (season && season.status === 'IN_PROGRESS');

    return (
        <div className="page">
            <div className="page-header" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="back-btn" onClick={() => navigate('/farm/seasons')}>
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="page-title">{isEdit ? (season?.name || 'Chi tiết mùa vụ') : 'Thêm Mùa Vụ'}</h1>
                        <p className="page-subtitle">
                            {isEdit && meta
                                ? <span className={`badge ${meta.badge}`}>{meta.label}</span>
                                : 'Mùa vụ > Thêm mới'}
                        </p>
                    </div>
                </div>
                {isEdit && isEditable && (
                    <div className="header-actions">
                        <button id="export-season-btn" className="btn-success-sm" onClick={handleExport} disabled={exporting}>
                            {exporting ? <span className="spinner"></span> : <><Upload size={14} /> Xuất mùa vụ</>}
                        </button>
                    </div>
                )}
            </div>

            <form className="section-card" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
                <div className="section-card-header">
                    <h3>Thông tin mùa vụ</h3>
                </div>
                <div style={{ padding: '24px 32px' }}>
                    <table className="form-table">
                        <tbody>
                            <tr>
                                <td>Tên mùa vụ <span style={{ color: 'red' }}>*</span></td>
                                <td>
                                    <div className="form-group">
                                        <input id="season-name" required type="text" placeholder="VD: Vụ Hè Thu 2025"
                                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            disabled={!isEditable} />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Ngày bắt đầu</td>
                                <td>
                                    <div className="form-group">
                                        <input id="season-start" type="date" value={form.startDate}
                                            onChange={e => setForm({ ...form, startDate: e.target.value })}
                                            disabled={!isEditable} />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Ngày kết thúc</td>
                                <td>
                                    <div className="form-group">
                                        <input id="season-end" type="date" value={form.endDate}
                                            onChange={e => setForm({ ...form, endDate: e.target.value })}
                                            disabled={!isEditable} />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Mô tả quy trình</td>
                                <td>
                                    <div className="form-group">
                                        <textarea id="season-desc" placeholder="Nhập mô tả quy trình canh tác..." rows={5}
                                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                            disabled={!isEditable} />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {isEditable && (
                    <div style={{ borderTop: '1px solid var(--gray-200)', padding: '20px 32px', display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'var(--gray-50)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
                        <button type="button" className="btn-ghost" onClick={() => navigate('/farm/seasons')}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 28px' }} disabled={saving}>
                            {saving ? <span className="spinner white" /> : <><Save size={18} /> {isEdit ? 'Cập nhật' : 'Tạo mùa vụ'}</>}
                        </button>
                    </div>
                )}
            </form>

            {isEdit && season?.blockchainHash && (
                <div className="section-card" style={{ marginTop: 16 }}>
                    <div className="section-card-header"><h3>🔗 Blockchain Hash</h3></div>
                    <div style={{ padding: '12px 22px' }}>
                        <p className="blockchain-hash">{season.blockchainHash}</p>
                    </div>
                </div>
            )}
        </div>
    );
}