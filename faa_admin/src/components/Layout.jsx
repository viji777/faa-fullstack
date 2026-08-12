import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, LogOut, Bell, Search, Image, Grid, Shield } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userInfo');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} color="#6366f1" /> },
    { name: 'Banners', path: '/banners', icon: <Image size={20} color="#ec4899" /> },
    { name: 'Category', path: '/category', icon: <Grid size={20} color="#f59e0b" /> },
    { name: 'Products', path: '/products', icon: <Package size={20} color="#10b981" /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} color="#3b82f6" /> },
    { name: 'Staffs', path: '/staffs', icon: <Shield size={20} color="#8b5cf6" /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} color="#14b8a6" /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">F</div>
          <h2>Faa Admin</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header className="top-header">
          
          <div className="header-actions">

            <div className="user-profile">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=4338ca&color=fff" alt="Admin" />
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Superadmin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
