import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Verify path or create specific CSS

const WelcomePage = () => {
    return (
        <div className="welcome-container">
            <div className="welcome-overlay"></div>
            <div className="welcome-content">
                <h1 className="main-title">AI-ERP <span className="accent">SYSTEM</span></h1>
                <p className="intro-text">
                    The ultimate platform for modern business management. 
                    Manage your <strong>Sales</strong>, track your <strong>Stock</strong>, 
                    and generate <strong>Receipts</strong> with the power of AI.
                </p>
                <div className="welcome-buttons">
                    <Link to="/sales" className="welcome-btn">
                        <span className="btn-icon"></span> SALES MANAGEMENT
                    </Link>
                    <Link to="/stock" className="welcome-btn">
                        <span className="btn-icon"></span> STOCK MANAGEMENT
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
