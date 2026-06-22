import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css';

const API = 'https://airy-contentment-production-06c4.up.railway.app';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError('');
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    setLoading(true);
    axios.post(`${API}/api/token/`, { username, password })
      .then(response => {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('username', username);
        navigate('/');
        window.location.reload();
      })
      .catch(() => {
        setError('Invalid username or password');
        setLoading(false);
      });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">BlogSpace</div>
        <div className="login-tagline">Share your thoughts with the world</div>
        <h2 className="login-title">Welcome back</h2>
        {error && <div style={{ background: 'rgba(233,69,96,0.15)', color: 'var(--accent)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        <div className="form-group">
          <label>Username</label>
          <input type="text" placeholder="sagar" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: '44px', width: '100%' }} />
            <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', userSelect: 'none' }}>
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
        </div>
        <button className="btn-login" onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="divider"><span></span><p>or</p><span></span></div>
        <div className="login-footer">Don't have an account? <Link to="/register">Sign up</Link></div>
        <div className="login-footer" style={{ marginTop: '8px' }}><Link to="/forgot-password">Forgot password?</Link></div>
      </div>
    </div>
  );
}

export default Login;