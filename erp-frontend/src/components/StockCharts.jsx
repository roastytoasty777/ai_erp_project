import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StockCharts = ({ stockItems }) => {
    const chartData = useMemo(() => {
        return stockItems.map(item => ({
            name: item.item_name,
            quantity: item.current_quantity,
            value: item.current_quantity * item.price
        })).sort((a, b) => b.value - a.value); // Sort by value desc
    }, [stockItems]);

    // Top 5 items by value for pie chart to avoid clutter
    const pieData = useMemo(() => {
        if (chartData.length <= 5) return chartData;
        const top5 = chartData.slice(0, 5);
        const othersValue = chartData.slice(5).reduce((acc, curr) => acc + curr.value, 0);
        return [...top5, { name: 'Others', value: othersValue, quantity: 0 }];
    }, [chartData]);
    
    const COLORS = ['#60a5fa', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

    if (stockItems.length === 0) return null;

    return (
        <div id="stock-stats" className="charts-container" style={{ marginTop: '40px' }}>
            {/* Inventory Value (Pie) */}
            <div className="chart-card">
                <h3 className="chart-title">Stock Value Distribution</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#e2e8f0'
                            }}
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
                        />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Inventory Levels (Bar) */}
            <div className="chart-card">
                <h3 className="chart-title">Current Inventory Levels</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#94a3b8" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis 
                            stroke="#94a3b8" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#e2e8f0'
                            }}
                        />
                        <Bar dataKey="quantity" name="Quantity" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.quantity < 10 ? '#ef4444' : '#10b981'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StockCharts;
