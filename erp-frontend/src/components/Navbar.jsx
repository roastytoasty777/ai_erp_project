import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">AI-ERP</div>
      <ul className="navbar-menu">
        <li><a href="#section-add-item">ADD ITEM</a></li>
        <li><a href="#section-highlights">HIGHLIGHTS</a></li>
        <li><a href="#section-sales-table">SALES TABLE</a></li>
        <li><a href="#section-statistics">STATISTICS CHARTS</a></li>
        <li><a href="#section-receipt-generator">RECEIPT GENERATOR</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
