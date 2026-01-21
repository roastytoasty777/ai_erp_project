import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatisticsCharts = React.memo(({ chartData }) => {
  return (
    <div id="section-statistics" className="charts-container">
      {/* Revenue Bar Chart */}
      <div className="chart-card">
        <h3 className="chart-title">Revenue by Item</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
            />
            <Legend 
              wrapperStyle={{ color: '#94a3b8' }}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="revenue" fill="#60a5fa" radius={[8, 8, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quantity Pie Chart */}
      <div className="chart-card">
        <h3 className="chart-title">Quantity Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="quantity"
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#60a5fa', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316'][index % 8]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              formatter={(value) => [value, 'Quantity']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default StatisticsCharts;
