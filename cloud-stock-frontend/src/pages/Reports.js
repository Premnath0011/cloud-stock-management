import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1976d2', '#7b1fa2', '#388e3c', '#f57c00', '#d32f2f', '#0097a7'];

const Reports = () => {
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [filteredSales, setFilteredSales] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chartRes, topRes, statsRes] = await Promise.all([
        axios.get('/api/dashboard/monthly-chart'),
        axios.get('/api/dashboard/top-products'),
        axios.get('/api/dashboard/stats')
      ]);
      setChartData(chartRes.data);
      setTopProducts(topRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return alert('Please select date range');
    setReportLoading(true);
    try {
      const params = new URLSearchParams({ startDate: dateRange.startDate, endDate: dateRange.endDate, limit: 1000 });
      const res = await axios.get(`/api/sales?${params}`);
      setFilteredSales(res.data.sales);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const reportTotal = filteredSales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.totalAmount, 0);
  const formatCurrency = n => `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="page-header">
        <h4>Reports & Analytics</h4>
        <p className="text-muted mb-0">Business intelligence and sales analysis</p>
      </div>

      {/* KPI Summary */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card p-3 text-center" style={{ borderLeft: '4px solid #1976d2' }}>
            <h5>{formatCurrency(stats?.total?.revenue)}</h5><small className="text-muted">All-Time Revenue</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card p-3 text-center" style={{ borderLeft: '4px solid #388e3c' }}>
            <h5>{stats?.total?.orders || 0}</h5><small className="text-muted">Total Orders</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card p-3 text-center" style={{ borderLeft: '4px solid #f57c00' }}>
            <h5>{formatCurrency(stats?.monthly?.revenue)}</h5><small className="text-muted">This Month</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card p-3 text-center" style={{ borderLeft: '4px solid #7b1fa2' }}>
            <h5>{formatCurrency(stats?.today?.revenue)}</h5><small className="text-muted">Today</small>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-7">
          <div className="card table-card">
            <div className="card-header">📊 Monthly Revenue (Last 6 Months)</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-5">
          <div className="card table-card">
            <div className="card-header">🥧 Top Products Revenue Share</div>
            <div className="card-body">
              {topProducts.length === 0 ? (
                <div className="text-center text-muted p-4">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={topProducts} dataKey="totalRevenue" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id }) => _id}>
                      {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Date Report */}
      <div className="card table-card mb-4">
        <div className="card-header">📅 Generate Custom Report</div>
        <div className="card-body">
          <div className="row g-2 align-items-end mb-3">
            <div className="col-6 col-md-3">
              <label className="form-label">From Date</label>
              <input type="date" className="form-control" value={dateRange.startDate}
                onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">To Date</label>
              <input type="date" className="form-control" value={dateRange.endDate}
                onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })} />
            </div>
            <div className="col-12 col-md-2">
              <button className="btn btn-primary w-100" onClick={generateReport} disabled={reportLoading}>
                {reportLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {filteredSales.length > 0 && (
            <>
              <div className="row g-2 mb-3">
                <div className="col-6 col-md-3">
                  <div className="p-3 rounded text-center" style={{ background: '#e8f5e9' }}>
                    <h6 className="mb-0 text-success">{formatCurrency(reportTotal)}</h6><small>Total Revenue</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 rounded text-center" style={{ background: '#e3f2fd' }}>
                    <h6 className="mb-0 text-primary">{filteredSales.filter(s => s.status === 'completed').length}</h6><small>Completed</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 rounded text-center" style={{ background: '#fce4ec' }}>
                    <h6 className="mb-0 text-danger">{filteredSales.filter(s => s.status === 'cancelled').length}</h6><small>Cancelled</small>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-striped">
                  <thead className="table-dark">
                    <tr><th>Sale #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {filteredSales.map(s => (
                      <tr key={s._id}>
                        <td>{s.saleNumber}</td>
                        <td>{s.customerName}</td>
                        <td>{s.items.length}</td>
                        <td className="fw-semibold">{formatCurrency(s.totalAmount)}</td>
                        <td><span className={`badge ${s.status === 'completed' ? 'bg-success' : s.status === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark'}`}>{s.status}</span></td>
                        <td><small>{new Date(s.createdAt).toLocaleDateString('en-IN')}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
