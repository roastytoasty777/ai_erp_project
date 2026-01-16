import React, { useState, useEffect } from 'react';
import './App.css';

// Configure API URL - change this to your backend server's IP address
const API_URL = 'http://192.168.100.89:8000'; // Your PC's network IP

function App() {
  const [analytics, setAnalytics] = useState([]);
  const [status, setStatus] = useState("Ready to scan receipts...");
  const [formData, setFormData] = useState({ item_name: '', quantity: '', price: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ quantity: '', price: '' });

  const loadData = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/analytics/`);
      const data = await response.json();
      setAnalytics(data); 
    } catch (err) {
      console.error("Connection failed:", err);
      setStatus("Error: Cannot connect to backend at " + API_URL);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus("AI is reading receipt...");
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/upload-receipt/`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      setStatus(`Detected: ${result.detected_item}`);
      loadData();
    } catch (err) {
      setStatus("Error: OCR Engine Offline");
    }
  };

  const handleDeleteItem = async (itemName) => {
    try {
      const res = await fetch(`${API_URL}/orders/${itemName}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStatus("Item deleted successfully");
        loadData();
      } else {
        setStatus("Error deleting item");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setStatus("Error deleting item");
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!formData.item_name || !formData.quantity || !formData.price) {
      setStatus("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/create-order/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus(`Item "${formData.item_name}" created successfully`);
        setFormData({ item_name: '', quantity: '', price: '' });
        loadData();
      } else {
        setStatus("Error creating item");
      }
    } catch (err) {
      console.error("Create error:", err);
      setStatus("Error creating item");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item.item_name);
    setEditFormData({ quantity: String(item.quantity), price: String(item.price) });
  };

  const handleUpdateItem = async (itemName) => {
    if (!editFormData.quantity || !editFormData.price) {
      setStatus("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/update-item/${itemName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseInt(editFormData.quantity),
          price: parseFloat(editFormData.price),
        }),
      });
      if (res.ok) {
        setStatus(`Item "${itemName}" updated successfully`);
        setEditingItem(null);
        loadData();
      } else {
        setStatus("Error updating item");
      }
    } catch (err) {
      console.error("Update error:", err);
      setStatus("Error updating item");
    }
  };

  // Filter analytics based on search query
  const filteredAnalytics = analytics.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <header className="hero-section">
        <h1 className="main-title">AI-ERP <span className="accent">Vision</span></h1>
        <p className="description">Probabilistic Inventory & OCR Intelligence</p>
      </header>

      <section className="controls">
        {/* Combined Upload and Form Section */}
        <div className="combined-section">
          {/* Left Section - Upload */}
          <div className="left-section">
            <div className="upload-box">
              <label htmlFor="file-upload" className="custom-upload-btn">
                <span>Upload Receipt</span>
              </label>
              <input id="file-upload" type="file" onChange={handleFileUpload} hidden />
            </div>
          </div>

          {/* OR Separator */}
          <div className="separator">
            <span className="separator-text">OR</span>
          </div>

          {/* Right Section - Form */}
          <div className="right-section">
            <div className="form-box">
              <h3 className="form-label">ADD ITEM MANUALLY</h3>
              <form onSubmit={handleCreateItem} className="create-form">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="form-input"
                />
                <button type="submit" className="submit-btn">Create Item</button>
              </form>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <p className="status-label">{status}</p>
      </section>

      {/* Summary Statistics */}
      {analytics.length > 0 && (
        <div className="summary-wrapper">
          <div className="summary-card">
            <div className="summary-stat">
              <span className="summary-label">Items in Stock</span>
              <span className="summary-value">{analytics.length}</span>
            </div>
            <div className="summary-stat">
              <span className="summary-label">Total Quantity</span>
              <span className="summary-value">{analytics.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="summary-stat">
              <span className="summary-label">Total Value</span>
              <span className="summary-value">${analytics.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {analytics.length > 0 && (
        <div className="search-wrapper">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-btn" 
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <span className="search-results">
            {filteredAnalytics.length} Item(s)
          </span>
        </div>
      )}

      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Stock Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Price</th>
              <th>Demand Prob.</th>
              <th>Risk Assessment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnalytics.map((item, i) => (
              <tr key={i}>
                <td className="item-name">{item.item_name}</td>
                <td className="quantity-text">
                  {editingItem === item.item_name ? (
                    <input
                      key={`qty-${item.item_name}`}
                      type="number"
                      value={editFormData.quantity}
                      onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                      className="edit-input"
                      autoFocus
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="price-text">
                  {editingItem === item.item_name ? (
                    <input
                      key={`price-${item.item_name}`}
                      type="number"
                      step="0.01"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    `$${item.price.toFixed(2)}`
                  )}
                </td>
                <td className="price-text">${item.total_price.toFixed(2)}</td>
                <td className="prob-text">{(item.demand_probability * 100).toFixed(1)}%</td>
                <td>
                  <span className={`status-pill ${item.inventory_risk}`}>
                    {item.inventory_risk}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {editingItem === item.item_name ? (
                      <>
                        <button 
                          className="save-btn" 
                          onClick={() => handleUpdateItem(item.item_name)}
                        >
                          ✓ Save
                        </button>
                        <button 
                          className="cancel-btn" 
                          onClick={() => setEditingItem(null)}
                        >
                          ✕ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEditItem(item)}
                        >
                          ✎ Edit
                        </button>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteItem(item.item_name)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;