import React, { useState, useEffect } from 'react';
import StockCharts from './StockCharts';
import './SalesInsights.css'; // Reuse Sales Highlights styling

const API_URL = 'http://192.168.56.1:8000';

const StockSection = () => {
    const [stockItems, setStockItems] = useState([]);
    const [newItem, setNewItem] = useState({ item_name: '', quantity: '', price: '' });
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({ quantity: '', price: '' });
    const [status, setStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const loadStock = async () => {
        try {
            const res = await fetch(`${API_URL}/stock/`);
            const data = await res.json();
            setStockItems(data);
        } catch (err) {
            console.error("Failed to load stock:", err);
        }
    };

    useEffect(() => {
        loadStock();
    }, []);

    const handleCreateStock = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/stock/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_name: newItem.item_name,
                    quantity: parseInt(newItem.quantity),
                    price: parseFloat(newItem.price)
                })
            });
            if (res.ok) {
                setStatus('Stock item added!');
                setNewItem({ item_name: '', quantity: '', price: '' });
                loadStock();
            } else {
                const err = await res.json();
                setStatus(`Error: ${err.detail}`);
            }
        } catch (err) {
            setStatus('Error connecting to server');
        }
    };

    const handleDeleteStock = async (itemName) => {
        if (!window.confirm(`Delete ${itemName} from stock?`)) return;
        try {
            const res = await fetch(`${API_URL}/stock/${itemName}`, { method: 'DELETE' });
            if (res.ok) {
                loadStock();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditClick = (item) => {
        setEditingItem(item.item_name);
        setEditFormData({ quantity: item.current_quantity, price: item.price });
    };

    const handleUpdateStock = async (itemName) => {
        try {
            const res = await fetch(`${API_URL}/update-stock/${itemName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_name: itemName,
                    current_quantity: parseInt(editFormData.quantity),
                    price: parseFloat(editFormData.price)
                })
            });
            if (res.ok) {
                setEditingItem(null);
                loadStock();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredStock = stockItems.filter(item => 
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dashboard Stats Logic
    const totalItems = stockItems.length;
    const totalValue = stockItems.reduce((acc, item) => acc + (item.current_quantity * item.price), 0);
    const totalUnits = stockItems.reduce((acc, item) => acc + item.current_quantity, 0);
    const lowStockItems = stockItems.filter(item => item.current_quantity < 10).length;

    // Advanced Highlights Logic
    const highestValueItem = stockItems.length > 0 
        ? stockItems.reduce((prev, current) => (current.current_quantity * current.price) > (prev.current_quantity * prev.price) ? current : prev) 
        : null;
    
    const mostAbundantItem = stockItems.length > 0 
        ? stockItems.reduce((prev, current) => current.current_quantity > prev.current_quantity ? current : prev) 
        : null;

    return (
        <div id="section-stock" className="stock-section">
            
            {/* 1. Stock Summary (Restored per request) */}
            <div id="stock-highlights" className="summary-wrapper" style={{ scrollMarginTop: '160px' }}>
                <div className="summary-card">
                    <div className="summary-stat">
                        <span className="summary-label">ITEMS IN STOCK</span>
                        <span className="summary-value">{totalItems}</span>
                    </div>
                    <div className="summary-stat">
                        <span className="summary-label">TOTAL QUANTITY</span>
                        <span className="summary-value">{totalUnits}</span>
                    </div>
                    <div className="summary-stat">
                        <span className="summary-label">TOTAL VALUE</span>
                        <span className="summary-value">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                </div>
            </div>

            {/* 2. Advanced Insights (The Asset, etc.) */}
            <div className="insights-container" style={{ marginBottom: '2rem' }}>
                <div className="insights-header">
                    <h2>Stock Insights</h2>
                </div>

                <div className="insights-grid">
                    {/* Insight 1: The Asset (Highest Value Holding) */}
                    <div className="insight-card">
                        <div className="insight-title">The Asset</div>
                        <div className="insight-description">
                            {highestValueItem ? (
                                <>
                                    <strong style={{color: '#0ef'}}>{highestValueItem.item_name}</strong> is your most valuable asset, holding 
                                    <strong style={{color: '#fff'}}> ${(highestValueItem.current_quantity * highestValueItem.price).toLocaleString()}</strong> in potential revenue.
                                </>
                            ) : "No stock data available yet."}
                        </div>
                    </div>

                    {/* Insight 2: The Stockpile (Highest Quantity) */}
                    <div className="insight-card">
                        <div className="insight-title">The Stockpile</div>
                        <div className="insight-description">
                            {mostAbundantItem ? (
                                <>
                                    <strong style={{color: '#0ef'}}>{mostAbundantItem.item_name}</strong> dominates your inventory with 
                                    <strong style={{color: '#fff'}}> {mostAbundantItem.current_quantity} units</strong> currently available.
                                </>
                            ) : "Add items to see distribution."}
                        </div>
                    </div>

                    {/* Insight 3: Stock Health */}
                    <div className="insight-card">
                        <div className="insight-title">Stock Health</div>
                        <div className="insight-description">
                            {stockItems.length === 0 ? "Inventory empty." : 
                             lowStockItems === 0 ? 
                                "All systems nominal. Inventory levels are healthy across the board." :
                                <>
                                    <strong style={{color: '#ef4444'}}>{lowStockItems} items</strong> are running low on stock. 
                                    Restocking is recommended to maintain service levels.
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls: Add & Search */}
            <div id="stock-add" className="controls" style={{ padding: '20px 0', scrollMarginTop: '160px' }}>
               <div className="combined-section">
                    <div className="right-section" style={{ border: 'none' }}>
                        <div className="form-box">
                            <h3 className="form-label">ADD NEW STOCK ITEM</h3>
                            <form onSubmit={handleCreateStock} className="create-form">
                                <input
                                    type="text"
                                    placeholder="Item Name"
                                    value={newItem.item_name}
                                    onChange={e => setNewItem({...newItem, item_name: e.target.value})}
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    value={newItem.quantity}
                                    onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Unit Price"
                                    step="0.01"
                                    value={newItem.price}
                                    onChange={e => setNewItem({...newItem, price: e.target.value})}
                                    className="form-input"
                                    required
                                />
                                <button type="submit" className="submit-btn" style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}>Add to Stock</button>
                            </form>
                            <p className="status-label">{status}</p>
                        </div>
                    </div>
               </div>
            </div>

            {/* Search */}
            <div className="search-wrapper">
                 <div className="search-container">
                    <input 
                        type="text" 
                        placeholder="Search stock..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                 </div>
            </div>

            {/* Table */}
            <div id="stock-dashboard" className="table-wrapper" style={{ scrollMarginTop: '160px' }}>
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Value</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStock.map((item) => (
                            <tr key={item.id}>
                                <td className="item-name">{item.item_name}</td>
                                <td className="quantity-text">
                                    {editingItem === item.item_name ? (
                                        <input 
                                            type="number" 
                                            value={editFormData.quantity} 
                                            onChange={e => setEditFormData({...editFormData, quantity: e.target.value})}
                                            className="edit-input"
                                        />
                                    ) : item.current_quantity}
                                </td>
                                <td className="price-text">
                                     {editingItem === item.item_name ? (
                                        <input 
                                            type="number" 
                                            value={editFormData.price} 
                                            onChange={e => setEditFormData({...editFormData, price: e.target.value})}
                                            className="edit-input"
                                        />
                                    ) : `$${item.price.toFixed(2)}`}
                                </td>
                                <td className="price-text">${(item.current_quantity * item.price).toFixed(2)}</td>
                                <td>
                                    <div className="action-buttons">
                                        {editingItem === item.item_name ? (
                                            <>
                                                <button className="save-btn" onClick={() => handleUpdateStock(item.item_name)}>Save</button>
                                                <button className="cancel-btn" onClick={() => setEditingItem(null)}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="edit-btn" onClick={() => handleEditClick(item)}>Edit</button>
                                                <button className="delete-btn" onClick={() => handleDeleteStock(item.item_name)}>Delete</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div id="stock-stats" style={{ scrollMarginTop: '160px' }}>
                <StockCharts stockItems={stockItems} />
            </div>
        </div>
    );
};

export default StockSection;
