import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../api/services';
import { useFarm } from '../../context/FarmContext';
import { Plus, Package, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmProducts() {
    const { myFarm } = useFarm();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        if (!myFarm?.farmId) return;
        setLoading(true);
        productService.getAll(undefined, 0, 100)
            .then(res => {
                const all = res.data?.content || res.data || [];
                setProducts(all.filter(p => Number(p.farmId) === Number(myFarm.farmId)));
            })
            .catch(() => toast.error('Không thể tải sản phẩm'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [myFarm]);

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        try {
            await productService.delete(id);
            toast.success('Đã xóa sản phẩm');
            load();
        } catch {
            toast.error('Xóa sản phẩm thất bại');
        }
    };

    if (!myFarm) return (
        <div className="page"><div className="empty-state">
            <Package size={56} />
            <h3>Chưa có trang trại</h3>
            <p>Bạn cần đăng ký trang trại trước</p>
            <Link to="/farm/dashboard" className="btn-primary" style={{ textDecoration: 'none', width: 'auto', padding: '10px 24px' }}>Về Dashboard</Link>
        </div></div>
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sản phẩm — {myFarm.name}</h1>
                    <p className="page-subtitle">{products.length} sản phẩm</p>
                </div>
                <div className="header-actions">
                    <button className="btn-icon" onClick={load}><RefreshCw size={18} /></button>
                    <button id="add-product-btn" className="btn-primary" onClick={() => navigate('/farm/products/new')}>
                        <Plus size={18} /> Tạo sản phẩm
                    </button>
                </div>
            </div>

            <div className="section-card">
                {loading ? (
                    <div className="page-loading"><div className="loading-spinner-lg"></div></div>
                ) : products.length === 0 ? (
                    <div className="empty-table">
                        <Package size={40} />
                        <p>Chưa có sản phẩm nào. Nhấn "Tạo sản phẩm" để bắt đầu.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th style={{ width: 72 }}>Ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>SL (kg)</th>
                                <th>Giá</th>
                                <th>Mùa vụ</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p, i) => (
                                <tr key={p.productId}>
                                    <td className="td-muted">{i + 1}</td>
                                    <td>
                                        {p.imageUrl ? (
                                            <img
                                                src={p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:8080${p.imageUrl}`}
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
                                    <td>{p.quantity || '—'}</td>
                                    <td className="td-muted">{p.price ? `${Number(p.price).toLocaleString('vi-VN')}₫` : '—'}</td>
                                    <td className="td-muted">{p.seasonName || '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <Link
                                                id={`product-edit-${p.productId}`}
                                                to={`/farm/products/${p.productId}`}
                                                className="btn-edit-sm"
                                                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                                            >
                                                <Edit2 size={13} /> Sửa
                                            </Link>
                                            <button
                                                id={`product-delete-${p.productId}`}
                                                className="btn-danger-sm"
                                                onClick={() => handleDelete(p.productId)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                                            >
                                                <Trash2 size={13} /> Xóa
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