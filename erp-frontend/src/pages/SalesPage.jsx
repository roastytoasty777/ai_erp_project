import React, { useState, useEffect } from 'react';
import ReceiptGenerator from '../components/ReceiptGenerator';
import StatisticsCharts from '../components/StatisticsCharts';
import AddItemSection from '../components/AddItemSection';
import HighlightsSection from '../components/HighlightsSection';
import SalesTableSection from '../components/SalesTableSection';
import SubNavbar from '../components/SubNavbar'; // Import SubNavbar

const API_URL = 'http://192.168.56.1:8000';

const SalesPage = () => {
  const [analytics, setAnalytics] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stockItems, setStockItems] = useState([]); // Add stock state
  const [status, setStatus] = useState("Ready to scan receipts...");
  const [formData, setFormData] = useState({ item_name: '', quantity: '', price: '', stock_level: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ quantity: '', price: '', stock_level: '' });

  const salesLinks = [
    { label: 'HIGHLIGHTS', href: '#section-highlights' },
    { label: 'ADD SALE', href: '#section-add-sale' },
    { label: 'DASHBOARD', href: '#section-sales-table' },
    { label: 'STATISTICS CHARTS', href: '#section-statistics' }
  ];

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

  const loadChartData = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/chart-data/`);
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error("Failed to load chart data:", err);
    }
  };

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
    loadData();
    loadChartData();
    loadStock(); // Load stock on mount
  }, []);

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
      loadChartData();
      loadStock(); // Refresh stock
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
        loadChartData();
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
        body: JSON.stringify({
          item_name: formData.item_name,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price)
        }),
      });
      
      // Handle response text or json safely
      let result;
      try {
          result = await res.json();
      } catch (e) {
          result = null;
      }

      if (res.ok) {
        setStatus(`Sale for "${formData.item_name}" created successfully`);
        setFormData({ item_name: '', quantity: '', price: '', stock_level: '' });
        loadData();
        loadChartData();
        loadStock(); // Refresh stock
      } else {
        setStatus(`Error: ${result?.detail || "Creating sale failed"}`);
      }
    } catch (err) {
      console.error("Create error:", err);
      setStatus("Error creating sale");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item.item_name);
    setEditFormData({ 
      quantity: String(item.quantity), 
      price: String(item.price),
      stock_level: String(item.stock_level || 0)
    });
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
        // Update stock level if provided
        if (editFormData.stock_level) {
          try {
            await fetch(`${API_URL}/update-stock/${itemName}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                item_name: itemName,
                current_quantity: parseInt(editFormData.stock_level)
              }),
            });
          } catch (err) {
            console.error("Stock update error:", err);
          }
        }
        setStatus(`Item "${itemName}" updated successfully`);
        setEditingItem(null);
        loadData();
        loadChartData();
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
    <div className="page-container">
      <SubNavbar links={salesLinks} />
      <h1 className="main-title" style={{ padding: '20px 0', fontSize: '3rem', textAlign: 'center' }}>Sales Management</h1>

      <HighlightsSection analytics={analytics} />

      <div style={{ marginBottom: '40px' }}>
          <h2 className="section-title" style={{textAlign: 'center', color: '#fff', marginBottom: '20px'}}>RECORD SALE / UPLOAD</h2>
          <AddItemSection 
            handleFileUpload={handleFileUpload}
            handleCreateItem={handleCreateItem}
            formData={formData}
            setFormData={setFormData}
            status={status}
            stockItems={stockItems}
          />
      </div>

      <SalesTableSection
        analytics={analytics}
        filteredAnalytics={filteredAnalytics}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleDeleteItem={handleDeleteItem}
        handleEditItem={handleEditItem}
        handleUpdateItem={handleUpdateItem}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
      />

      {/* Charts Section */}
      {chartData.length > 0 && (
        <StatisticsCharts chartData={chartData} />
      )}
    </div>
  );
}

export default SalesPage;
