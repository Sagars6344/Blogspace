import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css';

const API = 'https://airy-contentment-production-06c4.up.railway.app';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    axios.post(`${API}/api/reset-password/`, { token, password })
      .then(() => { setSuccess(true); setLoading(false); setTimeout(() => navigate('/login'), 2500); })
      .catch(err => { setError(err.response?.data?.error || 'Something went wrong. Link may have expired.'); setLoading(false); });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">BlogSpace</div>
        <div className="login-tagline">Create a new password</div>
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 className="login-title" style={{ textAlign: 'center' }}>Password reset!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <h2 className="login-title">Set new password</h2>
            {error && <div style={{ background: 'rgba(233,69,96,0.15)', color: 'var(--accent)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: '44px', width: '100%' }} />
                <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', userSelect: 'none' }}>{showPassword ? '🙈' : '👁️'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ paddingRight: '44px', width: '100%' }} />
                <span onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', userSelect: 'none' }}>{showConfirm ? '🙈' : '👁️'}</span>
              </div>
            </div>
            <button className="btn-login" onClick={handleSubmit} disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
          </>
        )}
        <div className="login-footer" style={{ marginTop: '20px' }}><Link to="/login">← Back to login</Link></div>
      </div>
    </div>
  );
}

export default ResetPassword;