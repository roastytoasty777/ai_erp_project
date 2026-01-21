import React, { useState } from 'react';
import '../App.css'; 

const API_URL = 'http://192.168.56.1:8000';

function ReceiptGenerator() {
  const [storeName, setStoreName] = useState("AI-ERP Store");
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ name: '', qty: 1, price: 0 });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    if (!currentItem.name || currentItem.price <= 0) return;
    setItems([...items, { ...currentItem, qty: parseInt(currentItem.qty), price: parseFloat(currentItem.price) }]);
    setCurrentItem({ name: '', qty: 1, price: 0 });
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  };

  const generateReceipt = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/generate-receipt/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_name: storeName,
          items: items,
          total: calculateTotal()
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setGeneratedImage(imageUrl);
      } else {
        console.error("Failed to generate receipt");
      }
    } catch (error) {
      console.error("Error generating receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-card">
      <h3 className="form-label">MANUAL RECEIPT GENERATOR</h3>
      
      <div className="generator-form-group">
        <label>Store Name</label>
        <input 
          type="text" 
          value={storeName} 
          onChange={(e) => setStoreName(e.target.value)} 
          className="form-input"
          placeholder="Enter Store Name"
        />
      </div>

      <div className="add-item-row">
        <div className="input-group grow">
            <input 
            type="text" 
            placeholder="Item Name" 
            value={currentItem.name} 
            onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
            className="form-input"
            />
        </div>
        <div className="input-group shrink">
            <input 
            type="number" 
            placeholder="Qty" 
            value={currentItem.qty} 
            onChange={(e) => setCurrentItem({...currentItem, qty: e.target.value})}
            className="form-input"
            />
        </div>
        <div className="input-group medium">
            <input 
            type="number" 
            placeholder="Price" 
            value={currentItem.price} 
            onChange={(e) => setCurrentItem({...currentItem, price: e.target.value})}
            className="form-input"
            />
        </div>
        <button onClick={addItem} className="add-icon-btn">+</button>
      </div>

      <div className="items-list-container">
        <table className="mini-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
                <tr>
                    <td colSpan="5" className="empty-row">No items added yet</td>
                </tr>
            ) : (
                items.map((item, index) => (
                <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.qty * item.price).toFixed(2)}</td>
                    <td className="action-cell">
                    <button onClick={() => removeItem(index)} className="remove-icon-btn">×</button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="total-row">
        <span>Total Amount:</span>
        <span className="total-value">${calculateTotal().toFixed(2)}</span>
      </div>

      <div className="actions">
        <button 
          onClick={generateReceipt} 
          className="action-btn generate-btn" 
          disabled={items.length === 0 || loading}
        >
          {loading ? "Generating..." : "GENERATE RECEIPT"}
        </button>
      </div>

      {generatedImage && (
        <div className="result-preview">
          <h4 className="preview-title">Generated Receipt</h4>
          <div className="image-wrapper">
             <img src={generatedImage} alt="Generated Receipt" />
          </div>
          <a href={generatedImage} download="fake_receipt.png" className="download-link">
            Download Image
          </a>
        </div>
      )}
    </div>
  );
}

export default ReceiptGenerator;
