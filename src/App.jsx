import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import ReceiptModal from './components/ReceiptModal';
import Reports from './components/Reports';

// Initial Mock Inventory Data
const INITIAL_MOCK_INVENTORY = [
  { id: '1', sku: 'FUR-SOF-001', name: 'Oakland Velvet Sofa', category: 'Sofas', price: 899.99, quantity: 8 },
  { id: '2', sku: 'FUR-TAB-002', name: 'Solid Oak Dining Table', category: 'Tables', price: 549.99, quantity: 3 }, // Low stock (drops alert)
  { id: '3', sku: 'FUR-BED-003', name: 'Nordic King Bed Frame', category: 'Beds', price: 799.99, quantity: 12 },
  { id: '4', sku: 'FUR-CHR-004', name: 'Eames Style Lounge Chair', category: 'Chairs', price: 299.99, quantity: 2 }, // Low stock
  { id: '5', sku: 'FUR-STO-005', name: 'Walnut 5-Drawer Dresser', category: 'Storage', price: 449.99, quantity: 6 },
  { id: '6', sku: 'FUR-SOF-006', name: 'Chesterfield Leather Sofa', category: 'Sofas', price: 1299.99, quantity: 4 }, // Low stock
  { id: '7', sku: 'FUR-TAB-007', name: 'Glass Coffee Table', category: 'Tables', price: 199.99, quantity: 15 },
  { id: '8', sku: 'FUR-BED-008', name: 'Tufted Queen Headboard', category: 'Beds', price: 349.99, quantity: 1 }, // Low stock
  { id: '9', sku: 'FUR-LGT-009', name: 'Brass Arc Floor Lamp', category: 'Lighting', price: 149.99, quantity: 10 }
];

