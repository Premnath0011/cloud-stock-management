import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/api/auth/staff');
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) return setError('All fields required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setSaving(true);
    try {
      await axios.post('/api/auth/add-staff', form);
      setSuccess('Staff member added successfully!');
      setShowModal(false);
      setForm({ name: '', email: '', password: '' });
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await axios.delete(`/api/auth/staff/${id}`);
      setStaffList(staffList.filter(s => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h4>Staff Management</h4>
          <p className="text-muted mb-0">{staffList.length} staff members</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); }}>+ Add Staff</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="card table-card">
        <div className="card-header">Staff Members</div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
          ) : staffList.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <div style={{ fontSize: '3rem' }}>👥</div>
              <p>No staff members yet</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add First Staff Member</button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Added On</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {staffList.map((s, i) => (
                    <tr key={s._id}>
                      <td>{i + 1}</td>
                      <td className="fw-semibold">{s.name}</td>
                      <td>{s.email}</td>
                      <td><span className="badge bg-info">STAFF</span></td>
                      <td><small>{new Date(s.createdAt).toLocaleDateString('en-IN')}</small></td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s._id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="card mt-3" style={{ border: '1px solid #e3f2fd', borderRadius: 12 }}>
        <div className="card-body">
          <h6 className="fw-bold text-primary">ℹ️ Staff Access Information</h6>
          <ul className="mb-0">
            <li>Staff can <strong>create new sales</strong> and view sales history</li>
            <li>Staff can <strong>view product inventory</strong> but cannot add/edit/delete products</li>
            <li>Staff <strong>cannot</strong> cancel sales, manage other staff, or view reports</li>
            <li>All staff data is <strong>isolated to your store</strong></li>
          </ul>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Staff Member</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Staff member name" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address *</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Staff email" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password *</label>
                    <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Adding...' : 'Add Staff'}
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

export default Staff;
