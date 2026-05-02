import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, seasonService } from '../../api/services';
import { useFarm } from '../../context/FarmContext';
import { ArrowLeft, Save, UploadCloud, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:8080';

export default function FarmProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { myFarm } = useFarm();
    const [imageFile, setImageFile] = useState(null);

    const [form, setForm] = useState({
        name: '',
        seasonId: '',
        quantity: '',
        price: '',
        imageUrl: '',
        description: '',
        status: 'HIDDEN'
    });

    const [originalQuantity, setOriginalQuantity] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const getFullImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        return `${BASE_URL}${url}`;
    };

    // Kiểm tra trạng thái niêm phong của mùa vụ
    const selectedSeason = seasons.find(s => s.seasonId.toString() === form.seasonId.toString());
    const isLocked = selectedSeason?.status === 'EXPORTED';

    useEffect(() => {
        if (!id) {
            navigate('/farm/products');
            return;
        }

        if (myFarm?.farmId) {
            seasonService.getByFarm(myFarm.farmId).then(res => {
                setSeasons(res.data || []);
            }).catch(() => { });
        }
    }, [myFarm, id]);

    useEffect(() => {
        if (id) {
            productService.getById(id)
                .then(res => {
                    const prod = res.data;
                    setForm({
                        name: prod.name || '',
                        seasonId: prod.seasonId?.toString() || '',
                        quantity: prod.quantity || '',
                        price: prod.price || '',
                        imageUrl: prod.imageUrl || '',
                        description: prod.description || '',
                    });
                    setOriginalQuantity(prod.quantity);
                })
                .catch(() => {
                    toast.error('Không tìm thấy sản phẩm');
                    navigate('/farm/products');
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.seasonId) {
            toast.error('Vui lòng chọn mùa vụ!');
            return;
        }

        // Bảo vệ số lượng đã niêm phong
        if (isLocked && Number(form.quantity) > Number(originalQuantity)) {
            toast.error(`Số lượng không được vượt quá ${originalQuantity}kg đã niêm phong trên Blockchain`);
            return;
        }

        setSaving(true);
        try {
            await productService.update(id, form);
            toast.success('Cập nhật sản phẩm thành công');

            if (imageFile) {
                await productService.uploadImage(id, imageFile);
                toast.success('Đã tải ảnh lên thành công');
            }

            navigate('/farm/products');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Lỗi khi lưu sản phẩm');
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setForm(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
    };

    if (loading) return <div className="page-loading"><div className="loading-spinner-lg"></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="back-btn" onClick={() => navigate('/farm/products')}><ArrowLeft size={16} /></button>
                    <div>
                        <h1 className="page-title">Sửa sản phẩm</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <p className="page-subtitle">Mã sản phẩm: #{id}</p>
                            {isLocked && (
                                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ShieldCheck size={12} /> Blockchain Verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <form className="section-card" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
                {isLocked && (
                    <div style={{ padding: '12px 24px', background: '#ecfdf5', borderBottom: '1px solid #d1fae5', color: '#065f46', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldCheck size={16} />
                        Thông tin định danh (Tên, Mùa vụ) đã được niêm phong trên Blockchain và không thể thay đổi.
                    </div>
                )}

                <div className="form-grid" style={{ padding: '24px', gridTemplateColumns: '1fr 2fr' }}>
                    <div>
                        <label style={{ marginBottom: 8, fontWeight: 500 }}>Ảnh sản phẩm</label>
                        <div
                            style={{
                                border: '2px dashed var(--gray-300)', borderRadius: 8, padding: 40,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                                background: 'var(--gray-50)', cursor: 'pointer',
                                height: '280px', justifyContent: 'center'
                            }}
                            onClick={() => document.getElementById('img-upload').click()}
                        >
                            {form.imageUrl ? (
                                <img src={getFullImageUrl(form.imageUrl)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                            ) : (
                                <>
                                    <UploadCloud size={48} color="var(--gray-400)" />
                                    <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Tải ảnh lên</span>
                                </>
                            )}
                        </div>
                        <input id="img-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tên sản phẩm <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    required
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Thuộc mùa vụ <span style={{ color: 'red' }}>*</span></label>
                                <select
                                    required
                                    value={form.seasonId}
                                    onChange={e => setForm({ ...form, seasonId: e.target.value })}
                                >
                                    <option value="">-- Chọn mùa vụ --</option>
                                    {seasons.map(s => (
                                        <option key={s.seasonId} value={s.seasonId}>{s.name} ({s.status})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Giá bán (VNĐ) <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Số lượng (kg) <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    max={isLocked ? originalQuantity : undefined}
                                    value={form.quantity}
                                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                                    title={isLocked ? `Tối đa ${originalQuantity}kg theo niêm phong` : ""}
                                />
                                {isLocked && <small style={{ color: '#6b7280' }}>Tối đa: {originalQuantity}kg (Blockchain)</small>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mô tả chi tiết</label>
                            <textarea
                                rows={5}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--gray-200)', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button type="button" className="btn-ghost" onClick={() => navigate('/farm/products')}>Hủy</button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? <span className="spinner white" /> : <><Save size={16} /> Lưu thay đổi</>}
                    </button>
                </div>
            </form>
        </div>
    );
}