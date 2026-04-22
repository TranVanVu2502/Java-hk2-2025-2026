import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Search, ShoppingBag, Leaf, QrCode, ChevronRight, LogOut } from 'lucide-react';

const STATUS_META = {
  AVAILABLE: { badge: 'badge-green', label: 'Còn hàng' },
  SOLD_OUT: { badge: 'badge-orange', label: 'Hết hàng' },
  HIDDEN: { badge: 'badge-gray', label: 'Ẩn' },
};

const EMOJI_MAP = [];

export default function ProductsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/products');
  };

  const load = (q = search, p = page) => {
    setLoading(true);
    productService.getAll(q || undefined, p, 12)
      .then(res => {
        setProducts(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 0);
        setTotalElements(res.data?.totalElements || 0);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  return (
    <div className="public-page">
      {/* Header */}
      <header className="public-header">
        <div className="container">
          <div className="public-header-inner">
            <Link to="/" className="auth-logo" style={{ textDecoration: 'none' }}>
              <div className="logo-icon logo-sm"><Leaf size={18} /></div>
              <span className="logo-text">BICAP</span>
            </Link>
            <nav className="guest-nav">
              <Link to="/products" className="guest-nav-link active">Sản phẩm</Link>
              <Link to="/qr" className="guest-nav-link">Tra cứu QR</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero search */}
      <section className="products-hero">
        <div className="container">
          <h1 className="products-hero-title">Nông sản sạch <span className="gradient-text">có truy xuất nguồn gốc</span></h1>
          <form onSubmit={handleSearch} className="products-search-form">
            <div className="qr-input-group">
              <Search size={20} className="qr-input-icon" />
              <input
                id="product-search-input"
                type="text"
                className="qr-input"
                placeholder="Tìm kiếm sản phẩm: dưa hấu, cà chua, lúa..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <button type="submit" className="qr-search-btn">
                <Search size={18} /> Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Products grid */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="products-list-header">
            <span className="products-count">{totalElements} sản phẩm{search && ` cho "${search}"`}</span>
          </div>

          {loading ? (
            <div className="page-loading"><div className="loading-spinner-lg"></div></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={56} />
              <h3>Không tìm thấy sản phẩm nào</h3>
              <p>Thử từ khóa khác hoặc xem tất cả sản phẩm</p>
              <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}
                onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <>
              <div className="pub-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {products.map((p, i) => {
                  const meta = STATUS_META[p.status] || STATUS_META.AVAILABLE;
                  return (
                    <div
                      className="pub-product-card"
                      key={p.productId}
                      onClick={() => navigate(`/products/${p.productId}`)}
                      style={{
                        background: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Product Image */}
                      <div style={{
                        height: '200px',
                        backgroundColor: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:8080${p.imageUrl}`}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '48px' }}>
                            {EMOJI_MAP[i % EMOJI_MAP.length]}
                          </span>
                        )}
                      </div>

                      {/* Product Body */}
                      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
                        {/* Status Badge */}
                        <div style={{ marginBottom: '12px' }}>
                          <span className={`badge ${meta.badge}`} style={{ fontSize: '12px' }}>{meta.label}</span>
                        </div>

                        {/* Product Name */}
                        <h3 style={{
                          margin: '0 0 8px 0',
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#1f2937',
                          lineHeight: '1.3',
                        }}>
                          {p.name}
                        </h3>

                        {/* Farm Info - NEW */}
                        {p.farmName && (
                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            marginBottom: '12px',
                            padding: '8px 12px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '6px',
                            borderLeft: '3px solid #10b981',
                          }}>
                            <p style={{ margin: '0 0 2px 0', fontWeight: 600, color: '#4b5563' }}>Từ trang trại</p>
                            <p style={{ margin: 0, color: '#6b7280' }}>{p.farmName}</p>
                          </div>
                        )}

                        {/* Quantity */}
                        <div style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          marginBottom: '12px',
                        }}>
                          📦 Sẵn có: <strong style={{ color: '#1f2937' }}>{p.quantity} kg</strong>
                        </div>

                        {/* Price - Bottom */}
                        <div style={{
                          marginTop: 'auto',
                          paddingTop: '12px',
                          borderTop: '1px solid #e5e7eb',
                          paddingBottom: 0,
                        }}>
                          <div style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#10b981',
                            marginBottom: '12px',
                          }}>
                            {p.price ? `${Number(p.price).toLocaleString('vi-VN')} ₫/kg` : 'Liên hệ'}
                          </div>

                          <button style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s',
                          }}
                            onMouseEnter={(e) => { e.target.style.backgroundColor = '#059669'; }}
                            onMouseLeave={(e) => { e.target.style.backgroundColor = '#10b981'; }}
                            onClick={(e) => { e.stopPropagation(); navigate(`/products/${p.productId}`); }}>
                            Xem chi tiết
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination" style={{ marginTop: '32px' }}>
                  <button className="btn-ghost-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Trước</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`page-num-btn ${page === i ? 'active' : ''}`}
                      onClick={() => setPage(i)}
                    >{i + 1}</button>
                  ))}
                  <button className="btn-ghost-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Sau →</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <footer className="public-footer">
        <div className="container">
          <p>© 2025 BICAP — Blockchain Integration in Clean Agricultural Production</p>
        </div>
      </footer>
    </div>
  );
}
