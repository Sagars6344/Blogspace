import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/home.css';

function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/posts/')
      .then(res => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const trending = [...posts].sort((a, b) => b.views - a.views).slice(0, 3);

  const authorMap = {};
  posts.forEach(post => {
    if (!authorMap[post.author_name]) {
      authorMap[post.author_name] = {
        name: post.author_name,
        avatar: post.author_avatar,
        posts: 0,
        views: 0
      };
    }
    authorMap[post.author_name].posts += 1;
    authorMap[post.author_name].views += post.views;
  });
  const topAuthors = Object.values(authorMap)
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Explore <span>BlogSpace</span></h1>
        <p>Discover trending stories and top writers</p>
      </div>

      <h2 className="section-title">🔥 Trending This Week</h2>
      <div className="posts-grid" style={{ marginBottom: '48px' }}>
        {trending.map(post => (
          <div className="post-card" key={post.id}>
            <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                className="post-card-image"
                style={post.cover_image ? {
                  backgroundImage: `url(${post.cover_image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                {!post.cover_image && post.emoji}
              </div>
              <div className="post-card-body">
                <span className="post-card-tag">{post.tag}</span>
                <h3 className="post-card-title">{post.title}</h3>
                <p className="post-card-excerpt">{post.excerpt}</p>
              </div>
            </Link>
            <div className="post-card-body" style={{ paddingTop: 0 }}>
              <div className="post-card-footer">
                <Link to={`/profile/${post.author_name}`} className="post-author" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div
                    className="author-avatar"
                    style={post.author_avatar ? {
                      backgroundImage: `url(http://127.0.0.1:8000${post.author_avatar})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    } : {}}
                  >
                    {!post.author_avatar && post.author_name[0].toUpperCase()}
                  </div>
                  <span className="author-name">{post.author_name}</span>
                </Link>
                <div className="post-stats">
                  <span className="stat">👁 {post.views}</span>
                  <span className="stat">❤️ {post.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">⭐ Top Authors</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '48px' }}>
        {topAuthors.map((author, i) => (
          <Link to={`/profile/${author.name}`} key={i} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--card-bg)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '20px',
              display: 'flex', alignItems: 'center', gap: '14px',
              transition: 'border-color 0.2s', cursor: 'pointer'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'var(--accent)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontWeight: '700',
                fontSize: '18px', flexShrink: 0,
                ...(author.avatar ? {
                  backgroundImage: `url(http://127.0.0.1:8000${author.avatar})`,
                  backgroundSize: 'cover', backgroundPosition: 'center'
                } : {})
              }}>
                {!author.avatar && author.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  {author.name}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {author.posts} posts · 👁 {author.views.toLocaleString()} views
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Explore;