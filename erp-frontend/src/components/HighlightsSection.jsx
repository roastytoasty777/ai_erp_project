import React from 'react';
import SalesInsights from './SalesInsights';

const HighlightsSection = ({ analytics }) => {
  return (
    <div id="section-highlights">
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

      {/* Sales Insights Section */}
      <SalesInsights />
    </div>
  );
};

export default HighlightsSection;
