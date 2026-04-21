import { useEffect, useState } from 'react';
import { farmService, seasonService, productService, qrService } from '../../api/services';
import toast from 'react-hot-toast';
import { Building2, Plus, RefreshCw, X, Leaf, Calendar, Package, QrCode, ChevronRight, ArrowLeft } from 'lucide-react';

/* ────── Sub-components ────── */

function FarmForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', address: '', ownerName: '', businessLicense: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initial ? 'Chỉnh sửa trang trại' : 'Thêm trang trại mới'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body form-grid">
            {[
              { label: 'Tên trang trại *', name: 'name', required: true },
              { label: 'Địa chỉ', name: 'address' },
              { label: 'Chủ trang trại', name: 'ownerName' },
              { label: 'Giấy phép kinh doanh', name: 'businessLicense' },
            ].map((f) => (
              <div className="form-group" key={f.name}>
                <label>{f.label}</label>
                <input
                  id={`farm-${f.name}`}
                  type="text"
                  value={form[f.name]}
                  required={f.required}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.label}
                />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-ghost-sm" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner white"></span> : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SeasonForm({ farmId, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tạo mùa vụ mới</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body form-grid">
            <div className="form-group">
              <label>Tên mùa vụ *</label>
              <input id="season-name" type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Vụ Hè Thu 2025" />
            </div>
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input id="season-start" type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input id="season-end" type="date" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Mô tả quy trình</label>
              <textarea id="season-desc" rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả quy trình canh tác..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-ghost-sm" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner white"></span> : 'Tạo mùa vụ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductForm({ seasonId, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', quantity: '', price: '', seasonId });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave({ ...form, seasonId }); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Thêm sản phẩm</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body form-grid">
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Tên sản phẩm *</label>
              <input id="product-name" type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Dưa hấu, Lúa, Cà chua..." />
            </div>
            <div className="form-group">
              <label>Số lượng (kg) *</label>
              <input id="product-quantity" type="number" min="0" step="0.1" required value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Giá (VNĐ/kg)</label>
              <input id="product-price" type="number" min="0" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-ghost-sm" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner white"></span> : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ────── Main Component ────── */
export default function FarmManagerDashboard() {
  const [view, setView] = useState('farms'); // 'farms' | 'seasons' | 'products'
  const [farms, setFarms] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'farm' | 'season' | 'product'
  const [editFarm, setEditFarm] = useState(null);

  const loadFarms = () => {
    setLoading(true);
    farmService.getMyFarms()
      .then((res) => setFarms(res.data || []))
      .catch(() => toast.error('Không thể tải trang trại'))
      .finally(() => setLoading(false));
  };

  const loadSeasons = (farmId) => {
    setLoading(true);
    seasonService.getByFarm(farmId)
      .then((res) => setSeasons(res.data || []))
      .catch(() => toast.error('Không thể tải mùa vụ'))
      .finally(() => setLoading(false));
  };

  const loadProducts = async (seasonId) => {
    setLoading(true);
    // Products belonging to a season — filter by seasonId in API response
    productService.getAll(undefined, 0, 100)
      .then((res) => {
        const all = res.data?.content || [];
        setProducts(all.filter((p) => p.seasonId === seasonId));
      })
      .catch(() => toast.error('Không thể tải sản phẩm'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFarms(); }, []);

  const handleSelectFarm = (farm) => {
    setSelectedFarm(farm);
    loadSeasons(farm.farmId);
    setView('seasons');
  };

  const handleSelectSeason = (season) => {
    setSelectedSeason(season);
    loadProducts(season.seasonId);
    setView('products');
  };

  const handleAddFarm = async (formData) => {
    try {
      if (editFarm) {
        await farmService.update(editFarm.farmId, formData);
        toast.success('Đã cập nhật trang trại');
      } else {
        await farmService.create(formData);
        toast.success('Đã tạo trang trại');
      }
      setModal(null);
      setEditFarm(null);
      loadFarms();
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleAddSeason = async (formData) => {
    try {
      await seasonService.create(selectedFarm.farmId, formData);
      toast.success('Đã tạo mùa vụ');
      setModal(null);
      loadSeasons(selectedFarm.farmId);
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleAddProduct = async (formData) => {
    try {
      await productService.create(formData);
      toast.success('Đã thêm sản phẩm');
      setModal(null);
      loadProducts(selectedSeason.seasonId);
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleGenerateQR = async (productId) => {
    try {
      await qrService.generate(productId);
      toast.success('Đã tạo QR Code');
    } catch { toast.error('Không thể tạo QR Code'); }
  };

  const handleExportSeason = async (seasonId) => {
    try {
      await seasonService.export(seasonId);
      toast.success('Mùa vụ đã xuất thành công');
      if (selectedFarm) loadSeasons(selectedFarm.farmId);
    } catch { toast.error('Thao tác thất bại'); }
  };

  const STATUS_SEASON = {
    IN_PROGRESS: { badge: 'badge-blue', label: 'Đang canh tác' },
    EXPORTED: { badge: 'badge-green', label: 'Đã xuất' },
    CANCELLED: { badge: 'badge-red', label: 'Đã hủy' },
  };

  const STATUS_PRODUCT = {
    AVAILABLE: { badge: 'badge-green', label: 'Còn hàng' },
    SOLD_OUT: { badge: 'badge-orange', label: 'Hết hàng' },
    HIDDEN: { badge: 'badge-gray', label: 'Ẩn' },
  };

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button className={view === 'farms' ? 'breadcrumb-active' : 'breadcrumb-link'} onClick={() => { setView('farms'); setSelectedFarm(null); setSelectedSeason(null); }}>
          <Building2 size={14} /> Trang trại
        </button>
        {selectedFarm && (
          <>
            <ChevronRight size={14} />
            <button className={view === 'seasons' ? 'breadcrumb-active' : 'breadcrumb-link'} onClick={() => { setView('seasons'); setSelectedSeason(null); }}>
              <Leaf size={14} /> {selectedFarm.name}
            </button>
          </>
        )}
        {selectedSeason && (
          <>
            <ChevronRight size={14} />
            <span className="breadcrumb-active"><Package size={14} /> {selectedSeason.name}</span>
          </>
        )}
      </div>

      {/* ── FARMS VIEW ── */}
      {view === 'farms' && (
        <>
          <div className="page-header">
            <div>
              <h1 className="page-title">Trang trại của tôi</h1>
              <p className="page-subtitle">{farms.length} trang trại</p>
            </div>
            <div className="header-actions">
              <button className="btn-icon" onClick={loadFarms}><RefreshCw size={18} /></button>
              <button id="add-farm-btn" className="btn-primary" onClick={() => { setEditFarm(null); setModal('farm'); }}>
                <Plus size={18} /> Thêm trang trại
              </button>
            </div>
          </div>

          {loading ? <div className="page-loading"><div className="loading-spinner-lg"></div></div> :
            farms.length === 0 ? (
              <div className="empty-state">
                <Building2 size={56} />
                <h3>Chưa có trang trại nào</h3>
                <p>Thêm trang trại đầu tiên của bạn</p>
                <button className="btn-primary" onClick={() => setModal('farm')}><Plus size={16} /> Thêm trang trại</button>
              </div>
            ) : (
              <div className="card-grid">
                {farms.map((farm) => {
                  const statusColor = { APPROVED: '#10b981', PENDING: '#f59e0b', REJECTED: '#ef4444' }[farm.status] || '#6b7280';
                  return (
                    <div className="farm-card" key={farm.farmId}>
                      <div className="farm-card-header">
                        <div className="farm-card-icon">🌾</div>
                        <span className="badge" style={{ background: statusColor + '20', color: statusColor }}>
                          {farm.status}
                        </span>
                      </div>
                      <h3 className="farm-card-title">{farm.name}</h3>
                      <p className="farm-card-meta">📍 {farm.address || 'Chưa có địa chỉ'}</p>
                      <p className="farm-card-meta">👤 {farm.ownerName || '—'}</p>
                      <div className="farm-card-actions">
                        <button
                          id={`farm-seasons-${farm.farmId}`}
                          className="btn-primary-sm"
                          onClick={() => handleSelectFarm(farm)}
                          disabled={farm.status !== 'APPROVED'}
                        >
                          Xem mùa vụ
                        </button>
                        <button className="btn-ghost-sm" onClick={() => { setEditFarm(farm); setModal('farm'); }}>Sửa</button>
                      </div>
                      {farm.status !== 'APPROVED' && (
                        <p className="farm-pending-note">⏳ Trang trại cần được Admin duyệt trước</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          }
        </>
      )}

      {/* ── SEASONS VIEW ── */}
      {view === 'seasons' && selectedFarm && (
        <>
          <div className="page-header">
            <div>
              <h1 className="page-title">Mùa vụ — {selectedFarm.name}</h1>
              <p className="page-subtitle">{seasons.length} mùa vụ</p>
            </div>
            <div className="header-actions">
              <button id="add-season-btn" className="btn-primary" onClick={() => setModal('season')}>
                <Plus size={18} /> Tạo mùa vụ
              </button>
            </div>
          </div>

          {loading ? <div className="page-loading"><div className="loading-spinner-lg"></div></div> :
            seasons.length === 0 ? (
              <div className="empty-state">
                <Calendar size={56} />
                <h3>Chưa có mùa vụ nào</h3>
                <button className="btn-primary" onClick={() => setModal('season')}><Plus size={16} /> Tạo mùa vụ</button>
              </div>
            ) : (
              <div className="section-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tên mùa vụ</th>
                      <th>Ngày bắt đầu</th>
                      <th>Ngày kết thúc</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasons.map((s) => {
                      const meta = STATUS_SEASON[s.status] || STATUS_SEASON.IN_PROGRESS;
                      return (
                        <tr key={s.seasonId}>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.startDate || '—'}</td>
                          <td>{s.endDate || '—'}</td>
                          <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                          <td>
                            <div className="action-group">
                              <button id={`view-products-${s.seasonId}`} className="btn-primary-sm" onClick={() => handleSelectSeason(s)}>
                                Sản phẩm
                              </button>
                              {s.status === 'IN_PROGRESS' && (
                                <button id={`export-season-${s.seasonId}`} className="btn-success-sm" onClick={() => handleExportSeason(s.seasonId)}>
                                  Xuất mùa vụ
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </>
      )}

      {/* ── PRODUCTS VIEW ── */}
      {view === 'products' && selectedSeason && (
        <>
          <div className="page-header">
            <div>
              <h1 className="page-title">Sản phẩm — {selectedSeason.name}</h1>
              <p className="page-subtitle">{products.length} sản phẩm</p>
            </div>
            <button id="add-product-btn" className="btn-primary" onClick={() => setModal('product')}>
              <Plus size={18} /> Thêm sản phẩm
            </button>
          </div>

          {loading ? <div className="page-loading"><div className="loading-spinner-lg"></div></div> :
            products.length === 0 ? (
              <div className="empty-state">
                <Package size={56} />
                <h3>Chưa có sản phẩm nào</h3>
                <button className="btn-primary" onClick={() => setModal('product')}><Plus size={16} /> Thêm sản phẩm</button>
              </div>
            ) : (
              <div className="section-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tên sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Giá</th>
                      <th>Trạng thái</th>
                      <th>QR Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const meta = STATUS_PRODUCT[p.status] || STATUS_PRODUCT.AVAILABLE;
                      return (
                        <tr key={p.productId}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.quantity} kg</td>
                          <td>{p.price ? `${Number(p.price).toLocaleString('vi-VN')} ₫/kg` : '—'}</td>
                          <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                          <td>
                            <button
                              id={`gen-qr-${p.productId}`}
                              className="btn-outline-sm"
                              onClick={() => handleGenerateQR(p.productId)}
                            >
                              <QrCode size={14} /> Tạo QR
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </>
      )}

      {/* Modals */}
      {modal === 'farm' && (
        <FarmForm
          initial={editFarm ? { name: editFarm.name, address: editFarm.address, ownerName: editFarm.ownerName, businessLicense: editFarm.businessLicense } : null}
          onSave={handleAddFarm}
          onClose={() => { setModal(null); setEditFarm(null); }}
        />
      )}
      {modal === 'season' && (
        <SeasonForm farmId={selectedFarm?.farmId} onSave={handleAddSeason} onClose={() => setModal(null)} />
      )}
      {modal === 'product' && (
        <ProductForm seasonId={selectedSeason?.seasonId} onSave={handleAddProduct} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
