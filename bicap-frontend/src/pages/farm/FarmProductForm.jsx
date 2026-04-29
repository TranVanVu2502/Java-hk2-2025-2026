import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, seasonService } from '../../api/services';
import { useFarm } from '../../context/FarmContext';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { myFarm } = useFarm();
    const isEdit = Boolean(id);
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

    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Tìm mùa vụ đang được chọn để kiểm tra trạng thái
    const selectedSeason = seasons.find(s => s.seasonId.toString() === form.seasonId.toString());
    const isLocked = selectedSeason?.status === 'EXPORTED';

    useEffect(() => {
        if (myFarm?.farmId) {
            seasonService.getByFarm(myFarm.farmId).then(res => {
                setSeasons(res.data || []);
            }).catch(() => { });
        }
    }, [myFarm]);

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
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
                })
                .catch(() => toast.error('Không tìm thấy sản phẩm'))
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.seasonId) {
            toast.error('Vui lòng chọn mùa vụ!');
            return;
        }

        setSaving(true);
        try {
            if (isEdit) {
                await productService.update(id, form);
                toast.success('Cập nhật thành công');
            } else {
                await productService.create(form);
                toast.success('Thêm sản phẩm thành công');
            }
            navigate('/farm/products');
        } catch (err) {
            toast.error(err.message || 'Lỗi khi lưu sản phẩm');
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (e) => {
        if (isLocked) return;
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
                        <h1 className="page-title">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
                        {isLocked && <span className="badge badge-green">Dữ liệu đã niêm phong - Hạn chế chỉnh sửa</span>}
                    </div>
                </div>
            </div>

            <form className="section-card" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
                <div className="form-grid" style={{ padding: '24px', gridTemplateColumns: '1fr 2fr' }}>
                    {/* Cột trái: Upload ảnh */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ảnh sản phẩm</label>
                        <div
                            style={{
                                border: '2px dashed var(--gray-300)', borderRadius: 8, padding: 40,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                                background: 'var(--gray-50)', cursor: isLocked ? 'default' : 'pointer'
                            }}
                            onClick={() => !isLocked && document.getElementById('img-upload').click()}
                        >
                            {form.imageUrl ? (
                                <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }} />
                            ) : (
                                <>
                                    <UploadCloud size={48} color="var(--gray-400)" />
                                    <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Tải ảnh lên</span>
                                </>
                            )}
                        </div>
                        <input id="img-upload" type="file" style={{ display: 'none' }} onChange={handleImageChange} disabled={isLocked} />
                    </div>

                    {/* Cột phải: Thông tin */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tên sản phẩm <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    required
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    disabled={isLocked}
                                />
                            </div>
                            <div className="form-group">
                                <label>Thuộc mùa vụ <span style={{ color: 'red' }}>*</span></label>
                                <select
                                    required
                                    value={form.seasonId}
                                    onChange={e => setForm({ ...form, seasonId: e.target.value })}
                                    disabled={isLocked}
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
                                    value={form.quantity}
                                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                                    disabled={isLocked}
                                />
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