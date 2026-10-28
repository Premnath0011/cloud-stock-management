import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.storeName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem' }}>☁️</div>
          <h3>Register Store</h3>
          <p className="text-muted mb-0">Create your cloud sales account</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold">Full Name</label>
              <input type="text" name="name" className="form-control" placeholder="Your name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Store Name</label>
              <input type="text" name="storeName" className="form-control" placeholder="Your store name" value={form.storeName} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Email Address</label>
              <input type="email" name="email" className="form-control" placeholder="Enter email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">Password</label>
              <input type="password" name="password" className="form-control" placeholder="Password" value={form.password} onChange={handleChange} required />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">Confirm</label>
              <input type="password" name="confirmPassword" className="form-control" placeholder="Confirm" value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 mt-4"
            style={{ background: 'linear-gradient(135deg, #1a237e, #1565c0)', border: 'none' }}
            disabled={loading}
          >
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating Account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already registered? <Link to="/login" className="text-primary fw-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
