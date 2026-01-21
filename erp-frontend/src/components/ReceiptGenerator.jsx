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
    <div className="receipt-generator-container" style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px', borderRadius: '8px', background: '#1e293b', color: 'white' }}>
      <h2 style={{ borderBottom: '1px solid #475569', paddingBottom: '10px' }}>Receipt Generator (Test Tool)</h2>
      
      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label>Store Name: </label>
        <input 
          type="text" 
          value={storeName} 
          onChange={(e) => setStoreName(e.target.value)} 
          className="form-input"
          style={{ marginLeft: '10px' }}
        />
      </div>

      <div className="add-item-form" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Item Name" 
          value={currentItem.name} 
          onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
          className="form-input"
        />
        <input 
          type="number" 
          placeholder="Qty" 
          value={currentItem.qty} 
          onChange={(e) => setCurrentItem({...currentItem, qty: e.target.value})}
          className="form-input"
          style={{ width: '80px' }}
        />
        <input 
          type="number" 
          placeholder="Price" 
          value={currentItem.price} 
          onChange={(e) => setCurrentItem({...currentItem, price: e.target.value})}
          className="form-input"
          style={{ width: '100px' }}
        />
        <button onClick={addItem} className="submit-btn" style={{ padding: '8px 15px' }}>+ Add</button>
      </div>

      <div className="items-list" style={{ marginBottom: '20px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #475569' }}>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #334155' }}>
                <td>{item.name}</td>
                <td>{item.qty}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.qty * item.price).toFixed(2)}</td>
                <td>
                  <button onClick={() => removeItem(index)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '1.2em' }}>
          <strong>Total: ${calculateTotal().toFixed(2)}</strong>
        </div>
      </div>

      <div className="actions" style={{ marginBottom: '20px' }}>
        <button 
          onClick={generateReceipt} 
          className="submit-btn" 
          disabled={items.length === 0 || loading}
          style={{ width: '100%' }}
        >
          {loading ? "Generating..." : "Generate Receipt Information"}
        </button>
      </div>

      {generatedImage && (
        <div className="result-preview" style={{ textAlign: 'center', marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
          <h3 style={{ color: '#334155', marginBottom: '10px' }}>Generated Receipt</h3>
          <img src={generatedImage} alt="Generated Receipt" style={{ border: '1px solid #ccc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
          <br />
          <a href={generatedImage} download="fake_receipt.png" className="submit-btn" style={{ display: 'inline-block', marginTop: '15px', textDecoration: 'none' }}>
            Download Image
          </a>
        </div>
      )}
    </div>
  );
}

export default ReceiptGenerator;
