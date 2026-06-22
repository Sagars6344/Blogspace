import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/profile.css';
import '../styles/home.css';

const API = 'https://airy-contentment-production-06c4.up.railway.app';

function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);

  const fetchProfile = () => {
    const token = localStorage.getItem('access_token');
    axios.get(`${API}/api/profile/${username}/`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(response => {
        setProfile(response.data);
        setLoading(false);
        if (response.data.is_own_profile) navigate('/profile');
      })
      .catch(error => { console.error('Error fetching profile:', error); setLoading(false); });
  };

  useEffect(() => { fetchProfile(); }, [username]);

  const handleSubscribe = () => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }
    setSubLoading(true);
    axios.post(`${API}/api/subscribe/${username}/`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        setProfile(prev => ({ ...prev, is_subscribed: response.data.subscribed, subscriber_count: response.data.subscriber_count }));
        setSubLoading(false);
      })
      .catch(err => { console.error(err); setSubLoading(false); });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Loading profile...</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>User not found.</div>;

  const getUrl = (url) => url ? (url.startsWith('http') ? url : `${API}${url}`) : null;

  return (
    <div className="profile-page">
      <div className="profile-cover" style={profile.cover_image ? { backgroundImage: `url(${getUrl(profile.cover_image)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}></div>
      <div className="profile-info-section">
        <div className="profile-avatar-row">
          <div className="profile-avatar" style={profile.avatar_image ? { backgroundImage: `url(${getUrl(profile.avatar_image)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {!profile.avatar_image && profile.username[0].toUpperCase()}
          </div>
          <div className="profile-actions">
            <button className={`btn-subscribe ${profile.is_subscribed ? 'subscribed' : ''}`} onClick={handleSubscribe} disabled={subLoading}>
              {subLoading ? '...' : profile.is_subscribed ? '✓ Subscribed' : 'Subscribe'}
            </button>
          </div>
        </div>
        <h1 className="profile-name">{profile.username}</h1>
        <p className="profile-bio">Full-stack developer & tech writer building things with React and Django. 🚀</p>
        <div className="profile-stats-row">
          <div className="profile-stat"><div className="profile-stat-value">{profile.post_count}</div><div className="profile-stat-label">Posts</div></div>
          <div className="profile-stat"><div className="profile-stat-value">{profile.subscriber_count}</div><div className="profile-stat-label">Subscribers</div></div>
          <div className="profile-stat"><div className="profile-stat-value">{profile.total_views.toLocaleString()}</div><div className="profile-stat-label">Total Views</div></div>
          <div className="profile-stat"><div className="profile-stat-value">{profile.total_likes.toLocaleString()}</div><div className="profile-stat-label">Total Likes</div></div>
        </div>
        <div className="profile-tabs"><button className="profile-tab active">Posts</button></div>
        <div className="profile-posts-grid">
          {profile.posts.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No posts published yet.</p> : profile.posts.map(post => (
            <Link to={`/blog/${post.id}`} key={post.id} style={{ textDecoration: 'none' }}>
              <div className="post-card">
                <div className="post-card-image" style={post.cover_image ? { backgroundImage: `url(${getUrl(post.cover_image)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>{!post.cover_image && post.emoji}</div>
                <div className="post-card-body">
                  <span className="post-card-tag">{post.tag}</span>
                  <h3 className="post-card-title">{post.title}</h3>
                  <p className="post-card-excerpt">{post.excerpt}</p>
                  <div className="post-card-footer">
                    <div className="post-author"><div className="author-avatar">{profile.username[0].toUpperCase()}</div><span className="author-name">{profile.username}</span></div>
                    <div className="post-stats"><span className="stat">👁 {post.views}</span><span className="stat">❤️ {post.likes}</span></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;