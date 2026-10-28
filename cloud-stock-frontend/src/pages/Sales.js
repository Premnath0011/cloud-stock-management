import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '' });
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchSales(); }, [page, filters]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, ...filters });
      Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
      const res = await axios.get(`/api/sales?${params}`);
      setSales(res.data.sales);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this sale? Stock will be restored.')) return;
    try {
      await axios.put(`/api/sales/${id}/cancel`);
      fetchSales();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    }
  };

  const formatDate = d => new Date(d).toLocaleString('en-IN');
  const formatCurrency = n => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h4>Sales History</h4>
          <p className="text-muted mb-0">{total} total records</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/sales/new')}>+ New Sale</button>
      </div>

      {/* Filters */}
      <div className="card table-card mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-6 col-md-3">
              <label className="form-label small">From Date</label>
              <input type="date" className="form-control form-control-sm" value={filters.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small">To Date</label>
              <input type="date" className="form-control form-control-sm" value={filters.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small">Status</label>
              <select className="form-select form-select-sm" value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <button className="btn btn-sm btn-outline-secondary w-100"
                onClick={() => { setFilters({ startDate: '', endDate: '', status: '' }); setPage(1); }}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card table-card">
        <div className="card-header">Sales Records</div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
          ) : sales.length === 0 ? (
            <div className="text-center p-5 text-muted">No sales found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Sale #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale._id}>
                      <td><span className="fw-semibold text-primary">{sale.saleNumber}</span></td>
                      <td>{sale.customerName}</td>
                      <td><span className="badge bg-secondary">{sale.items.length} items</span></td>
                      <td className="fw-bold text-success">{formatCurrency(sale.totalAmount)}</td>
                      <td>{sale.paymentMethod.toUpperCase()}</td>
                      <td>
                        <span className={`badge ${sale.status === 'completed' ? 'badge-completed' : sale.status === 'cancelled' ? 'badge-cancelled' : 'badge-pending'}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td><small>{sale.createdBy?.name}</small></td>
                      <td><small>{formatDate(sale.createdAt)}</small></td>
                      <td>
                        <button className="btn btn-sm btn-outline-info me-1" onClick={() => setSelected(sale)}>View</button>
                        {user?.role === 'owner' && sale.status === 'completed' && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(sale._id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <small className="text-muted">Page {page} of {totalPages}</small>
            <div className="btn-group">
              <button className="btn btn-sm btn-outline-primary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <button className="btn btn-sm btn-outline-primary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selected && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sale Details — {selected.saleNumber}</h5>
                <button className="btn-close" onClick={() => setSelected(null)} />
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p><strong>Customer:</strong> {selected.customerName}</p>
                    <p><strong>Payment:</strong> {selected.paymentMethod.toUpperCase()}</p>
                    <p><strong>Status:</strong> {selected.status}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Date:</strong> {formatDate(selected.createdAt)}</p>
                    <p><strong>Staff:</strong> {selected.createdBy?.name}</p>
                    {selected.notes && <p><strong>Notes:</strong> {selected.notes}</p>}
                  </div>
                </div>
                <table className="table table-sm">
                  <thead className="table-light"><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    {selected.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-end">
                  <p>Subtotal: {formatCurrency(selected.subtotal)}</p>
                  {selected.discount > 0 && <p className="text-danger">Discount: -{formatCurrency(selected.discount)}</p>}
                  {selected.tax > 0 && <p>Tax: +{formatCurrency(selected.tax)}</p>}
                  <h5 className="fw-bold">Total: {formatCurrency(selected.totalAmount)}</h5>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
