import React, { useState } from 'react';

const CATEGORIES = ['All', 'Sofas', 'Tables', 'Beds', 'Chairs', 'Storage', 'Lighting'];

export default function Billing({ inventory, onCompleteSale, addNotification }) {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Invoice-level discount percentage (0 - 100)
  const [billDiscount, setBillDiscount] = useState(0);
  
  // Add item to cart
  const addToCart = (item) => {
    if (item.quantity <= 0) {
      addNotification(`"${item.name}" is out of stock!`, 'error');
      return;
    }
    
    setCart((prevCart) => {
      const existingCartItem = prevCart.find((cartItem) => cartItem.id === item.id);
      
      if (existingCartItem) {
        if (existingCartItem.qty >= item.quantity) {
          addNotification(`Cannot add more. Only ${item.quantity} units available in stock.`, 'warning');
          return prevCart;
        }
        addNotification(`Updated quantity of "${item.name}" in cart.`, 'success');
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
        );
      } else {
        addNotification(`Added "${item.name}" to cart.`, 'success');
        // Initializing item with discount: 0
        return [...prevCart, { ...item, qty: 1, discount: 0 }];
      }
    });
  };

  // Adjust item quantity in cart
  const adjustQty = (itemId, amount) => {
    const inventoryItem = inventory.find((item) => item.id === itemId);
    
    setCart((prevCart) => {
      return prevCart.map((cartItem) => {
        if (cartItem.id === itemId) {
          const newQty = cartItem.qty + amount;
          
          if (newQty <= 0) {
            addNotification(`Removed "${cartItem.name}" from cart.`, 'success');
            return null; // will be filtered out below
          }
          
          if (newQty > inventoryItem.quantity) {
            addNotification(`Cannot exceed stock limit. Only ${inventoryItem.quantity} units available.`, 'warning');
            return cartItem;
          }
          
          return { ...cartItem, qty: newQty };
        }
        return cartItem;
      }).filter(Boolean);
    });
  };

  // Adjust product-level discount percentage
  const handleItemDiscountChange = (itemId, val) => {
    let pct = parseInt(val, 10);
    if (isNaN(pct)) pct = 0;
    pct = Math.max(0, Math.min(100, pct));
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, discount: pct } : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (itemId, itemName) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    addNotification(`Removed "${itemName}" from cart.`, 'success');
  };

  // Handle dropdown selection
  const handleDropdownSelect = (e) => {
    const itemId = e.target.value;
    if (!itemId) return;
    
    const item = inventory.find((p) => p.id === itemId);
    if (item) {
      addToCart(item);
    }
    e.target.value = ''; // Reset dropdown after selection
  };

  // Calculations
  // Subtotal = Sum of each line item's discounted total: Price * Qty * (1 - Discount/100)
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty * (1 - (item.discount || 0) / 100),
    0
  );

  const billDiscountAmount = subtotal * (billDiscount / 100);
  const taxableAmount = subtotal - billDiscountAmount;
  const taxRate = 0.10; // 10% tax
  const taxAmount = taxableAmount * taxRate;
  const grandTotal = taxableAmount + taxAmount;

  // Complete checkout process
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      addNotification('Cart is empty!', 'error');
      return;
    }

    // Double-check stock before completing sale
    for (const cartItem of cart) {
      const stockItem = inventory.find(i => i.id === cartItem.id);
      if (!stockItem || stockItem.quantity < cartItem.qty) {
        addNotification(`Stock mismatch for "${cartItem.name}". Only ${stockItem?.quantity || 0} units left. Please adjust cart.`, 'error');
        return;
      }
    }

    // Invoke parent sale processor with invoice metrics
    onCompleteSale(cart, subtotal, taxAmount, grandTotal, billDiscount, billDiscountAmount);
    
    // Clear states
    setCart([]);
    setBillDiscount(0);
  };

  // Filter products for catalog
  const filteredProducts = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pos-layout">
      
      {/* Left Pane - Catalog Grid */}
      <div className="catalog-panel">
        
        {/* Search & Quick Dropdown Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', alignItems: 'center' }}>
          <div className="pos-search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
            <input 
              type="text" 
              className="form-control"
              placeholder="Search furniture by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Quick Dropdown Selector */}
          <div>
            <select 
              className="form-control" 
              onChange={handleDropdownSelect}
              defaultValue=""
              style={{ cursor: 'pointer' }}
            >
              <option value="" disabled>-- Select Furniture --</option>
              {inventory.map(item => (
                <option 
                  key={item.id} 
                  value={item.id} 
                  disabled={item.quantity <= 0}
                >
                  {item.name} ({item.sku}) - Rs. {item.price.toFixed(2)} [{item.quantity <= 0 ? 'Out of Stock' : `${item.quantity} in stock`}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category horizontal scroll tabs */}
        <div className="category-tags">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-tag ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="items-catalog-grid">
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              No furniture matches your filters.
            </div>
          ) : (
            filteredProducts.map((item) => {
              const isOutOfStock = item.quantity <= 0;
              const isLowStock = item.quantity < 5 && item.quantity > 0;
              const cartItem = cart.find(c => c.id === item.id);
              const qtyInCart = cartItem ? cartItem.qty : 0;
              const remainingStock = item.quantity - qtyInCart;
              
              return (
                <div 
                  key={item.id} 
                  className={`pos-item-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                  onClick={() => !isOutOfStock && addToCart(item)}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="pos-item-cat">{item.category}</span>
                      {qtyInCart > 0 && (
                        <span className="badge badge-green" style={{ padding: '2px 6px', fontSize: '10px' }}>{qtyInCart} in cart</span>
                      )}
                    </div>
                    <div className="pos-item-name">{item.name}</div>
                  </div>
                  
                  <div className="pos-item-card-row">
                    <span className="pos-item-price">Rs. {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className={`pos-item-stock ${
                      isOutOfStock ? 'badge-red' : isLowStock ? 'badge-orange' : 'badge-green'
                    }`} style={{ backgroundColor: 'transparent', padding: 0 }}>
                      {isOutOfStock ? 'Out of stock' : `${remainingStock} left`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Right Pane - Checkout Cart */}
      <div className="cart-panel card" style={{ padding: 0 }}>
        
        {/* Cart Header */}
        <div className="cart-header">
          <h2>Active Billing Invoice</h2>
          <span className="cart-count-badge">
            {cart.reduce((sum, item) => sum + item.qty, 0)} Items
          </span>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-wrapper">
          {cart.length === 0 ? (
            <div className="empty-cart-view">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375 0 1 1-.75 0 .375 0 0 1 .75 0zm7.5 0a.375 0 1 1-.75 0 .375 0 0 1 .75 0z" />
              </svg>
              <p>Billing cart is empty</p>
              <p style={{ fontSize: '12px', marginTop: '-4px' }}>Click on products or select from dropdown to add items.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-sku">{item.sku}</div>
                  <div className="cart-item-price">Rs. {item.price.toFixed(2)}</div>
                  
                  {/* Line Item Discount Percentage input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Disc:</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      className="form-control" 
                      value={item.discount || ''} 
                      onChange={(e) => handleItemDiscountChange(item.id, e.target.value)}
                      style={{ width: '48px', padding: '2px 4px', fontSize: '11px', borderRadius: '4px', height: '20px', textAlign: 'center' }}
                      placeholder="0"
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>% off</span>
                  </div>
                </div>

                <div className="cart-qty-controls">
                  <button className="cart-qty-btn" onClick={() => adjustQty(item.id, -1)}>-</button>
                  <span className="cart-qty-value">{item.qty}</span>
                  <button className="cart-qty-btn" onClick={() => adjustQty(item.id, 1)}>+</button>
                </div>

                <div className="cart-item-right" style={{ textAlign: 'right' }}>
                  {item.discount > 0 && (
                    <div style={{ textDecoration: 'line-through', fontSize: '11px', color: 'var(--error)', opacity: 0.8 }}>
                      Rs. {(item.price * item.qty).toFixed(2)}
                    </div>
                  )}
                  <div className="cart-item-total">
                    Rs. {(item.price * item.qty * (1 - (item.discount || 0) / 100)).toFixed(2)}
                  </div>
                  
                  <button 
                    className="cart-item-remove-btn" 
                    onClick={() => removeFromCart(item.id, item.name)}
                    title="Remove item"
                    style={{ marginTop: '4px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Calculations Summary */}
        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {/* Invoice-level overall bill discount percentage input */}
          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
            <span>Order Discount (%)</span>
            <input 
              type="number" 
              min="0" 
              max="100" 
              className="form-control" 
              value={billDiscount || ''} 
              onChange={(e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 0;
                setBillDiscount(Math.max(0, Math.min(100, val)));
              }}
              placeholder="0"
              style={{ width: '54px', padding: '4px 6px', fontSize: '12px', textAlign: 'center', height: '24px', borderRadius: '4px' }}
            />
          </div>

          {billDiscountAmount > 0 && (
            <div className="summary-row" style={{ color: 'var(--error)', fontSize: '13px', fontWeight: '500' }}>
              <span>Order Discount Applied</span>
              <span>-Rs. {billDiscountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Sales Tax (10%)</span>
            <span>Rs. {taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          <div className="summary-row grand-total">
            <span>Grand Total</span>
            <span>Rs. {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <button 
            className="btn-primary btn-checkout" 
            disabled={cart.length === 0}
            onClick={handleCompleteSale}
          >
            Complete Sale & Checkout
          </button>
        </div>

      </div>
      
    </div>
  );
}
