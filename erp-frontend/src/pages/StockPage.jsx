import React from 'react';
import StockSection from '../components/StockSection';
import SubNavbar from '../components/SubNavbar';

const StockPage = () => {
    const stockLinks = [
        { label: 'HIGHLIGHTS', href: '#stock-highlights' },
        { label: 'ADD STOCK', href: '#stock-add' },
        { label: 'DASHBOARD', href: '#stock-dashboard' },
        { label: 'STATISTICS CHARTS', href: '#stock-stats' }
    ];

    return (
        <div className="page-container">
            <SubNavbar links={stockLinks} />
            <h1 className="main-title" style={{ padding: '20px 0', fontSize: '3rem', textAlign: 'center' }}>Stock Management</h1>
            <StockSection />
        </div>
    );
};

export default StockPage;
