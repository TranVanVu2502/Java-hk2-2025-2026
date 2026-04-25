import PublicHeader from "../../components/PublicHeader";
import { useEffect, useState } from 'react';
import { retailerService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Save, User, Building, MapPin, Store, Leaf, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function RetailerProfile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isRetailer = user?.role === 'RETAILER';
    const [form, setForm] = useState({
        name: '',
        businessLicense: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        retailerService.getMyInfo()
            .then(res => {
                if (res.data) {
                    setForm({
                        name: res.data.name || '',
                        businessLicense: res.data.businessLicense || '',
                        address: res.data.address || ''
                    });
                }
            })
            .catch(() => {
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            try {
                await retailerService.updateMyInfo(form);
                toast.success('Cập nhật thông tin thành công');
            } catch (err) {
                if (err.response && err.response.status === 500) {
                    // Fallback if not exists
                    await retailerService.create(form);
                    toast.success('Đã lưu thông tin bán lẻ');
                } else {
                    throw err;
                }
            }
        } catch (err) {
            toast.error('Lưu thông tin thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/products');
    };

    if (loading) return <div className="page-loading"><div className="loading-spinner-lg"></div></div>;

    return (
        <div className="public-page">
            <PublicHeader />

            <div className="container public-page-content">
                <div className="page">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Hồ sơ cá nhân</h1>
                            <p className="page-subtitle">Cập nhật thông tin doanh nghiệp</p>
                        </div>
                    </div>

                    <div className="section-card" style={{ width: 600, margin: '0 auto', marginTop: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--gray-200)' }}>
                            <div style={{ padding: 16, background: 'var(--green-50)', borderRadius: '50%', color: 'var(--green-600)' }}>
                                <Store size={32} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 18 }}>Hồ sơ Nhà Bán Lẻ</h2>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr', padding: '20px' }}>
                            <div className="form-group">
                                <label><Building size={16} /> Tên cửa hàng / Doanh nghiệp <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    required
                                    type="text"
                                    placeholder="VD: Cửa hàng Thực phẩm Sạch Xanh"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    style={{ padding: '12px 16px', fontSize: 15 }}
                                />
                            </div>

                            <div className="form-group">
                                <label><User size={16} /> Giấy phép kinh doanh (hoặc CCCD)</label>
                                <input
                                    type="text"
                                    placeholder="Nhập số giấy phép kinh doanh..."
                                    value={form.businessLicense}
                                    onChange={e => setForm({ ...form, businessLicense: e.target.value })}
                                    style={{ padding: '12px 16px', fontSize: 15 }}
                                />
                            </div>

                            <div className="form-group">
                                <label><MapPin size={16} /> Địa chỉ chi tiết <span style={{ color: 'red' }}>*</span></label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Nhập địa chỉ đầy đủ (Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP)..."
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                    style={{ padding: '12px 16px', fontSize: 15 }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={saving}
                                    style={{ padding: '12px 32px', fontSize: 15 }}
                                >
                                    {saving ? <span className="spinner white"></span> : <><Save size={18} /> Lưu Thay Đổi</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <footer className="public-footer">
                <div className="container">
                    <p>© 2025 BICAP — Blockchain Integration in Clean Agricultural Production</p>
                </div>
            </footer>
        </div>
    );
}