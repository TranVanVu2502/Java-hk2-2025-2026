import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, LogOut, User, ShoppingCart, ListOrdered, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PublicHeader() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isRetailer = user?.role === 'RETAILER';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="public-header">
            <div className="container">
                <div className="public-header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <Link to="/" className="auth-logo" style={{ textDecoration: 'none' }}>
                            <div className="logo-icon logo-sm"><Leaf size={18} /></div>
                            <span className="logo-text">BICAP</span>
                        </Link>

                        <nav className="guest-nav">
                            <Link to="/products" className={`guest-nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`}>Sản phẩm</Link>
                            <Link to="/qr" className={`guest-nav-link ${location.pathname.startsWith('/qr') ? 'active' : ''}`}>Tra cứu QR</Link>
                        </nav>
                    </div>

                    <div>
                        {isRetailer ? (
                            <div className="retailer-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                                <button
                                    className="btn-outline-sm"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <User size={16} /> Tài khoản <ChevronDown size={14} />
                                </button>

                                {dropdownOpen && (
                                    <div className="dropdown-menu shadow-lg" style={{
                                        position: 'absolute',
                                        top: '120%',
                                        right: 0,
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid var(--gray-200)',
                                        minWidth: '220px',
                                        zIndex: 100,
                                        padding: '8px 0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        <Link to="/retailer/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <User size={16} /> Hồ sơ cá nhân
                                        </Link>
                                        <Link to="/order" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <ShoppingCart size={16} /> Giỏ hàng
                                        </Link>
                                        <Link to="/retailer/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <ListOrdered size={16} /> Lịch sử đơn hàng
                                        </Link>
                                        <div style={{ height: '1px', backgroundColor: 'var(--gray-200)', margin: '4px 0' }}></div>
                                        <button
                                            onClick={() => { handleLogout(); setDropdownOpen(false); }}
                                            className="dropdown-item text-danger"
                                            style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                        >
                                            <LogOut size={16} /> Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Đăng nhập</Link>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}