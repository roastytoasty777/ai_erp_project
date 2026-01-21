import React from 'react';

const AddItemSection = ({ 
  handleFileUpload, 
  handleCreateItem, 
  formData, 
  setFormData, 
  status 
}) => {
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
              <input
                type="number"
                placeholder="Warehouse Stock"
                value={formData.stock_level}
                onChange={(e) => setFormData({ ...formData, stock_level: e.target.value })}
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
  );
};

export default AddItemSection;
