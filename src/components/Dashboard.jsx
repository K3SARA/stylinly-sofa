import React from 'react';

export default function Dashboard({ inventory, salesHistory, setView, onRestock }) {
  // 1. Calculate metrics
  const totalSalesToday = salesHistory.reduce((sum, sale) => {
    // Check if the sale was today
    const saleDate = new Date(sale.date).toDateString();
    const today = new Date().toDateString();
    return saleDate === today ? sum + sale.grandTotal : sum;
  }, 0);

  const totalItemsInStock = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const lowStockItems = inventory.filter(item => item.quantity < 5);

  return (
    <div className="dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Metrics Row */}
      <div className="dashboard-grid">
        
        {/* Sales Card */}
        <div className="card metric-card">
          <div className="metric-icon-wrapper metric-sales">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Total Sales Today</h3>
            <div className="metric-value">Rs. {totalSalesToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="metric-card-bg-decoration">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="90" height="90">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>

        {/* Total Stock Card */}
        <div className="card metric-card">
          <div className="metric-icon-wrapper metric-stock">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Items in Stock</h3>
            <div className="metric-value">{totalItemsInStock.toLocaleString()} units</div>
          </div>
          <div className="metric-card-bg-decoration">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="90" height="90">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div className="card metric-card">
          <div className="metric-icon-wrapper metric-alerts">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Low Stock Alerts</h3>
            <div className="metric-value">{lowStockItems.length} items</div>
          </div>
          <div className="metric-card-bg-decoration">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="90" height="90">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

      </div>

      {/* Quick Actions & Low Stock Details Row */}
      <div className="dashboard-details-row">
        
        {/* Quick Actions Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <h2 style={{ marginBottom: '8px', fontSize: '18px', color: 'var(--primary)' }}>Quick Actions</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Frequently used controls for managing sales transactions and catalog items.
            </p>
          </div>
          
          <div className="quick-actions-panel" style={{ flexDirection: 'column', gap: '16px' }}>
            <button className="btn-primary" onClick={() => setView('billing')} style={{ padding: '16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              Create New Bill (POS)
            </button>
            <button className="btn-secondary" onClick={() => setView('inventory')} style={{ padding: '16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375 0 1 1-.75 0 .375 0 0 1 .75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375 0 1 1-.75 0 .375 0 0 1 .75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375 0 1 1-.75 0 .375 0 0 1 .75 0z" />
              </svg>
              Manage Inventory Stock
            </button>
          </div>
          
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Tip: Completing billing automatically deducts from inventory.
          </div>
        </div>

        {/* Low Stock Alerts Widget */}
        <div className="card">
          <div className="dashboard-card-header">
            <h2>Critical Stock Alerts</h2>
            {lowStockItems.length > 0 && (
              <span className="badge badge-red">{lowStockItems.length} Alert{lowStockItems.length > 1 ? 's' : ''}</span>
            )}
          </div>
          
          {lowStockItems.length === 0 ? (
            <div className="no-alerts-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p>All items are well stocked!</p>
            </div>
          ) : (
            <div className="low-stock-alert-list">
              {lowStockItems.map(item => (
                <div key={item.id} className="low-stock-alert-item">
                  <div className="low-stock-info">
                    <span className="low-stock-name">{item.name}</span>
                    <span className="low-stock-sku">{item.sku} &bull; {item.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="low-stock-qty">{item.quantity} left</span>
                    <button 
                      className="btn-success btn-sm"
                      title="Quick restock (+10 units)"
                      onClick={() => onRestock(item.id, 10)}
                      style={{ padding: '6px 8px', borderRadius: '8px' }}
                    >
                      +10
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
