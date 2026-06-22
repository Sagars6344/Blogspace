import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css';

const API = 'https://airy-contentment-production-06c4.up.railway.app';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    setError('');
    if (!username || !password) { setError('Username and password are required'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    axios.post(`${API}/api/register/`, { username, email, password })
      .then(() => navigate('/login'))
      .catch(err => { setError(err.response?.data?.error || 'Something went wrong'); setLoading(false); });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">BlogSpace</div>
        <div className="login-tagline">Join thousands of writers today</div>
        <h2 className="login-title">Create account</h2>
        {error && <div style={{ background: 'rgba(233,69,96,0.15)', color: 'var(--accent)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        <div className="form-group"><label>Username</label><input type="text" placeholder="sagar" value={username} onChange={e => setUsername(e.target.value)} /></div>
        <div className="form-group"><label>Email</label><input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="form-group">
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: '44px', width: '100%' }} />
            <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px' }}>{showPassword ? '🙈' : '👁️'}</span>
          </div>
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ paddingRight: '44px', width: '100%' }} />
            <span onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px' }}>{showConfirm ? '🙈' : '👁️'}</span>
          </div>
        </div>
        <button className="btn-login" onClick={handleRegister} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        <div className="divider"><span></span><p>or</p><span></span></div>
        <div className="login-footer">Already have an account? <Link to="/login">Login</Link></div>
      </div>
    </div>
  );
}

export default Register;