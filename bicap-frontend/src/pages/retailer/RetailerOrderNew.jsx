import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicHeader from '../../components/PublicHeader';
import { orderService } from '../../api/services';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RetailerOrderNew() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useOrder();
  const [loading, setLoading] = useState(false);

  const isRetailer = user?.role === 'RETAILER';

  const handleLogout = () => {
    logout();
    navigate('/products');
  };

  const totalQty = useMemo(
    () => cartItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
    [cartItems]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = cartItems.filter((it) => Number(it.quantity) > 0);
    if (!validItems.length) {
      toast.error('Giỏ hàng đang trống');
      return;
    }

    const exceededItem = validItems.find((it) => Number(it.quantity) > Number(it.maxQuantity || 0));
    if (exceededItem) {
      toast.error(`Sản phẩm "${exceededItem.name}" vượt quá số lượng có sẵn`);
      return;
    }

    setLoading(true);
    try {
      await orderService.create({
        items: validItems.map((it) => ({
          productId: Number(it.productId),
          quantity: Number(it.quantity),
          price: it?.price ? Number(it.price) : 0,
        })),
      });
      toast.success('Đã tạo đơn hàng thành công!');
      clearCart();
      navigate('/retailer/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tạo đơn hàng thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="public-page">
      {/* --- HEADER ĐỒNG BỘ HOÀN TOÀN --- */}
      <PublicHeader />

      {/* --- NỘI DUNG CHÍNH --- */}
      <main style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="page-header" style={{ marginBottom: '32px' }}>
            <div>
              <h1 className="page-title">Giỏ hàng</h1>
              <p className="page-subtitle">Kiểm tra sản phẩm trước khi tiến hành đặt hàng</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="season-detail-grid">
              {/* Cột trái: Items */}
              <div className="section-card">
                <div className="section-card-header">
                  <h3>Sản phẩm trong giỏ</h3>
                </div>
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {cartItems.length === 0 && (
                    <div className="empty-row">Giỏ hàng trống. Hãy quay lại trang sản phẩm để thêm mới.</div>
                  )}

                  {cartItems.map((item, i) => {
                    const maxQty = Number(item.maxQuantity) || 0;
                    return (
                      <div key={item.cartId} className="order-item-card">
                        <div className="order-item-num">{i + 1}</div>
                        <div className="order-item-fields">
                          <div className="form-group">
                            <label>Sản phẩm</label>
                            <input value={`${item.name} (còn ${maxQty}kg)`} readOnly />
                          </div>
                          <div className="form-group">
                            <label>Số lượng (kg)</label>
                            <input
                              id={`order-qty-${i}`}
                              type="number"
                              min="0.1"
                              step="0.1"
                              max={maxQty}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.cartId, Number(e.target.value || 0))}
                              /* Ép CSS trực tiếp vào tag để ẩn mũi tên spinner */
                              style={{
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield',
                                margin: 0
                              }}
                            />
                          </div>
                        </div>
                        {item.quantity && (
                          <div className="order-item-subtotal">
                            {item.price
                              ? `≈ ${(Number(item.price) * Number(item.quantity)).toLocaleString('vi-VN')} ₫`
                              : `${item.quantity} kg`
                            }
                          </div>
                        )}
                        <button type="button" className="btn-icon-sm" onClick={() => removeFromCart(item.cartId)} style={{ color: '#ef4444' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cột phải: Summary */}
              <div>
                <div className="section-card" style={{ position: 'sticky', top: 100 }}>
                  <div className="section-card-header"><h3>Tóm tắt đơn hàng</h3></div>
                  <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="order-summary-rows">
                      <div className="order-summary-row">
                        <span>Số sản phẩm</span>
                        <strong>{cartItems.length}</strong>
                      </div>
                      <div className="order-summary-row">
                        <span>Tổng số lượng</span>
                        <strong>{totalQty.toFixed(1)} kg</strong>
                      </div>
                    </div>

                    <button
                      id="submit-order-btn"
                      type="submit"
                      className="btn-primary"
                      disabled={loading || cartItems.length === 0}
                      style={{ width: '100%' }}
                    >
                      {loading ? <span className="spinner white"></span> : <><ShoppingCart size={18} /> Tiến hành đặt hàng</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="public-footer">
        <div className="container">
          <p>© 2025 BICAP — Blockchain Integration in Clean Agricultural Production</p>
        </div>
      </footer>
    </div>
  );
}