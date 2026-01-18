import React, { useState, useEffect } from 'react';
import './SalesInsights.css';

const API_URL = 'http://192.168.100.89:8000';

function SalesInsights() {
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/dashboard/sales-insights/`);
        if (!response.ok) {
          throw new Error('Failed to fetch sales insights');
        }
        const data = await response.json();
        setInsights(data.insights || []);
        setSummary(data.summary || null);
        setError(null);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Unable to load business insights. Please try again later.');
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
    // Refresh insights every 5 minutes
    const interval = setInterval(fetchInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="insights-container">
        <div className="loading">Loading business insights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="insights-container">
      <div className="insights-header">
        <h2>Sales Highlights</h2>
        {summary && (
          <div className="insights-meta">
            <span className="meta-item">
              <strong>{summary.total_items}</strong> Products
            </span>
            <span className="meta-item">
              <strong>${summary.total_revenue.toFixed(2)}</strong> Total Revenue
            </span>
            <span className="meta-item">
              <strong>{summary.total_quantity}</strong> Units Sold
            </span>
          </div>
        )}
      </div>

      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div key={index} className="insight-card">
            <div className="insight-title">{insight.title}</div>
            <div className="insight-description">{insight.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SalesInsights;
