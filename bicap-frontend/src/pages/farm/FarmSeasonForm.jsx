import { Connex } from '@vechain/connex';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { seasonService, productService } from '../../api/services';
import { useFarm } from '../../context/FarmContext';
import { Save, Plus, Trash2, CheckCircle, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_META = {
    IN_PROGRESS: { badge: 'badge-blue', label: 'Đang canh tác' },
    HARVESTED: { badge: 'badge-orange', label: 'Đã thu hoạch' },
    EXPORTED: { badge: 'badge-green', label: 'Đã niêm phong (Blockchain)' },
};

export default function FarmSeasonForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { myFarm } = useFarm();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '' });
    const [season, setSeason] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [tempImageFile, setTempImageFile] = useState(null);
    const [tempImageUrl, setTempImageUrl] = useState('');
    const [productForm, setProductForm] = useState({ name: '', quantity: '', price: '', description: '' });

    useEffect(() => { if (isEdit) loadSeasonData(); }, [id]);

    const loadSeasonData = async () => {
        setLoading(true);
        try {
            const res = await seasonService.getById(id);
            setSeason(res.data);
            setForm({
                name: res.data.name || '',
                startDate: res.data.startDate || '',
                endDate: res.data.endDate || '',
                description: res.data.description || '',
                blockchainHash: res.data.blockchainHash || ''
            });
            setProducts(res.data.products || []);
        } catch (error) {
            toast.error('Không tìm thấy thông tin mùa vụ');
            navigate('/farm/seasons');
        } finally { setLoading(false); }
    };

    // Hàm băm dữ liệu SHA-256
    const sha256 = async (message) => {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!window.confirm(`Xác nhận chuyển trạng thái sang: ${STATUS_META[newStatus].label}?`)) return;
        setSaving(true);
        try {
            await seasonService.update(id, { ...form, status: newStatus });
            toast.success('Cập nhật trạng thái thành công');
            loadSeasonData();
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái');
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setTempImageFile(file);
        setTempImageUrl(URL.createObjectURL(file));
    };

    const handleQuickAddProduct = async (e) => {
        e.preventDefault();
        if (!productForm.name || !productForm.quantity) return toast.error("Vui lòng nhập tên và số lượng");
        setSaving(true);
        try {
            const payload = { ...productForm, seasonId: id, farmId: myFarm.farmId, status: 'HIDDEN' };
            const res = await productService.create(payload);
            if (tempImageFile && res.data.productId) await productService.uploadImage(res.data.productId, tempImageFile);
            toast.success("Đã thêm sản phẩm");
            setProductForm({ name: '', quantity: '', price: '', description: '' });
            setTempImageFile(null);
            setTempImageUrl('');
            setIsAddingProduct(false);
            loadSeasonData();
        } catch (error) { toast.error("Lỗi khi thêm sản phẩm"); }
        finally { setSaving(false); }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Xác nhận xóa sản phẩm này?")) return;
        try {
            await productService.delete(productId);
            toast.success("Đã xóa");
            loadSeasonData();
        } catch (error) { toast.error("Không thể xóa"); }
    };

    const addProgressStep = async (stepText, customDate) => {
        if (!stepText.trim()) return;
        const dateToRecord = customDate ? new Date(customDate).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN');
        const newStep = `${stepText}\n[${dateToRecord}]`;

        const updatedDescription = form.description ? `${form.description}\n\n${newStep}` : newStep;

        try {
            await seasonService.update(id, { ...form, description: updatedDescription });
            setForm(prev => ({ ...prev, description: updatedDescription }));
            toast.success("Đã ghi nhật ký");
        } catch {
            toast.error("Lỗi khi đồng bộ dữ liệu nhật ký");
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await seasonService.update(id, form);
                toast.success('Đã cập nhật dữ liệu');
                loadSeasonData();
            } else {
                const res = await seasonService.create(myFarm.farmId, { ...form, status: 'IN_PROGRESS' });
                toast.success('Đã tạo mùa vụ thành công!');
                return navigate(`/farm/seasons/${res.data.seasonId}`);
            }
        } catch { toast.error('Lưu thất bại'); }
        finally { setSaving(false); }
    };

    const handleExport = async () => {
        if (products.length === 0) return toast.error('Cần ít nhất một sản phẩm để niêm phong!');
        if (!confirm('Sau khi Niêm phong, bạn KHÔNG THỂ SỬA thông tin quan trọng. Tiếp tục?')) return;

        setExporting(true);
        const toastId = toast.loading('Đang tính toán mã băm & ký niêm phong...');
        try {
            const connex = window.connex || new Connex({ node: 'https://node-testnet.vechain.energy', network: 'test' });

            const logLines = form.description
                ? form.description.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "")
                : [];
            const finalHash = await sha256(logLines.join(''));

            const sealId = `BICAP_SEAL_${id}_PROD_${products.length}`;
            const productList = products.map(p => ({ id: p.productId, name: p.name }));

            const sealPayload = {
                type: 'EXPORTED',
                sealId: sealId,
                seasonId: id,
                seasonName: form.name,
                finalHash: finalHash,
                products: productList,
                ts: new Date().toISOString()
            };

            const hexData = '0x' + Array.from(new TextEncoder().encode(JSON.stringify(sealPayload))).map(b => b.toString(16).padStart(2, '0')).join('');

            const result = await connex.vendor.sign('tx', [{
                to: '0x0000000000000000000000000000000000000000',
                value: '0x0',
                data: hexData
            }]).comment(`Xác nhận XUẤT KHO: ${sealId}`).request();

            await seasonService.export(id, result.txid, finalHash);
            toast.success('Niêm phong & Xuất kho thành công!', { id: toastId });
            loadSeasonData();
        } catch (error) {
            toast.error('Giao dịch thất bại hoặc bị hủy', { id: toastId });
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div className="page-loading"><div className="loading-spinner-lg"></div></div>;

    const status = season?.status || 'IN_PROGRESS';
    const isExported = status === 'EXPORTED';
    const isHarvested = status === 'HARVESTED';
    const isInProgress = status === 'IN_PROGRESS';

    return (
        <div className="page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div>
                        <h1 className="page-title">{isEdit ? (form.name || 'Đang tải...') : 'Thêm Mùa Vụ'}</h1>
                        <span className={`badge ${STATUS_META[status].badge}`}>{STATUS_META[status].label}</span>
                    </div>
                </div>
                {isEdit && !isExported && (
                    <div className="header-actions" style={{ display: 'flex', gap: 10 }}>
                        {isInProgress && (
                            <button type="button" className="btn-primary" onClick={() => handleUpdateStatus('HARVESTED')}>
                                <CheckCircle size={14} /> Xác nhận Thu hoạch
                            </button>
                        )}
                        {isHarvested && (
                            <button type="button" className="btn-primary" onClick={handleExport} disabled={exporting}>
                                {exporting ? <span className="spinner"></span> : <><Upload size={14} /> Niêm phong & Xuất kho</>}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, marginTop: 20 }}>
                <form className="section-card" onSubmit={handleSubmit}>
                    <div className="section-card-header"><h3>Thông tin canh tác</h3></div>
                    <div style={{ padding: 24 }}>
                        <div className="form-group">
                            <label>Tên mùa vụ</label>
                            <input required className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={!isInProgress} />
                        </div>
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label>Ngày bắt đầu</label>
                            <input type="date" required className="form-control" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} disabled={!isInProgress} />
                        </div>
                        {isInProgress && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 20, width: 'fit-content' }}>
                                    <Save size={18} /> {isEdit ? 'Lưu thông tin' : 'Tạo mùa vụ'}
                                </button>
                            </div>
                        )}
                    </div>
                </form>

                <div className="section-card">
                    <div className="section-card-header"><h3>Nhật ký canh tác</h3></div>
                    <div style={{ padding: 24 }}>
                        <div className="log-display-area" style={{ height: '200px', overflowY: 'auto', background: '#f9fafb', padding: 16, borderRadius: 12, fontSize: 13, whiteSpace: 'pre-wrap', border: '1px solid #eee', marginBottom: (isInProgress && isEdit) ? 16 : 0 }}>
                            {isEdit ? (form.description || "Chưa có hoạt động") : "Nhật ký sẽ khả dụng sau khi bạn tạo mùa vụ."}
                        </div>
                        {isInProgress && isEdit && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16, borderTop: '1px solid #eee', paddingTop: 16 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className="form-group">
                                        <textarea
                                            id="quick-log-input"
                                            className="form-control"
                                            placeholder="VD: Bón phân NPK..."
                                            rows={1}
                                            style={{ minHeight: '42px', resize: 'none', overflow: 'hidden' }}
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <input id="log-date" type="date" className="form-control" style={{ height: '42px' }} defaultValue={new Date().toISOString().split('T')[0]} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-primary" onClick={() => {
                                        const input = document.getElementById('quick-log-input');
                                        const date = document.getElementById('log-date').value;
                                        if (input.value.trim()) {
                                            addProgressStep(input.value, date);
                                            input.value = '';
                                            input.style.height = '42px'; // Reset height
                                        }
                                    }}>
                                        Ghi nhật ký
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isEdit && (isHarvested || isExported) && (
                    <div className="section-card" style={{ gridColumn: '1 / -1' }}>
                        <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Sản phẩm thu hoạch</h3>
                            {isHarvested && !isAddingProduct && (
                                <button className="btn-ghost-sm" onClick={() => setIsAddingProduct(true)}>
                                    <Plus size={14} /> Thêm sản phẩm
                                </button>
                            )}
                        </div>
                        <div style={{ padding: 24 }}>
                            {isAddingProduct && (
                                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
                                    <div style={{ display: 'flex', gap: 20 }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div
                                                style={{ width: 80, height: 80, borderRadius: 8, background: '#fff', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
                                                onClick={() => document.getElementById('quick-img-upload').click()}
                                            >
                                                {tempImageUrl ? <img src={tempImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={24} color="#94a3b8" />}
                                            </div>
                                            <input id="quick-img-upload" type="file" style={{ display: 'none' }} onChange={handleImageChange} accept="image/*" />
                                        </div>
                                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                                            <div className="form-group"><label>Tên sản phẩm</label><input className="form-control" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} /></div>
                                            <div className="form-group"><label>Số lượng (kg)</label><input className="form-control" type="number" value={productForm.quantity} onChange={e => setProductForm({ ...productForm, quantity: e.target.value })} /></div>
                                            <div className="form-group"><label>Giá (đ/kg)</label><input className="form-control" type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} /></div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                                        <button className="btn-ghost-sm" onClick={() => setIsAddingProduct(false)}>Hủy</button>
                                        <button className="btn-primary" style={{ width: 'fit-content' }} onClick={handleQuickAddProduct} disabled={saving}>Xác nhận thêm</button>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                                {products.length === 0 ? (
                                    <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>Chưa có sản phẩm.</p>
                                ) : (
                                    products.map(p => (
                                        <div key={p.productId} style={{ display: 'flex', gap: 12, padding: 12, background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, alignItems: 'center' }}>
                                            <div style={{ width: 50, height: 50, borderRadius: 8, background: '#f8fafc', overflow: 'hidden', border: '1px solid #eee', flexShrink: 0 }}>
                                                {p.imageUrl ? <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:8080${p.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={20} color="#cbd5e1" style={{ margin: '15px auto' }} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>{p.quantity} kg • {p.price?.toLocaleString()} đ/kg</div>
                                            </div>
                                            {isHarvested && (
                                                <button onClick={() => handleDeleteProduct(p.productId)} className="text-red" style={{ padding: 8 }}><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}