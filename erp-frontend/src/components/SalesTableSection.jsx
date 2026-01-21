import React from 'react';

// Helper function to get status class based on tier
const getStatusClass = (tierName) => {
  if (tierName === 'Top Performer' || tierName === 'CRITICAL') {
    return 'status-top';
  } else if (tierName === 'Emerging' || tierName === 'STABLE') {
    return 'status-emerging';
  }
  return 'status-neutral';
};

const SalesTableSection = ({
  analytics,
  filteredAnalytics,
  searchQuery,
  setSearchQuery,
  handleDeleteItem,
  handleEditItem,
  handleUpdateItem,
  editingItem,
  setEditingItem,
  editFormData,
  setEditFormData
}) => {
  return (
    <>
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

      <div id="section-sales-table" className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Stock Item</th>
              <th>Quantity</th>
              <th>Stock Level</th>
              <th>Unit Price</th>
              <th>Total Price</th>
              <th>Demand Prob.</th>
              <th>Sales Tier</th>
              <th>Risk Status</th>
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
                <td className="stock-text">
                  {editingItem === item.item_name ? (
                    <input
                      key={`stock-${item.item_name}`}
                      type="number"
                      value={editFormData.stock_level}
                      onChange={(e) => setEditFormData({ ...editFormData, stock_level: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    item.stock_level || 0
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
                  <span className={`status-pill ${getStatusClass(item.sales_tier || item.inventory_risk)}`}>
                    {item.sales_tier || item.inventory_risk}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${item.inventory_risk === 'CRITICAL' ? 'status-emerging' : 'status-top'}`}>
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
    </>
  );
};

export default SalesTableSection;
