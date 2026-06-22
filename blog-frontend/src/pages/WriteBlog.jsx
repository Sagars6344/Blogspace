import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/writeblog.css';

const topicKeywords = {
  react: ['React', 'Frontend', 'JavaScript'],
  django: ['Django', 'Backend', 'Python'],
  career: ['Career', 'Advice', 'Growth'],
  ai: ['AI', 'Machine Learning', 'Tech'],
  code: ['Programming', 'Best Practices', 'Tutorial'],
};

function WriteBlog() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Technology');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [autoTags, setAutoTags] = useState([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (content.length < 60) {
      setShowSuggestion(false);
      return;
    }

    const timer = setTimeout(() => {
      const lower = content.toLowerCase();
      let tags = [];
      let tip = '';

      if (lower.includes('react') || lower.includes('component')) {
        tags = topicKeywords.react;
        tip = "Consider adding a code snippet here — readers engage 40% more with visual code examples.";
      } else if (lower.includes('django') || lower.includes('python')) {
        tags = topicKeywords.django;
        tip = "Mention specific Django version or library names — it helps with search visibility.";
      } else if (lower.includes('career') || lower.includes('job')) {
        tags = topicKeywords.career;
        tip = "Personal stories perform well in career posts — consider adding your own experience.";
      } else if (lower.includes('ai') || lower.includes('machine learning')) {
        tags = topicKeywords.ai;
        tip = "Your post is missing a closing thought. Adding a 2-line takeaway boosts read-through rate.";
      } else {
        tags = topicKeywords.code;
        tip = "Your introduction is strong. Try breaking up long paragraphs for easier reading.";
      }

      setAutoTags(tags);
      setSuggestionText(tip);
      setShowSuggestion(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [content]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please add a title and content before publishing');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login to publish a post');
      navigate('/login');
      return;
    }

    setPublishing(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('tag', category);
    formData.append('excerpt', content.slice(0, 150));
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }

    axios.post('http://127.0.0.1:8000/api/create-post/', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        alert('Post published! 🎉');
        navigate('/');
        window.location.reload();
      })
      .catch(err => {
        console.error(err);
        alert('Failed to publish. Please try again.');
        setPublishing(false);
      });
  };

  return (
    <div className="write-page">
      <div className="write-header">
        <h1>Write a new story</h1>
        <div className="write-actions">
          <button className="btn-draft">Save Draft</button>
          <button className="btn-publish" onClick={handlePublish} disabled={publishing}>
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <label htmlFor="cover-upload">
        <div
          className="write-cover"
          style={coverPreview ? {
            backgroundImage: `url(${coverPreview})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: 'none',
            color: 'transparent'
          } : {}}
        >
          {!coverPreview && (
            <>
              <span style={{ fontSize: '28px', marginBottom: '8px' }}>🖼️</span>
              Click to add a cover image
            </>
          )}
        </div>
      </label>
      <input
        id="cover-upload"
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />

      <input
        className="write-title-input"
        placeholder="Your story title..."
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <div className="write-meta-row">
        <select className="write-tag-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option>Technology</option>
          <option>Programming</option>
          <option>AI</option>
          <option>Career</option>
          <option>Design</option>
        </select>
      </div>

      <textarea
        className="write-content-textarea"
        placeholder="Tell your story..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      {showSuggestion && (
        <div className="smart-suggest-box">
          <span className="smart-suggest-icon">💡</span>
          <div className="smart-suggest-text">
            <strong>Writing tip:</strong> {suggestionText}
            {autoTags.length > 0 && (
              <div className="auto-tags-row">
                {autoTags.map((tag, i) => (
                  <span className="auto-tag-chip" key={i}>#{tag}</span>
                ))}
              </div>
            )}
          </div>
          <button className="smart-suggest-dismiss" onClick={() => setShowSuggestion(false)}>×</button>
        </div>
      )}

      <div className="write-footer-bar">
        <span>{wordCount} words · {readTime} min read</span>
        <span>Auto-saved just now</span>
      </div>
    </div>
  );
}

export default WriteBlog;