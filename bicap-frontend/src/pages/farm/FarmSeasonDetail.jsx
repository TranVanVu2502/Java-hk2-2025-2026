import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { seasonService, productService, qrService } from '../../api/services';
import { useFarm } from '../../context/FarmContext';
import { ArrowLeft, Package, QrCode, Plus, Upload, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_META = {
  IN_PROGRESS: { badge: 'badge-blue', label: 'Đang canh tác' },
  EXPORTED: { badge: 'badge-green', label: 'Đã xuất' },
  CANCELLED: { badge: 'badge-red', label: 'Đã hủy' },
};

export default function FarmSeasonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { myFarm } = useFarm();

  const [season, setSeason] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '' });
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', quantity: '', price: '', imageFile: null });
  const [addingProduct, setAddingProduct] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      seasonService.getById(id),
      productService.getAll(undefined, 0, 100),
    ]).then(([sRes, pRes]) => {
      const s = sRes.data;
      setSeason(s);
      setForm({ name: s.name || '', startDate: s.startDate || '', endDate: s.endDate || '', description: s.description || '' });
      const all = pRes.data?.content || [];
      setProducts(all.filter(p => p.seasonId === Number(id)));
    }).catch(() => navigate('/farm/seasons'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await seasonService.update(id, form);
      toast.success('Đã cập nhật mùa vụ');
      load();
    } catch { toast.error('Cập nhật thất bại'); }
    finally { setSaving(false); }
  };

  const handleExport = async () => {
    if (!confirm('Xuất mùa vụ sẽ đổi trạng thái thành EXPORTED và không thể hoàn tác. Tiếp tục?')) return;
    setExporting(true);
    try {
      await seasonService.export(id);
      toast.success('Mùa vụ đã được xuất thành công!');
      load();
    } catch { toast.error('Xuất mùa vụ thất bại'); }
    finally { setExporting(false); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddingProduct(true);
    try {
      // 1) create product
      const res = await productService.create({ 
        name: productForm.name, 
        quantity: Number(productForm.quantity), 
        price: productForm.price ? Number(productForm.price) : 0, 
        seasonId: Number(id) 
      });
      const created = res.data;

      // 2) if image selected, upload it
      if (productForm.imageFile && created && created.productId) {
        try {
          await productService.uploadImage(created.productId, productForm.imageFile);
        } catch (err) {
          console.warn('Image upload failed', err);
          toast.error('Tải ảnh thất bại nhưng sản phẩm đã được thêm');
        }
      }

      toast.success('Đã thêm sản phẩm');
      setShowProductForm(false);
      setProductForm({ name: '', quantity: '', price: '', imageFile: null });
      load();
    } catch (err) { console.error(err); toast.error('Thêm sản phẩm thất bại'); }
    finally { setAddingProduct(false); }
  };

  const handleGenerateQR = async (productId) => {
    try {
      const res = await qrService.generate(productId);
      toast.success('Đã tạo QR Code');
    } catch { toast.error('Không thể tạo QR'); }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner-lg"></div></div>;
  if (!season) return null;

  const meta = STATUS_META[season.status] || STATUS_META.IN_PROGRESS;
  const isEditable = season.status === 'IN_PROGRESS';

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/farm/seasons')}><ArrowLeft size={16} /></button>
          <div>
            <h1 className="page-title">{season.name}</h1>
            <p className="page-subtitle">
              <span className={`badge ${meta.badge}`}>{meta.label}</span>
            </p>
          </div>
        </div>
        {isEditable && (
          <div className="header-actions">
            <button id="export-season-btn" className="btn-success-sm" onClick={handleExport} disabled={exporting}>
              {exporting ? <span className="spinner"></span> : <><Upload size={14} /> Xuất mùa vụ</>}
            </button>
          </div>
        )}
      </div>

      <div className="season-detail-grid">
        {/* Left: edit form */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>Thông tin & Quy trình</h3>
          </div>
          <form onSubmit={handleSave} style={{ padding: '20px 22px' }}>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Tên mùa vụ</label>
                <input id="edit-season-name" type="text" value={form.name} disabled={!isEditable}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Ngày bắt đầu</label>
                <input id="edit-season-start" type="date" value={form.startDate} disabled={!isEditable}
                  onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc</label>
                <input id="edit-season-end" type="date" value={form.endDate} disabled={!isEditable}
                  onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Mô tả / Quy trình canh tác</label>
                <textarea id="edit-season-desc" rows={5} disabled={!isEditable}
                  placeholder="Ghi chép quy trình: gieo giống, bón phân, tưới nước, thu hoạch..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            {isEditable && (
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px', marginTop: 8 }} disabled={saving}>
                {saving ? <span className="spinner white"></span> : <><Save size={16} /> Lưu thay đổi</>}
              </button>
            )}
          </form>
        </div>

        {/* Right: products */}
        <div>
          <div className="section-card">
            <div className="section-card-header">
              <h3><Package size={18} /> Sản phẩm ({products.length})</h3>
              {isEditable && (
                <button id="add-product-btn" className="btn-primary-sm" onClick={() => setShowProductForm(true)}>
                  <Plus size={14} /> Thêm
                </button>
              )}
            </div>

            {showProductForm && (
              <div style={{ padding: '16px 22px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                <form onSubmit={handleAddProduct}>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label>Tên sản phẩm *</label>
                    <input id="new-product-name" type="text" required placeholder="VD: Dưa hấu"
                      value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Số lượng (kg)*</label>
                      <input id="new-product-qty" type="number" min="0" step="0.1" required
                        value={productForm.quantity} onChange={e => setProductForm({ ...productForm, quantity: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Giá (₫/kg)</label>
                      <input id="new-product-price" type="number" min="0"
                        value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: 8 }}>
                    <label>Ảnh sản phẩm</label>
                    <input id="new-product-image" type="file" accept="image/*"
                      onChange={e => setProductForm({ ...productForm, imageFile: e.target.files && e.target.files[0] })} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="button" className="btn-ghost-sm" onClick={() => setShowProductForm(false)}>Hủy</button>
                    <button type="submit" className="btn-primary-sm" disabled={addingProduct}>
                      {addingProduct ? <span className="spinner"></span> : 'Thêm sản phẩm'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {products.length === 0 ? (
              <div className="empty-table"><Package size={32} /><p>Chưa có sản phẩm nào</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th style={{ width: 88 }}>Ảnh</th><th>Tên</th><th>SL (kg)</th><th>Giá</th><th>QR</th></tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.productId}>
                      <td>
                        {p.imageUrl ? (
                          <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:8080${p.imageUrl}`} alt={p.name}
                            style={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                        ) : (
                          <div style={{ width: 72, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 6 }}>
                            📦
                          </div>
                        )}
                      </td>
                      <td><strong>{p.name}</strong></td>

                      <td>{p.quantity}</td>
                      <td className="td-muted">{p.price ? `${Number(p.price).toLocaleString('vi-VN')}₫` : '—'}</td>
                      <td>
                        <button id={`gen-qr-${p.productId}`} className="btn-outline-sm" style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => handleGenerateQR(p.productId)}>
                          <QrCode size={12} /> Tạo QR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {season.blockchainHash && (
            <div className="section-card" style={{ marginTop: 16 }}>
              <div className="section-card-header"><h3>🔗 Blockchain Hash</h3></div>
              <div style={{ padding: '12px 22px' }}>
                <p className="blockchain-hash">{season.blockchainHash}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
