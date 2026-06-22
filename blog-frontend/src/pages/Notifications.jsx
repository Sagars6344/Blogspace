import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://127.0.0.1:8000/api/notifications/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setNotifications(res.data.notifications);
        setLoading(false);

        axios.post('http://127.0.0.1:8000/api/notifications/mark-read/', {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Notifications</h1>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
          <p>No notifications yet</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>When someone likes, comments or subscribes, you'll see it here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n, i) => (
            <Link
              to={n.post_id ? `/blog/${n.post_id}` : `/profile/${n.user}`}
              key={i}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: n.is_read ? 'var(--card-bg)' : 'rgba(233,69,96,0.08)',
                border: `1px solid ${n.is_read ? 'var(--border)' : 'rgba(233,69,96,0.2)'}`,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '22px', flexShrink: 0 }}>{n.emoji}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                    <strong>{n.user}</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{n.text}</span>
                  </p>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                {!n.is_read && (
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'var(--accent)', flexShrink: 0
                  }}></div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;