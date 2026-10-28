import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const initialForm = { name: '', category: '', price: '', stock: '', description: '' };

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditProduct(null); setForm(initialForm); setError(''); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, description: p.description }); setError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditProduct(null); setForm(initialForm); setError(''); };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.category || form.price === '' || form.stock === '') {
      return setError('All fields are required');
    }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (editProduct) {
        await axios.put(`/api/products/${editProduct._id}`, payload);
      } else {
        await axios.post('/api/products', payload);
      }
      await fetchProducts();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h4>Products & Inventory</h4>
          <p className="text-muted mb-0">{products.length} products in store</p>
        </div>
        {user?.role === 'owner' && (
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        )}
      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card text-center p-3" style={{ borderLeft: '4px solid #1976d2' }}>
            <h5 className="mb-0">{products.length}</h5><small className="text-muted">Total Products</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center p-3" style={{ borderLeft: '4px solid #388e3c' }}>
            <h5 className="mb-0">{products.filter(p => p.stock > 10).length}</h5><small className="text-muted">In Stock</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center p-3" style={{ borderLeft: '4px solid #f57c00' }}>
            <h5 className="mb-0">{products.filter(p => p.stock > 0 && p.stock <= 10).length}</h5><small className="text-muted">Low Stock</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center p-3" style={{ borderLeft: '4px solid #d32f2f' }}>
            <h5 className="mb-0">{products.filter(p => p.stock === 0).length}</h5><small className="text-muted">Out of Stock</small>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Product List</span>
          <input className="form-control form-control-sm w-auto" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '200px !important' }} />
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-5 text-muted">No products found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    {user?.role === 'owner' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p._id}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="fw-semibold">{p.name}</div>
                        {p.description && <small className="text-muted">{p.description}</small>}
                      </td>
                      <td><span className="badge bg-secondary">{p.category}</span></td>
                      <td className="fw-semibold">₹{p.price.toLocaleString('en-IN')}</td>
                      <td>{p.stock}</td>
                      <td>
                        {p.stock === 0 ? <span className="badge bg-danger">Out of Stock</span>
                          : p.stock <= 5 ? <span className="badge bg-warning text-dark">Critical</span>
                          : p.stock <= 10 ? <span className="badge bg-warning text-dark">Low Stock</span>
                          : <span className="badge bg-success">In Stock</span>}
                      </td>
                      {user?.role === 'owner' && (
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(p)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editProduct ? 'Edit Product' : 'Add New Product'}</h5>
                <button className="btn-close" onClick={closeModal} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Product Name *</label>
                      <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rice 1kg" required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Category *</label>
                      <input className="form-control" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Groceries" list="categories" required />
                      <datalist id="categories">
                        {categories.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Price (₹) *</label>
                      <input className="form-control" type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Stock Quantity *</label>
                      <input className="form-control" type="number" name="stock" value={form.stock} onChange={handleChange} min="0" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <input className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="Optional" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
