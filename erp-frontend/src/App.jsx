import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [analytics, setAnalytics] = useState([]);
  const [status, setStatus] = useState("Ready to scan receipts...");

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
      loadData(); // Refresh table with new data
    } catch (err) {
      setStatus("Error: OCR Engine Offline");
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
            <span>Upload Receipt</span>
          </label>
          <input id="file-upload" type="file" onChange={handleFileUpload} hidden />
          <p className="status-label">{status}</p>
        </div>
      </section>

      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Stock Item</th>
              <th>Demand Prob.</th>
              <th>Risk Assessment</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;