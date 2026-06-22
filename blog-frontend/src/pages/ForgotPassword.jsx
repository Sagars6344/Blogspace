import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css';

const API = 'https://airy-contentment-production-06c4.up.railway.app';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email) return;
    setLoading(true);
    axios.post(`${API}/api/forgot-password/`, { email })
      .then(() => { setSent(true); setLoading(false); })
      .catch(() => { setSent(true); setLoading(false); });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">BlogSpace</div>
        <div className="login-tagline">Reset your password</div>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <h2 className="login-title" style={{ textAlign: 'center' }}>Check your email</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>If an account exists with <strong>{email}</strong>, we've sent a reset link.</p>
          </div>
        ) : (
          <>
            <h2 className="login-title">Forgot password?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>Enter your email and we'll send you a reset link.</p>
            <div className="form-group"><label>Email</label><input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <button className="btn-login" onClick={handleSubmit} disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </>
        )}
        <div className="login-footer" style={{ marginTop: '20px' }}><Link to="/login">← Back to login</Link></div>
      </div>
    </div>
  );
}

export default ForgotPassword;