import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/home.css';

function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const username = localStorage.getItem('username');

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/posts/${id}/`)
      .then(response => {
        setPost(response.data);
        setLikes(response.data.likes);
        setComments(response.data.comments);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching post:', error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  if (!post) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
      Post not found. <Link to="/" style={{ color: 'var(--accent)' }}>Go Home</Link>
    </div>
  );

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
  };

  const handleLike = () => {
    if (liked) return;

    const token = localStorage.getItem('access_token');

    axios.post(`http://127.0.0.1:8000/api/posts/${id}/like/`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(response => {
        setLikes(response.data.likes);
        setLiked(true);
      })
      .catch(error => console.error('Error liking post:', error));
  };

  const handleComment = () => {
    if (!comment.trim()) return;

    const token = localStorage.getItem('access_token');

    axios.post(`http://127.0.0.1:8000/api/posts/${id}/comment/`, {
      text: comment,
      username: username || 'Anonymous'
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(response => {
        setComments(prev => [response.data, ...prev]);
        setComment('');
      })
      .catch(error => console.error('Error posting comment:', error));
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: post.title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard! 🔗');
    }
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px' }}>

      <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
        ← Back to Home
      </Link>

      <span style={{ background: 'rgba(233,69,96,0.15)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '50px', fontSize: '13px', fontWeight: '500' }}>
        {post.tag}
      </span>

      <h1 style={{ fontSize: '36px', fontWeight: '700', lineHeight: '1.3', margin: '16px 0 12px' }}>
        {post.title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        <Link to={`/profile/${post.author_name}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--accent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '13px',
            flexShrink: 0,
            ...(post.author_avatar ? {
              backgroundImage: `url(${getImageUrl(post.author_avatar)})`,
              backgroundSize: 'cover', backgroundPosition: 'center'
            } : {})
          }}>
            {!post.author_avatar && post.author_name[0].toUpperCase()}
          </div>
          <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{post.author_name}</span>
        </Link>
        <span>·</span>
        <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span>·</span>
        <span>👁 {post.views.toLocaleString()} views</span>
      </div>

      <div
        style={{
          borderRadius: '16px',
          marginBottom: '40px',
          overflow: 'hidden',
          ...(post.cover_image ? {
            height: '320px',
            backgroundImage: `url(${getImageUrl(post.cover_image)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {
            fontSize: '72px',
            textAlign: 'center',
            background: 'var(--card-bg)',
            padding: '40px'
          })
        }}
      >
        {!post.cover_image && post.emoji}
      </div>

      <div style={{ fontSize: '17px', lineHeight: '1.9', color: 'var(--text-secondary)', marginBottom: '40px' }}>
        {post.content.split('\n\n').map((para, i) => (
          <p key={i} style={{ marginBottom: '20px' }}>{para}</p>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '40px', flexWrap: 'wrap' }}>
        <button
          onClick={handleLike}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: liked ? 'rgba(233,69,96,0.15)' : 'transparent',
            border: '1px solid var(--border)',
            color: liked ? 'var(--accent)' : 'var(--text-secondary)',
            padding: '8px 20px', borderRadius: '50px',
            cursor: liked ? 'default' : 'pointer',
            fontSize: '14px', transition: 'all 0.2s'
          }}
        >
          {liked ? '❤️' : '🤍'} {likes} Likes
        </button>

        <button
          onClick={() => setBookmarked(!bookmarked)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: bookmarked ? 'rgba(233,69,96,0.15)' : 'transparent',
            border: '1px solid var(--border)',
            color: bookmarked ? 'var(--accent)' : 'var(--text-secondary)',
            padding: '8px 20px', borderRadius: '50px',
            cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
          }}
        >
          {bookmarked ? '🔖' : '📌'} {bookmarked ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={handleShare}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', padding: '8px 20px',
            borderRadius: '50px', cursor: 'pointer', fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          🔗 Share
        </button>
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
        Comments ({comments.length})
      </h3>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'var(--accent)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontWeight: '600', flexShrink: 0
        }}>
          {username ? username[0].toUpperCase() : '?'}
        </div>
        <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleComment()}
            placeholder={username ? "Write a comment..." : "Login to comment..."}
            disabled={!username}
            style={{
              flex: 1, background: 'var(--card-bg)',
              border: '1px solid var(--border)', borderRadius: '10px',
              padding: '10px 16px', color: 'var(--text-primary)', fontSize: '14px',
              opacity: username ? 1 : 0.6
            }}
          />
          <button
            onClick={handleComment}
            disabled={!username}
            style={{
              background: 'var(--accent)', color: 'white', border: 'none',
              borderRadius: '10px', padding: '10px 18px',
              cursor: username ? 'pointer' : 'not-allowed', fontWeight: '500',
              opacity: username ? 1 : 0.6
            }}
          >
            Post
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comments.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
            No comments yet. Be the first to comment!
          </p>
        )}
        {comments.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--secondary)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', fontWeight: '600',
              fontSize: '13px', flexShrink: 0
            }}>
              {c.author_name[0].toUpperCase()}
            </div>
            <div style={{
              background: 'var(--card-bg)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '12px 16px', flex: 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{c.author_name}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {c.created_at === 'Just now' ? c.created_at : new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>{c.text}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default BlogDetail;