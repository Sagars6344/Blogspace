import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/home.css';

const categories = ["All", "Technology", "Programming", "AI", "Career", "Design"];

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/posts/')
      .then(response => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
        setLoading(false);
      });
  }, []);

  const filtered = activeTab === "All"
    ? posts
    : posts.filter(p => p.tag === activeTab);

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Welcome to <span>BlogSpace</span></h1>
        <p>Discover stories, ideas and knowledge from writers worldwide</p>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search articles..." />
        </div>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`tab ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <h2 className="section-title">
        {activeTab === "All" ? "Latest Posts" : activeTab}
      </h2>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading posts...</p>
      ) : (
        <div className="posts-grid">
          {filtered.map(post => (
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
                  <Link
                    to={`/profile/${post.author_name}`}
                    className="post-author"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
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
      )}
    </div>
  );
}

export default Home;