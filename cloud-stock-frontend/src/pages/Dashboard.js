import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartRes, topRes, lowRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/monthly-chart'),
        axios.get('/api/dashboard/top-products'),
        axios.get('/api/dashboard/low-stock')
      ]);
      setStats(statsRes.data);
      setChartData(chartRes.data);
      setTopProducts(topRes.data);
      setLowStock(lowRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  const formatCurrency = n => `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const statCards = [
    { label: "Today's Revenue", value: formatCurrency(stats?.today?.revenue), icon: '💰', color: '#e3f2fd', iconBg: '#1976d2', sub: `${stats?.today?.orders || 0} orders` },
    { label: 'Monthly Revenue', value: formatCurrency(stats?.monthly?.revenue), icon: '📅', color: '#f3e5f5', iconBg: '#7b1fa2', sub: `${stats?.monthly?.orders || 0} orders` },
    { label: 'Total Revenue', value: formatCurrency(stats?.total?.revenue), icon: '📈', color: '#e8f5e9', iconBg: '#388e3c', sub: `${stats?.total?.orders || 0} total orders` },
    { label: 'Total Products', value: stats?.products?.total || 0, icon: '📦', color: '#fff3e0', iconBg: '#f57c00', sub: `${stats?.products?.lowStock || 0} low stock` },
  ];

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h4>Dashboard</h4>
          <p className="text-muted mb-0">Sales overview & analytics</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/sales/new')}>
          + New Sale
        </button>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((card, i) => (
          <div key={i} className="col-12 col-md-6 col-xl-3">
            <div className="card stat-card" style={{ borderLeft: `4px solid ${card.iconBg}` }}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">{card.label}</p>
                  <h4 className="mb-0 fw-bold">{card.value}</h4>
                  <small className="text-muted">{card.sub}</small>
                </div>
                <div className="stat-icon" style={{ background: card.color, color: card.iconBg }}>
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {stats?.products?.outOfStock > 0 && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          ⚠️ <strong className="ms-2">{stats.products.outOfStock} product(s) are out of stock!</strong>
          <button className="btn btn-sm btn-danger ms-auto" onClick={() => navigate('/products')}>View Products</button>
        </div>
      )}
      {stats?.products?.lowStock > 0 && (
        <div className="alert alert-warning d-flex align-items-center" role="alert">
          📉 <strong className="ms-2">{stats.products.lowStock} product(s) have low stock (≤5 units).</strong>
        </div>
      )}

      {/* Charts */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-8">
          <div className="card table-card">
            <div className="card-header">📊 Monthly Revenue (Last 6 Months)</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="card table-card h-100">
            <div className="card-header">🏆 Top Products</div>
            <div className="card-body p-0">
              {topProducts.length === 0 ? (
                <div className="text-center text-muted p-4">No sales data yet</div>
              ) : (
                <div className="list-group list-group-flush">
                  {topProducts.map((p, i) => (
                    <div key={i} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-primary me-2">#{i + 1}</span>
                        <span className="fw-semibold">{p._id}</span>
                        <div><small className="text-muted">{p.totalQuantity} units sold</small></div>
                      </div>
                      <span className="fw-bold text-success">₹{p.totalRevenue.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Chart + Low Stock */}
      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <div className="card table-card">
            <div className="card-header">📉 Monthly Orders Trend</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#7b1fa2" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="card table-card">
            <div className="card-header">⚠️ Low Stock Alert</div>
            <div className="card-body p-0">
              {lowStock.length === 0 ? (
                <div className="text-center text-muted p-4">All products well stocked ✅</div>
              ) : (
                <div className="list-group list-group-flush">
                  {lowStock.slice(0, 6).map(p => (
                    <div key={p._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{p.name}</span>
                      <span className={`badge ${p.stock === 0 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
