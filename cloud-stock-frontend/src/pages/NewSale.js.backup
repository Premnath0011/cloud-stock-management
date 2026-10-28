import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewSale = () => {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ product: '', quantity: 1, unitPrice: 0, subtotal: 0, productName: '' }]);
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState(1); // 1: Items, 2: Review, 3: Complete
  const navigate = useNavigate();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data.filter(p => p.stock > 0));
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const addItem = () => setItems([...items, { product: '', quantity: 1, unitPrice: 0, subtotal: 0, productName: '' }]);

  const removeItem = (i) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'product') {
      const product = products.find(p => p._id === value);
      if (product) {
        updated[index].unitPrice = product.price;
        updated[index].productName = product.name;
        updated[index].subtotal = product.price * updated[index].quantity;
      }
    }

    if (field === 'quantity') {
      const qty = parseInt(value) || 1;
      updated[index].quantity = qty;
      updated[index].subtotal = updated[index].unitPrice * qty;
    }

    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmount = subtotal - (parseFloat(discount) || 0) + (parseFloat(tax) || 0);

  const validateStep1 = () => {
    if (items.some(item => !item.product || item.quantity < 1)) {
      setError('Please select product and valid quantity for all items');
      return false;
    }
    const productProduct = {};
    for (const item of items) {
      const prod = products.find(p => p._id === item.product);
      if (!prod) { setError('Invalid product selected'); return false; }
      if (!productProduct[item.product]) productProduct[item.product] = 0;
      productProduct[item.product] += item.quantity;
      if (productProduct[item.product] > prod.stock) {
        setError(`Not enough stock for ${prod.name}. Available: ${prod.stock}`);
        return false;
      }
    }
    setError('');
    return true;
  };

  const goToReview = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        customerName: customerName || 'Walk-in Customer',
        items: items.map(i => ({ product: i.product, quantity: i.quantity })),
        discount: parseFloat(discount) || 0,
        tax: parseFloat(tax) || 0,
        paymentMethod,
        notes
      };
      const res = await axios.post('/api/sales', payload);
      setSuccess(res.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Sale failed');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Step indicators
  const steps = ['📝 Add Items', '🔍 Review Order', '✅ Complete'];

  if (step === 3 && success) {
    return (
      <div>
        <div className="page-header"><h4>New Sale</h4></div>
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderRadius: 16 }}>
          <div className="card-body text-center p-5">
            <div style={{ fontSize: '4rem' }}>✅</div>
            <h3 className="text-success fw-bold mt-2">Sale Completed!</h3>
            <p className="text-muted">Sale recorded successfully in the cloud</p>
            <div className="alert alert-success my-3">
              <strong>Sale #:</strong> {success.saleNumber}<br />
              <strong>Customer:</strong> {success.customerName}<br />
              <strong>Total:</strong> ₹{success.totalAmount.toLocaleString('en-IN')}<br />
              <strong>Payment:</strong> {success.paymentMethod.toUpperCase()}
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-primary" onClick={() => { setItems([{ product: '', quantity: 1, unitPrice: 0, subtotal: 0, productName: '' }]); setCustomerName(''); setDiscount(0); setTax(0); setNotes(''); setSuccess(null); setStep(1); fetchProducts(); }}>
                + New Sale
              </button>
              <button className="btn btn-outline-primary" onClick={() => navigate('/sales')}>View Sales</button>
              <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><h4>New Sale</h4><p className="text-muted mb-0">Product Setup → Sales Entry → Auto Calculate → Save</p></div>

      {/* Step Indicator */}
      <div className="d-flex gap-2 mb-4">
        {steps.map((s, i) => (
          <div key={i} className={`px-3 py-2 rounded fw-semibold small ${step === i + 1 ? 'bg-primary text-white' : step > i + 1 ? 'bg-success text-white' : 'bg-light text-muted'}`}>
            {s}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Step 1: Add Items */}
      {step === 1 && (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card table-card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>🛒 Sale Items</span>
                <button className="btn btn-sm btn-success" onClick={addItem}>+ Add Item</button>
              </div>
              <div className="card-body">
                {items.map((item, i) => (
                  <div key={i} className="sale-item-row mb-3">
                    <div className="row g-2 align-items-end">
                      <div className="col-12 col-md-5">
                        <label className="form-label small fw-semibold">Product *</label>
                        <select className="form-select" value={item.product} onChange={e => updateItem(i, 'product', e.target.value)}>
                          <option value="">-- Select Product --</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>{p.name} — ₹{p.price} (Stock: {p.stock})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-4 col-md-2">
                        <label className="form-label small fw-semibold">Qty *</label>
                        <input type="number" className="form-control" value={item.quantity} min="1"
                          onChange={e => updateItem(i, 'quantity', e.target.value)} />
                      </div>
                      <div className="col-4 col-md-2">
                        <label className="form-label small fw-semibold">Unit Price</label>
                        <input type="number" className="form-control" value={item.unitPrice} readOnly style={{ background: '#f8f9fa' }} />
                      </div>
                      <div className="col-4 col-md-2">
                        <label className="form-label small fw-semibold">Subtotal</label>
                        <input type="number" className="form-control fw-bold" value={item.subtotal.toFixed(2)} readOnly style={{ background: '#e8f5e9' }} />
                      </div>
                      <div className="col-12 col-md-1 d-flex align-items-end">
                        <button className="btn btn-sm btn-outline-danger w-100" onClick={() => removeItem(i)} disabled={items.length === 1}>×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card table-card">
              <div className="card-header">💳 Payment Details</div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Customer Name</label>
                  <input className="form-control" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Walk-in Customer" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Payment Method</label>
                  <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="cash">💵 Cash</option>
                    <option value="card">💳 Card</option>
                    <option value="upi">📱 UPI</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Discount (₹)</label>
                  <input type="number" className="form-control" value={discount} min="0" onChange={e => setDiscount(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tax (₹)</label>
                  <input type="number" className="form-control" value={tax} min="0" onChange={e => setTax(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Notes</label>
                  <textarea className="form-control" rows="2" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
                </div>
                <div className="p-3 rounded" style={{ background: '#f8f9fa' }}>
                  <div className="d-flex justify-content-between"><span>Subtotal:</span><strong>₹{subtotal.toFixed(2)}</strong></div>
                  <div className="d-flex justify-content-between text-danger"><span>Discount:</span><strong>-₹{(parseFloat(discount) || 0).toFixed(2)}</strong></div>
                  <div className="d-flex justify-content-between text-warning"><span>Tax:</span><strong>+₹{(parseFloat(tax) || 0).toFixed(2)}</strong></div>
                  <hr />
                  <div className="d-flex justify-content-between fs-5"><span className="fw-bold">TOTAL:</span><strong className="text-success">₹{totalAmount.toFixed(2)}</strong></div>
                </div>
                <button className="btn btn-primary w-100 mt-3" onClick={goToReview}>Review Order →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="card" style={{ maxWidth: 700, margin: '0 auto', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderRadius: 16 }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">🔍 Review Order</h5>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Customer:</span>
              <strong>{customerName || 'Walk-in Customer'}</strong>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Payment:</span>
              <strong>{paymentMethod.toUpperCase()}</strong>
            </div>
            <table className="table table-sm">
              <thead className="table-light"><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitPrice}</td>
                    <td>₹{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-end">
              <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
              {discount > 0 && <div className="text-danger">Discount: -₹{discount}</div>}
              {tax > 0 && <div>Tax: +₹{tax}</div>}
              <h5 className="text-success fw-bold">TOTAL: ₹{totalAmount.toFixed(2)}</h5>
            </div>
            {notes && <div className="text-muted small">Notes: {notes}</div>}
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Edit Items</button>
              <button className="btn btn-success flex-grow-1" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</> : '✅ Confirm & Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSale;
