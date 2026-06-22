import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/navbar.css';

const API = 'https://airy-contentment-production-06c4.up.railway.app';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    axios.get(`${API}/api/my-profile/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data.avatar_image) {
          const url = res.data.avatar_image.startsWith('http')
            ? res.data.avatar_image
            : `${API}${res.data.avatar_image}`;
          setAvatarUrl(url);
        }
      })
      .catch(() => {});

    const fetchUnread = () => {
      axios.get(`${API}/api/notifications/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setUnreadCount(res.data.unread_count))
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [username]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setUsername(null);
    setUnreadCount(0);
    setAvatarUrl(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="hamburger-btn" onClick={() => setMenuOpen(true)}>☰</button>
          <Link to="/" className="navbar-logo">BlogSpace</Link>
          <ul className="navbar-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/explore">Explore</Link></li>
            {!username && <li><Link to="/login">Login</Link></li>}
            {!username && <li><Link to="/register">Register</Link></li>}
            {username && <li><Link to="/dashboard">Dashboard</Link></li>}
          </ul>
        </div>
        <div className="navbar-right">
          {username && (
            <Link to="/notifications" className="navbar-icon-link" style={{ position: 'relative' }} onClick={() => setUnreadCount(0)}>
              🔔
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent)', color: 'white', width: '16px', height: '16px', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          {username && <Link to="/write"><button className="btn-write">+ Write</button></Link>}
          {username ? (
            <>
              <Link to="/profile">
                <div className="navbar-avatar" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {}}>
                  {!avatarUrl && username[0].toUpperCase()}
                </div>
              </Link>
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '7px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <Link to="/login"><button className="btn-write">Login</button></Link>
          )}
        </div>
      </nav>

      <div className={`side-menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}></div>
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          <span className="navbar-logo">BlogSpace</span>
          <button className="hamburger-btn" onClick={() => setMenuOpen(false)}>✕</button>
        </div>
        <ul className="side-menu-links">
          <li><Link to="/" onClick={() => setMenuOpen(false)}>🏠 Home</Link></li>
          <li><Link to="/explore" onClick={() => setMenuOpen(false)}>🧭 Explore</Link></li>
          {!username && <li><Link to="/login" onClick={() => setMenuOpen(false)}>🔑 Login</Link></li>}
          {!username && <li><Link to="/register" onClick={() => setMenuOpen(false)}>📝 Register</Link></li>}
          {username && <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>📊 Dashboard</Link></li>}
          {username && <li><Link to="/notifications" onClick={() => setMenuOpen(false)}>🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}</Link></li>}
          {username && <li><button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '12px 14px', fontSize: '16px', cursor: 'pointer' }}>🚪 Logout</button></li>}
        </ul>
      </div>
    </>
  );
}

export default Navbar;