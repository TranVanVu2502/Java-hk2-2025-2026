import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../api/services';
import { Package, RefreshCw, Trash2, Search, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:8080';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const load = () => {
        setLoading(true);
        productService.getAll(undefined, 0, 1000) // Lấy nhiều hơn để Admin xem toàn bộ
            .then(res => {
                const all = res.data?.content || res.data || [];
                setProducts(all);
            })
            .catch(() => toast.error('Không thể tải danh sách sản phẩm hệ thống'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('CẢNH BÁO: Bạn đang xóa sản phẩm với tư cách Admin. Hành động này không thể hoàn tác. Tiếp tục?')) return;
        try {
            await productService.delete(id);
            toast.success('Đã xóa sản phẩm khỏi hệ thống');
            load();
        } catch {
            toast.error('Xóa sản phẩm thất bại');
        }
    };

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.farmName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản lý nông sản toàn hệ thống</h1>
                    <p className="page-subtitle">Giám sát {products.length} sản phẩm từ tất cả các trang trại</p>
                </div>
                <div className="header-actions">
                    <div className="search-box" style={{ width: '250px', marginRight: '10px' }}>
                        <Search size={16} />
                        <input 
                            type="text" 
                            placeholder="Tìm sản phẩm, trang trại..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-icon" onClick={load} title="Tải lại"><RefreshCw size={18} /></button>
                </div>
            </div>

            <div className="section-card">
                {loading ? (
                    <div className="page-loading"><div className="loading-spinner-lg"></div></div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-table">
                        <Package size={40} />
                        <p>{searchTerm ? 'Không tìm thấy sản phẩm nào phù hợp.' : 'Hệ thống chưa có sản phẩm nào.'}</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th style={{ width: 72 }}>Ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={14}/> Trang trại</div></th>
                                <th>SL (kg)</th>
                                <th>Giá niêm yết</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p, i) => (
                                <tr key={p.productId}>
                                    <td className="td-muted">{i + 1}</td>
                                    <td>
                                        {p.imageUrl ? (
                                            <img
                                                src={p.imageUrl.startsWith('http') ? p.imageUrl : `${BASE_URL}${p.imageUrl}`}
                                                alt={p.name}
                                                style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }}
                                            />
                                        ) : (
                                            <div style={{ width: 56, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 6 }}>
                                                📦
                                            </div>
                                        )}
                                    </td>
                                    <td><strong>{p.name}</strong></td>
                                    <td><span className="badge badge-gray">{p.farmName || '—'}</span></td>
                                    <td>{p.quantity || '—'}</td>
                                    <td className="td-muted">{p.price ? `${Number(p.price).toLocaleString('vi-VN')}₫` : '—'}</td>
                                    <td>
                                        <span className={`badge ${p.quantity > 0 ? 'badge-green' : 'badge-red'}`}>
                                            {p.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-group">
                                            <Link
                                                to={`/products/${p.productId}`}
                                                className="btn-green-sm"
                                                style={{ textDecoration: 'none' }}
                                            >
                                                Xem
                                            </Link>

                                            <button
                                                className="btn-red-sm"
                                                onClick={() => handleDelete(p.productId)}
                                                title="Xóa sản phẩm"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
