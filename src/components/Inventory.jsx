import React, { useState } from 'react';

const CATEGORIES = ['Sofas', 'Tables', 'Beds', 'Chairs', 'Storage', 'Lighting'];

export default function Inventory({ inventory, onAddItem, onEditItem, onDeleteItem, addNotification }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form fields state
  const [currentItem, setCurrentItem] = useState(null); // for editing
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: CATEGORIES[0],
    price: '',
    quantity: ''
  });
  
  // Handlers for Add Form
  const openAddModal = () => {
    // Generate a quick default SKU
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      sku: `FUR-GEN-${randomNum}`,
      name: '',
      category: CATEGORIES[0],
      price: '',
      quantity: ''
    });
    setIsAddModalOpen(true);
  };
  
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price);
    const qtyNum = parseInt(formData.quantity, 10);
    
    // Validations
    if (!formData.name.trim()) {
      addNotification('Item name cannot be empty', 'error');
      return;
    }
    if (!formData.sku.trim()) {
      addNotification('SKU cannot be empty', 'error');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      addNotification('Please enter a valid price', 'error');
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      addNotification('Please enter a valid quantity', 'error');
      return;
    }
    
    // Check for duplicate SKU
    if (inventory.some(item => item.sku.toLowerCase() === formData.sku.trim().toLowerCase())) {
      addNotification(`SKU "${formData.sku}" already exists!`, 'error');
      return;
    }
    
    onAddItem({
      sku: formData.sku.trim().toUpperCase(),
      name: formData.name.trim(),
      category: formData.category,
      price: priceNum,
      quantity: qtyNum
    });
    
    setIsAddModalOpen(false);
  };

  // Handlers for Edit Form
  const openEditModal = (item) => {
    setCurrentItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      quantity: item.quantity.toString()
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price);
    const qtyNum = parseInt(formData.quantity, 10);

    // Validations
    if (!formData.name.trim()) {
      addNotification('Item name cannot be empty', 'error');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      addNotification('Please enter a valid price', 'error');
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      addNotification('Please enter a valid quantity', 'error');
      return;
    }

    // Check for duplicate SKU excluding current item
    if (inventory.some(item => item.sku.toLowerCase() === formData.sku.trim().toLowerCase() && item.id !== currentItem.id)) {
      addNotification(`SKU "${formData.sku}" already exists on another item!`, 'error');
      return;
    }

    onEditItem(currentItem.id, {
      sku: formData.sku.trim().toUpperCase(),
      name: formData.name.trim(),
      category: formData.category,
      price: priceNum,
      quantity: qtyNum
    });

    setIsEditModalOpen(false);
    setCurrentItem(null);
  };

  // Handler for Delete
  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" (SKU: ${item.sku})?`)) {
      onDeleteItem(item.id);
    }
  };

  // Filters logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="inventory-view card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Control panel (Search, filter, Add button) */}
      <div className="panel-controls">
        <div className="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
          </svg>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <button className="btn-success" onClick={openAddModal}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Furniture
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU / ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Quantity in Stock</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No furniture items found matching your filters.
                </td>
              </tr>
            ) : (
              filteredInventory.map(item => {
                const isLowStock = item.quantity < 5;
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '600', color: 'var(--primary-light)' }}>{item.sku}</td>
                    <td style={{ fontWeight: '500' }}>{item.name}</td>
                    <td>
                      <span className="badge badge-category">{item.category}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      Rs. {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={isLowStock ? 'stock-low-warning' : ''}>
                      {item.quantity} units
                    </td>
                    <td>
                      {item.quantity === 0 ? (
                        <span className="badge badge-red">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="badge badge-red">Low Stock</span>
                      ) : (
                        <span className="badge badge-green">In Stock</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => openEditModal(item)}
                          title="Edit furniture details"
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-danger btn-sm"
                          onClick={() => handleDelete(item)}
                          title="Delete furniture item"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Furniture Item</h2>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="item-sku">SKU / Code</label>
                  <input 
                    type="text" 
                    id="item-sku"
                    className="form-control" 
                    value={formData.sku} 
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="item-name">Furniture Item Name</label>
                  <input 
                    type="text" 
                    id="item-name"
                    className="form-control" 
                    placeholder="e.g. Oak Dining Table"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="item-category">Category</label>
                  <select 
                    id="item-category"
                    className="form-control"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="item-price">Unit Price (Rs.)</label>
                    <input 
                      type="number" 
                      id="item-price"
                      step="0.01" 
                      min="0"
                      placeholder="0.00"
                      className="form-control" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="item-qty">Qty in Stock</label>
                    <input 
                      type="number" 
                      id="item-qty"
                      min="0" 
                      placeholder="0"
                      className="form-control" 
                      value={formData.quantity} 
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-success">Add to Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Furniture Item</h2>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>SKU / Code (Read-Only)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.sku} 
                    disabled 
                    style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)' }}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-name">Furniture Item Name</label>
                  <input 
                    type="text" 
                    id="edit-name"
                    className="form-control" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-category">Category</label>
                  <select 
                    id="edit-category"
                    className="form-control"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-price">Unit Price (Rs.)</label>
                    <input 
                      type="number" 
                      id="edit-price"
                      step="0.01" 
                      min="0"
                      className="form-control" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-qty">Qty in Stock</label>
                    <input 
                      type="number" 
                      id="edit-qty"
                      min="0" 
                      className="form-control" 
                      value={formData.quantity} 
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
