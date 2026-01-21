import React from 'react';
import ReceiptGenerator from './ReceiptGenerator';

const AddItemSection = ({ 
  handleFileUpload, 
  handleCreateItem, 
  formData, 
  setFormData, 
  status,
  stockItems = [] 
}) => {
  const handleStockSelect = (e) => {
    const selectedItemName = e.target.value;
    const selectedStock = stockItems.find(item => item.name === selectedItemName);
    
    setFormData({
      ...formData,
      item_name: selectedItemName,
      // Optional: Auto-fill price if you wanted to enforce stock price
      price: selectedStock ? selectedStock.price : formData.price
    });
  };

  return (
    <section id="section-add-item" className="controls">
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

        {/* Right Section - Receipt Generator (Replaces Manual Form) */}
        <div className="right-section">
          <div className="form-box" style={{ padding: 0, backgroundColor: 'transparent', boxShadow: 'none' }}>
            <ReceiptGenerator />
          </div>
        </div>
      </div>

      {/* Status Message */}
      <p className="status-label">{status}</p>
    </section>
  );
};

export default AddItemSection;
