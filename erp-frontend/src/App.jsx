import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [analytics, setAnalytics] = useState([]);
  const [status, setStatus] = useState("Ready to scan receipts...");
  const [formData, setFormData] = useState({ item_name: '', quantity: '', price: '' });

  const loadData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/dashboard/analytics/');
      const data = await response.json();
      setAnalytics(data); 
    } catch (err) {
      console.error("Connection failed:", err);
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
      const res = await fetch('http://127.0.0.1:8000/upload-receipt/', {
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
      const res = await fetch(`http://127.0.0.1:8000/orders/${itemName}`, {
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
      const res = await fetch('http://127.0.0.1:8000/create-order/', {
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

  return (
    <div className="dashboard-container">
      <header className="hero-section">
        <h1 className="main-title">AI-ERP <span className="accent">Vision</span></h1>
        <p className="description">Probabilistic Inventory & OCR Intelligence</p>
      </header>

      <section className="controls">
        {/* Styled File Upload */}
        <div className="upload-box">
          <label htmlFor="file-upload" className="custom-upload-btn">
            <span>📷 Upload Receipt</span>
          </label>
          <input id="file-upload" type="file" onChange={handleFileUpload} hidden />
          <p className="status-label">{status}</p>
        </div>

        {/* Manual Item Creation */}
        <div className="form-box">
          <h3 className="form-title">Or Add Item Manually</h3>
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
      </section>

      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Stock Item</th>
              <th>Demand Prob.</th>
              <th>Risk Assessment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((item, i) => (
              <tr key={i}>
                <td className="item-name">{item.item_name}</td>
                <td className="prob-text">{(item.demand_probability * 100).toFixed(1)}%</td>
                <td>
                  <span className={`status-pill ${item.inventory_risk}`}>
                    {item.inventory_risk}
                  </span>
                </td>
                <td>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteItem(item.item_name)}
                  >
                    Delete
                  </button>
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