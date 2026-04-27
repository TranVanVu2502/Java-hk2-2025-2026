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
    });

    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

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
                        seasonId: prod.seasonId || '',
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
            let productId = id;
            if (isEdit) {
                await productService.update(id, form);
                toast.success('Cập nhật thành công');
            } else {
                const res = await productService.create(form);
                productId = res.data.productId;
                toast.success('Thêm sản phẩm thành công');
            }

            if (imageFile && productId) {
                await productService.uploadImage(productId, imageFile);
            }

            navigate('/farm/products');
        } catch (err) {
            toast.error('Lưu thất bại hoặc Backend chưa hỗ trợ');
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
            <div className="page-header" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 16 }}>
                <div>
                    <h1 className="page-title">{isEdit ? 'Sửa' : 'Thêm'}</h1>
                    <p className="page-subtitle">{isEdit ? 'Cập nhật sản phẩm' : 'Thêm mới sản phẩm'}</p>
                </div>
            </div>

            <form className="section-card" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
                <div className="form-grid" style={{ padding: '24px', gridTemplateColumns: '1fr 2fr' }}>
                    {/* Cột trái: Upload ảnh */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ảnh đại diện</label>
                        <div
                            style={{
                                border: '2px dashed var(--gray-300)', borderRadius: 8, padding: 40,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                                background: 'var(--gray-50)', cursor: 'pointer'
                            }}
                            onClick={() => document.getElementById('img-upload').click()}
                        >
                            {form.imageUrl ? (
                                <img src={form.imageUrl.startsWith('blob:') || form.imageUrl.startsWith('http') ? form.imageUrl : `http://localhost:8080${form.imageUrl}`} alt="preview" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }} />
                            ) : (
                                <>
                                    <UploadCloud size={48} color="var(--gray-400)" />
                                    <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Thêm ảnh đại diện</span>
                                </>
                            )}
                        </div>
                        <input id="img-upload" type="file" style={{ display: 'none' }} onChange={handleImageChange} />
                    </div>

                    {/* Cột phải: Thông tin */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tên sản phẩm <span style={{ color: 'red' }}>*</span></label>
                                <input required type="text" placeholder="Nhập tên sản phẩm"
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Thuộc mùa vụ <span style={{ color: 'red' }}>*</span></label>
                                <select required value={form.seasonId} onChange={e => setForm({ ...form, seasonId: e.target.value })}>
                                    <option value="">-- Chọn mùa vụ --</option>
                                    {seasons.map(s => (
                                        <option key={s.seasonId} value={s.seasonId}>{s.name} ({s.year})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Giá (VNĐ) <span style={{ color: 'red' }}>*</span></label>
                                <input required type="number" placeholder="Nhập giá" min="0"
                                    value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Số lượng (kg) <span style={{ color: 'red' }}>*</span></label>
                                <input required type="number" placeholder="Nhập số lượng" min="0" step="0.1"
                                    value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mô tả chi tiết</label>
                            <textarea placeholder="Nhập mô tả sản phẩm..." rows={5}
                                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--gray-200)', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button type="button" className="btn-ghost" onClick={() => navigate('/farm/products')}>
                        Quay lại
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? <span className="spinner white" /> : <><Save size={16} /> Lưu</>}
                    </button>
                </div>
            </form>
        </div>
    );
}