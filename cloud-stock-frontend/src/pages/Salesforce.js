import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Salesforce = () => {
  const [status, setStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/salesforce/status');
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await axios.get('/api/salesforce/test');
      setTestResult(res.data);
    } catch (err) {
      setTestResult({ success: false, error: err.response?.data?.message || err.message });
    } finally {
      setTesting(false);
    }
  };

  const syncAll = async () => {
    if (!window.confirm('Sync all unsynced sales to Salesforce?')) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await axios.post('/api/salesforce/sync-all');
      setSyncResult(res.data);
      fetchStatus();
    } catch (err) {
      setSyncResult({ message: err.response?.data?.message || 'Sync failed', synced: 0, failed: 0 });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h4>☁️ Salesforce Integration</h4>
        <p className="text-muted mb-0">Sync your retail sales to Salesforce CRM</p>
      </div>

      {/* Flow diagram */}
      <div className="card mb-4" style={{ border: 'none', borderRadius: 12, background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3">🔄 Integration Flow</h6>
          <div className="d-flex align-items-center flex-wrap gap-2">
            {[
              { icon: '🛒', label: 'New Sale\n(CloudSales)' },
              { icon: '→' },
              { icon: '👤', label: 'Account\n(Customer)' },
              { icon: '→' },
              { icon: '💼', label: 'Opportunity\n(Sale Record)' },
              { icon: '→' },
              { icon: '📦', label: 'Line Items\n(Products)' },
              { icon: '→' },
              { icon: '📊', label: 'SF Dashboard\n(Analytics)' },
            ].map((step, i) => (
              step.icon === '→'
                ? <span key={i} className="fw-bold text-primary fs-5">→</span>
                : (
                  <div key={i} className="text-center px-3 py-2 rounded" style={{ background: 'rgba(255,255,255,0.8)', minWidth: 90 }}>
                    <div style={{ fontSize: '1.5rem' }}>{step.icon}</div>
                    <small className="text-muted" style={{ whiteSpace: 'pre-line', fontSize: '0.7rem' }}>{step.label}</small>
                  </div>
                )
            ))}
          </div>
        </div>
      </div>

      {/* SF Enabled check */}
      {!status?.sfEnabled && (
        <div className="alert alert-warning">
          <h6 className="fw-bold">⚠️ Salesforce Not Configured</h6>
          <p className="mb-2">Add these to your <code>backend/.env</code> file:</p>
          <pre className="bg-dark text-light p-3 rounded mb-0" style={{ fontSize: '0.8rem' }}>
{`SF_LOGIN_URL=https://login.salesforce.com
SF_CLIENT_ID=your_connected_app_consumer_key
SF_CLIENT_SECRET=your_connected_app_consumer_secret
SF_USERNAME=your_salesforce_email@example.com
SF_PASSWORD=your_salesforce_password
SF_SECURITY_TOKEN=your_security_token`}
          </pre>
          <hr />
          <p className="mb-0 small">
            <strong>Get credentials:</strong> Sign up free at{' '}
            <a href="https://developer.salesforce.com/signup" target="_blank" rel="noreferrer">
              developer.salesforce.com/signup
            </a>{' '}
            → Setup → App Manager → New Connected App
          </p>
        </div>
      )}

      {/* Sync Status Cards */}
      {loading ? (
        <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card text-center p-3" style={{ borderLeft: '4px solid #1976d2' }}>
                <h4 className="mb-0 fw-bold">{status?.total || 0}</h4>
                <small className="text-muted">Total Sales</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center p-3" style={{ borderLeft: '4px solid #388e3c' }}>
                <h4 className="mb-0 fw-bold text-success">{status?.synced || 0}</h4>
                <small className="text-muted">Synced to SF</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center p-3" style={{ borderLeft: '4px solid #f57c00' }}>
                <h4 className="mb-0 fw-bold text-warning">{status?.unsynced || 0}</h4>
                <small className="text-muted">Pending Sync</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center p-3" style={{ borderLeft: '4px solid #7b1fa2' }}>
                <h4 className="mb-0 fw-bold" style={{ color: status?.sfEnabled ? '#388e3c' : '#d32f2f' }}>
                  {status?.sfEnabled ? '✅' : '❌'}
                </h4>
                <small className="text-muted">SF Connected</small>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card table-card mb-4">
            <div className="card-header">🔧 Actions</div>
            <div className="card-body d-flex gap-3 flex-wrap">
              <button className="btn btn-outline-primary" onClick={testConnection} disabled={testing || !status?.sfEnabled}>
                {testing ? <><span className="spinner-border spinner-border-sm me-2" />Testing...</> : '🔌 Test Connection'}
              </button>
              <button className="btn btn-primary" onClick={syncAll} disabled={syncing || !status?.sfEnabled || status?.unsynced === 0}>
                {syncing ? <><span className="spinner-border spinner-border-sm me-2" />Syncing...</> : `🔄 Sync All Pending (${status?.unsynced || 0})`}
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`alert ${testResult.success ? 'alert-success' : 'alert-danger'} mx-3 mb-3`}>
                {testResult.success
                  ? <>✅ <strong>Connected!</strong> Instance: {testResult.instanceUrl} · {testResult.objectCount} objects available</>
                  : <>❌ <strong>Failed:</strong> {testResult.error}</>}
              </div>
            )}

            {/* Sync Result */}
            {syncResult && (
              <div className={`alert ${syncResult.failed === 0 ? 'alert-success' : 'alert-warning'} mx-3 mb-3`}>
                <strong>{syncResult.message}</strong>
                {syncResult.errors?.length > 0 && (
                  <ul className="mt-2 mb-0">
                    {syncResult.errors.map((e, i) => <li key={i}>{e.sale}: {e.error}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Recently Synced */}
          {status?.recentSynced?.length > 0 && (
            <div className="card table-card">
              <div className="card-header">✅ Recently Synced to Salesforce</div>
              <div className="card-body p-0">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr><th>Sale #</th><th>Amount</th><th>SF Opportunity ID</th><th>Synced At</th></tr>
                  </thead>
                  <tbody>
                    {status.recentSynced.map(s => (
                      <tr key={s._id}>
                        <td className="fw-semibold text-primary">{s.saleNumber}</td>
                        <td>₹{s.totalAmount?.toLocaleString('en-IN')}</td>
                        <td><code style={{ fontSize: '0.75rem' }}>{s.sfOpportunityId}</code></td>
                        <td><small>{new Date(s.updatedAt).toLocaleString('en-IN')}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Setup Guide */}
          <div className="card mt-4" style={{ border: '1px solid #e3f2fd', borderRadius: 12 }}>
            <div className="card-body">
              <h6 className="fw-bold text-primary">📋 Setup Guide — Step by Step</h6>
              <ol className="mb-0">
                <li className="mb-2">Sign up free at <a href="https://developer.salesforce.com/signup" target="_blank" rel="noreferrer"><strong>developer.salesforce.com/signup</strong></a></li>
                <li className="mb-2">Get Security Token: <code>Avatar → Settings → My Personal Information → Reset My Security Token</code></li>
                <li className="mb-2">Create Connected App: <code>Setup → App Manager → New Connected App → Enable OAuth → Scopes: Full Access</code></li>
                <li className="mb-2">Copy <strong>Consumer Key</strong> (SF_CLIENT_ID) and <strong>Consumer Secret</strong> (SF_CLIENT_SECRET)</li>
                <li className="mb-2">Add all 6 variables to <code>backend/.env</code> and restart backend</li>
                <li className="mb-2">Click <strong>"Test Connection"</strong> above to verify</li>
                <li>Click <strong>"Sync All Pending"</strong> — your sales appear in Salesforce as Opportunities!</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Salesforce;
