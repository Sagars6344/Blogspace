import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/dashboard.css';

const API = 'https://airy-contentment-production-06c4.up.railway.app';

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }
    axios.get(`${API}/api/dashboard/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => { setData(response.data); setLoading(false); })
      .catch(error => { console.error('Error fetching dashboard:', error); setLoading(false); });
  }, [navigate]);

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Loading dashboard...</div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Could not load dashboard.</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Your Dashboard</h1>
        <p>Overview of your published content</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card-icon">👁</div><div className="stat-card-label">Total Views</div><div className="stat-card-value">{data.total_views.toLocaleString()}</div></div>
        <div className="stat-card"><div className="stat-card-icon">❤️</div><div className="stat-card-label">Total Likes</div><div className="stat-card-value">{data.total_likes.toLocaleString()}</div></div>
        <div className="stat-card"><div className="stat-card-icon">📝</div><div className="stat-card-label">Posts Published</div><div className="stat-card-value">{data.post_count}</div></div>
      </div>
      <div className="dashboard-grid">
        <div className="top-posts-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-card-header"><span className="chart-card-title">Top Posts</span></div>
          {data.top_posts.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No posts yet. Start writing!</p> : data.top_posts.map((post, i) => (
            <div className="top-post-item" key={i}>
              <span className="top-post-rank">#{i + 1}</span>
              <div className="top-post-info">
                <div className="top-post-title">{post.title}</div>
                <div className="top-post-views">👁 {post.views.toLocaleString()} views · ❤️ {post.likes}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="recent-table-card">
        <div className="chart-card-header"><span className="chart-card-title">Recent Posts</span></div>
        {data.recent_posts.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No posts yet.</p> : (
          <table className="recent-table">
            <thead><tr><th>Title</th><th>Date</th><th>Views</th><th>Likes</th><th>Status</th></tr></thead>
            <tbody>
              {data.recent_posts.map((post, i) => (
                <tr key={i}>
                  <td>{post.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{post.date}</td>
                  <td>{post.views.toLocaleString()}</td>
                  <td>{post.likes}</td>
                  <td><span className={`status-badge status-${post.status}`}>{post.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;