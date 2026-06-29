import React, { useState } from 'react';

export default function Reports({ salesHistory, inventory, onViewReceipt, onClearSalesHistory }) {
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'today' | 'week' | 'all'

  // 1. Filter transactions based on date period
  const getFilteredSales = () => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    return salesHistory.filter(sale => {
      const saleDate = new Date(sale.date);
      
      if (filterPeriod === 'today') {
        return saleDate.toDateString() === todayStr;
      } else if (filterPeriod === 'week') {
        const diffTime = Math.abs(now - saleDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      return true; // 'all'
    });
  };

  const filteredSales = getFilteredSales();

  // 2. Compute primary KPIs
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.grandTotal, 0);
  const totalTransactions = filteredSales.length;
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalItemsSold = filteredSales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => itemSum + item.qty, 0);
  }, 0);

  // 3. Compute Top Selling Products
  const getTopProducts = () => {
    const productSales = {}; // key: name, value: { qty, revenue, sku }
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { qty: 0, revenue: 0, sku: item.sku };
        }
        productSales[item.name].qty += item.qty;
        productSales[item.name].revenue += item.price * item.qty;
      });
    });

    return Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();
  const maxProductQty = topProducts.length > 0 ? Math.max(...topProducts.map(p => p.qty)) : 1;

  // 4. Compute Sales by Category
  const getCategorySales = () => {
    const categoryTotals = {};
    let totalCatRevenue = 0;
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        // Find category from inventory using sku
        const invItem = inventory.find(i => i.sku === item.sku);
        const category = invItem ? invItem.category : 'Other';
        
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += item.price * item.qty;
        totalCatRevenue += item.price * item.qty;
      });
    });

    return Object.entries(categoryTotals).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalCatRevenue > 0 ? (revenue / totalCatRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  };

  const categorySales = getCategorySales();

  return (
    <div className="reports-view" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Filters Header Row */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px' }}>
        <div>
          <h2 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '600' }}>Report Parameters</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Filter sales aggregates and logs by time intervals.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`category-tag ${filterPeriod === 'today' ? 'active' : ''}`}
            onClick={() => setFilterPeriod('today')}
          >
            Today
          </button>
          <button 
            className={`category-tag ${filterPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setFilterPeriod('week')}
          >
            Past 7 Days
          </button>
          <button 
            className={`category-tag ${filterPeriod === 'all' ? 'active' : ''}`}
            onClick={() => setFilterPeriod('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* KPI metrics row */}
      <div className="dashboard-grid">
        
        {/* Total Revenue */}
        <div className="card metric-card">
          <div className="metric-icon-wrapper metric-sales">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Total Revenue</h3>
            <div className="metric-value">Rs. {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="card metric-card">
          <div className="metric-icon-wrapper metric-stock">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Sales Invoices</h3>
            <div className="metric-value">{totalTransactions} Sales</div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="card metric-card">
          <div className="metric-icon-wrapper metric-alerts" style={{ backgroundColor: '#FAF5EC', color: 'var(--warning)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-11.25zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Average Bill Value</h3>
            <div className="metric-value">Rs. {avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Total Items Sold */}
        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375 0 1 1-.75 0 .375 0 0 1 .75 0zm7.5 0a.375 0 1 1-.75 0 .375 0 0 1 .75 0z" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Furniture Units Sold</h3>
            <div className="metric-value">{totalItemsSold} Units</div>
          </div>
        </div>

      </div>

      {/* Visual Analytics Row: Top Selling & Sales by Category */}
      <div className="dashboard-details-row">
        
        {/* Top Selling Products */}
        <div className="card">
          <div className="dashboard-card-header">
            <h2>Top Performing Furniture</h2>
            <span className="badge badge-category" style={{ fontSize: '11px' }}>By Quantity</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="no-alerts-state" style={{ padding: '60px 0' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18" />
              </svg>
              <p>No transaction sales logged for this interval.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {topProducts.map((prod, index) => {
                const ratio = (prod.qty / maxProductQty) * 100;
                return (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{prod.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{prod.qty} sold (Rs. {prod.revenue.toFixed(2)})</span>
                    </div>
                    {/* Hand-crafted CSS Progress Bar */}
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${ratio}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sales by Category breakdown */}
        <div className="card">
          <div className="dashboard-card-header">
            <h2>Revenue by Category</h2>
            <span className="badge badge-category" style={{ fontSize: '11px' }}>Percentage</span>
          </div>

          {categorySales.length === 0 ? (
            <div className="no-alerts-state" style={{ padding: '60px 0' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5z" />
              </svg>
              <p>No category metrics available.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {categorySales.map((cat, index) => {
                return (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500' }}>
                      <span style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: '600' }}>{cat.category}</span>
                      <span style={{ fontWeight: '600' }}>{cat.percentage.toFixed(0)}% (Rs. {cat.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })})</span>
                    </div>
                    {/* Visual Bar Accent */}
                    <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--border)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: `${cat.percentage}%`, height: '100%', backgroundColor: 'var(--primary-accent)', borderRadius: '6px', transition: 'width 0.5s ease' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Transaction Log Table */}
      <div className="card">
        <div className="dashboard-card-header" style={{ marginBottom: '24px' }}>
          <div>
            <h2>Transaction Invoice Logs</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>List of completed bills. Click 'View' to reprint/preview receipt.</p>
          </div>
          {salesHistory.length > 0 && (
            <button 
              className="btn-danger btn-sm"
              onClick={() => {
                if (window.confirm('WARNING: Are you sure you want to delete ALL sales logs? This resets your store reports.')) {
                  onClearSalesHistory();
                }
              }}
            >
              Reset Sales History
            </button>
          )}
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice Code</th>
                <th>Date & Time</th>
                <th>Units Count</th>
                <th>Subtotal</th>
                <th>Tax (10%)</th>
                <th>Grand Total</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No invoice transactions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const units = sale.items.reduce((sum, i) => sum + i.qty, 0);
                  return (
                    <tr key={sale.id}>
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{sale.invoiceNo}</td>
                      <td>
                        {new Date(sale.date).toLocaleDateString()} &bull; {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>{units} item{units > 1 ? 's' : ''}</td>
                      <td>Rs. {sale.subtotal.toFixed(2)}</td>
                      <td>Rs. {sale.tax.toFixed(2)}</td>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>Rs. {sale.grandTotal.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => onViewReceipt(sale)}
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