export default function App() {
  // Navigation View State
  const [currentView, setView] = useState('dashboard');

  // Core State: Load from Local Storage or fallback to mock data
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('furniture_inventory');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_INVENTORY;
  });

  const [salesHistory, setSalesHistory] = useState(() => {
    const saved = localStorage.getItem('furniture_sales');
    return saved ? JSON.parse(saved) : [];
  });

  // Receipt Modal State
  const [latestSale, setLatestSale] = useState(null);

  // Notification Toast State
  const [notifications, setNotifications] = useState([]);

  // Sync to Local Storage
  useEffect(() => {
    localStorage.setItem('furniture_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('furniture_sales', JSON.stringify(salesHistory));
  }, [salesHistory]);

  // Alert Manager Helper
  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Inventory logic
  const handleAddItem = (item) => {
    const newId = Date.now().toString();
    setInventory((prev) => [{ ...item, id: newId }, ...prev]);
    addNotification(`"${item.name}" added to stock successfully!`, 'success');
  };

  const handleEditItem = (id, updatedItem) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
    );
    addNotification(`"${updatedItem.name}" updated successfully!`, 'success');
  };

  const handleDeleteItem = (id) => {
    const targetItem = inventory.find((item) => item.id === id);
    setInventory((prev) => prev.filter((item) => item.id !== id));
    if (targetItem) {
      addNotification(`"${targetItem.name}" removed from catalog.`, 'warning');
    }
  };

  // Quick Restock trigger on Dashboard
  const handleRestockItem = (id, amount) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + amount;
          addNotification(`Restocked +${amount} units for "${item.name}".`, 'success');
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Checkout process completed in POS Billing
  const handleCompleteSale = (cartItems, subtotal, tax, grandTotal, billDiscount, billDiscountAmount) => {
    // 1. Deduct quantities from stock
    setInventory((prevInventory) =>
      prevInventory.map((item) => {
        const cartItem = cartItems.find((c) => c.id === item.id);
        if (cartItem) {
          return { ...item, quantity: Math.max(0, item.quantity - cartItem.qty) };
        }
        return item;
      })
    );

    // 2. Generate invoice ID (INV-[YYYYMMDD]-[RANDOM-4-DIGIT])
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `INV-${todayStr}-${randomCode}`;

    // 3. Create Transaction Log
    const newSale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      invoiceNo,
      items: cartItems.map(c => ({ id: c.id, sku: c.sku, name: c.name, price: c.price, qty: c.qty, discount: c.discount || 0 })),
      subtotal,
      tax,
      grandTotal,
      billDiscount: billDiscount || 0,
      billDiscountAmount: billDiscountAmount || 0
    };

    setSalesHistory((prev) => [newSale, ...prev]);
    
    // 4. Open Receipt print preview modal
    setLatestSale(newSale);
    addNotification('Billing complete! Receipt generated.', 'success');
  };

  const handleClearSalesHistory = () => {
    setSalesHistory([]);
    addNotification('Sales logs cleared successfully.', 'warning');
  };

  // Switch display depending on sidebar selection
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            inventory={inventory} 
            salesHistory={salesHistory} 
            setView={setView} 
            onRestock={handleRestockItem}
          />
        );
      case 'inventory':
        return (
          <Inventory 
            inventory={inventory} 
            onAddItem={handleAddItem} 
            onEditItem={handleEditItem} 
            onDeleteItem={handleDeleteItem}
            addNotification={addNotification}
          />
        );
      case 'billing':
        return (
          <Billing 
            inventory={inventory} 
            onCompleteSale={handleCompleteSale} 
            addNotification={addNotification}
          />
        );
      case 'reports':
        return (
          <Reports 
            salesHistory={salesHistory}
            inventory={inventory}
            onViewReceipt={setLatestSale}
            onClearSalesHistory={handleClearSalesHistory}
          />
        );
      default:
        return (
          <Dashboard 
            inventory={inventory} 
            salesHistory={salesHistory} 
            setView={setView} 
            onRestock={handleRestockItem}
          />
        );
    }
  };

  // Header Title mapping
  const getViewTitleDetails = () => {
    switch (currentView) {
      case 'dashboard':
        return {
          title: 'Store Dashboard',
          subtitle: 'Real-time sales performance and operational stock alerts.'
        };
      case 'inventory':
        return {
          title: 'Furniture Stock Inventory',
          subtitle: 'Add, update, or remove physical furniture catalog inventory.'
        };
      case 'billing':
        return {
          title: 'Point of Sale (POS) Billing',
          subtitle: 'Create invoice bills, select catalog items, and process sales.'
        };
      case 'reports':
        return {
          title: 'Financial Sales Reports',
          subtitle: 'Track gross revenues, top items, and invoice logs.'
        };
      default:
        return {
          title: 'Store Dashboard',
          subtitle: ''
        };
    }
  };

  const headerDetails = getViewTitleDetails();

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="brand-section" style={{ gap: '14px' }}>
            <img src="/logo.png" alt="Stylinly Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', backgroundColor: '#fff', padding: '3px' }} />
            <div className="brand-name" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1.1, color: '#FFFFFF', letterSpacing: '0.5px' }}>stylinly</span>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary-accent)', fontWeight: '700' }}>Sofas & Beds</span>
            </div>
          </div>
          
          <nav className="nav-links">
            <button 
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Dashboard
            </button>

            <button 
              className={`nav-item ${currentView === 'inventory' ? 'active' : ''}`}
              onClick={() => setView('inventory')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              Stock Catalog
            </button>

            <button 
              className={`nav-item ${currentView === 'billing' ? 'active' : ''}`}
              onClick={() => setView('billing')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              Create Invoice (POS)
            </button>

            <button 
              className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
              onClick={() => setView('reports')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
              Business Reports
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div>Stylinly POS Admin</div>
          <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.6 }}>v1.0.0 &bull; 2026 Admin</div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        
        {/* App Header */}
        <header className="app-header">
          <div className="header-title-area">
            <h1>{headerDetails.title}</h1>
            <p>{headerDetails.subtitle}</p>
          </div>
          
          <div className="header-meta">
            <div className="date-badge">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Dynamic View Panel */}
        {renderCurrentView()}
        
      </main>

      {/* Receipt Printer Modal */}
      {latestSale && (
        <ReceiptModal 
          sale={latestSale} 
          onClose={() => setLatestSale(null)}
        />
      )}

      {/* Toast Notification Container */}
      <div className="notification-container">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`notification-toast toast-${notif.type}`}
          >
            <div className="toast-icon-wrapper">
              {notif.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: 'var(--success)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              )}
              {notif.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: 'var(--error)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notif.type === 'warning' && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: 'var(--warning)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <div className="toast-message">{notif.message}</div>
            <button className="toast-close-btn" onClick={() => removeNotification(notif.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
