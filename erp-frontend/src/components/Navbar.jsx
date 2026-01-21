import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  // If we are on the welcome page (root), maybe we don't show the detailed navbar, 
  // or we just show the Brand.
  // But the user said "each page have a navbar that contains...". 
  // Let's make this the Top Navbar for switching contexts.
  
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" style={{textDecoration: 'none'}}>AI-ERP</Link>
      <ul className="navbar-menu">
        <li><Link to="/sales" className={location.pathname === '/sales' ? 'active' : ''}>SALES MANAGEMENT</Link></li>
        <li><Link to="/stock" className={location.pathname === '/stock' ? 'active' : ''}>STOCK MANAGEMENT</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
