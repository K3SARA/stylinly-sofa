import React from 'react';

export default function ReceiptModal({ sale, onClose }) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px', borderRadius: '12px' }}>
        
        <div className="modal-header" style={{ padding: '16px 20px' }}>
          <h2 style={{ fontSize: '16px' }}>Sale Completed Successfully</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          
          {/* Thermal Receipt Paper representation */}
          <div className="receipt-paper">
            
            <div className="receipt-header">
              <div className="receipt-brand">STYLINFO CO.</div>
              <div style={{ fontSize: '11px', color: '#666' }}>100 Pine Timber Lane, Suite A</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Phone: (555) 123-4567</div>
            </div>

            <div className="receipt-line"></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>INVOICE:</span>
                <span style={{ fontWeight: '700' }}>{sale.invoiceNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>DATE:</span>
                <span>{new Date(sale.date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>TIME:</span>
                <span>{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>CASHIER:</span>
                <span>Navin (Admin)</span>
              </div>
            </div>

            <div className="receipt-line"></div>

            {/* Itemized List with Item Discounts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0' }}>
              {sale.items.map((item, index) => (
                <div key={index} className="receipt-item-row">
                  <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '70%' }}>
                    <span style={{ fontWeight: '600' }}>{item.name}</span>
                    <span style={{ fontSize: '10px', color: '#666' }}>
                      {item.qty} x Rs. {item.price.toFixed(2)} {item.discount > 0 && `(Less ${item.discount}%)`}
                    </span>
                  </div>
                  <span style={{ fontWeight: '600', alignSelf: 'flex-end' }}>
                    Rs. {(item.price * item.qty * (1 - (item.discount || 0) / 100)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="receipt-line"></div>

            {/* Calculations Summary with Invoice Discount */}
            <div className="receipt-summary-section">
              <div className="receipt-summary-row">
                <span>SUBTOTAL:</span>
                <span>Rs. {sale.subtotal.toFixed(2)}</span>
              </div>
              
              {sale.billDiscountAmount > 0 && (
                <div className="receipt-summary-row" style={{ color: '#000' }}>
                  <span>DISCOUNT ({sale.billDiscount}%):</span>
                  <span>-Rs. {sale.billDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="receipt-summary-row">
                <span>TAX (10.0%):</span>
                <span>Rs. {sale.tax.toFixed(2)}</span>
              </div>
              <div className="receipt-line" style={{ width: '100%', maxWidth: '220px', margin: '6px 0' }}></div>
              <div className="receipt-summary-row bold">
                <span>GRAND TOTAL:</span>
                <span>Rs. {sale.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="receipt-line"></div>

            <div className="receipt-footer">
              <div>Thank you for your purchase!</div>
              <div style={{ marginTop: '4px', fontSize: '9px', color: '#666' }}>ALL SALES FINAL ON DISCOUNTED ITEMS</div>
              <div style={{ fontSize: '9px', color: '#666' }}>Powered by Stylinly POS v1.0</div>
            </div>

          </div>

        </div>

        <div className="modal-footer" style={{ padding: '12px 20px', backgroundColor: 'var(--bg-app)' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn-primary" onClick={handlePrint}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0a2.25 2.25 0 0 1-2.244 2.077H8.584A2.25 2.25 0 0 1 6.34 18m11.32 0h-11.32m11.32 0v-4.571m0 0a8.084 8.084 0 0 0-.72-3.152m0 0a3 3 0 0 0-3-3H9.42a3 3 0 0 0-3 3 8.084 8.084 0 0 0-.72 3.152m0 0V18m11.32 0H6.34" />
            </svg>
            Print Invoice
          </button>
        </div>

      </div>
    </div>
  );
}
