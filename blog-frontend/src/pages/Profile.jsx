import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/profile.css';
import '../styles/home.css';
import '../styles/login.css';

function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [modalAvatarFile, setModalAvatarFile] = useState(null);
  const [modalAvatarPreview, setModalAvatarPreview] = useState(null);
  const [modalCoverFile, setModalCoverFile] = useState(null);
  const [modalCoverPreview, setModalCoverPreview] = useState(null);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const modalAvatarInputRef = useRef(null);
  const modalCoverInputRef = useRef(null);

  const fetchProfile = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://127.0.0.1:8000/api/my-profile/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setProfile(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [navigate]);

  const handleImageUpload = (file, type) => {
    const token = localStorage.getItem('access_token');
    if (!token || !file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append(type, file);

    axios.post('http://127.0.0.1:8000/api/update-profile-images/', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        fetchProfile();
        setUploading(false);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to upload image');
        setUploading(false);
      });
  };

  const openEditModal = () => {
    setEditUsername(profile.username);
    setEditEmail(profile.email || '');
    setEditPhone(profile.phone || '');
    setCurrentPassword('');
    setNewPassword('');
    setEditError('');
    setEditSuccess('');
    setModalAvatarFile(null);
    setModalAvatarPreview(null);
    setModalCoverFile(null);
    setModalCoverPreview(null);
    setShowEditModal(true);
  };

  const handleModalAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModalAvatarFile(file);
      setModalAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleModalCoverSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModalCoverFile(file);
      setModalCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = () => {
    setEditError('');
    setEditSuccess('');

    const token = localStorage.getItem('access_token');
    if (!token) return;

    setSavingProfile(true);

    const doTextUpdate = () => {
      return axios.post('http://127.0.0.1:8000/api/update-profile/', {
        username: editUsername,
        email: editEmail,
        phone: editPhone,
        current_password: currentPassword,
        new_password: newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    };

    const doImageUpdate = () => {
      if (!modalAvatarFile && !modalCoverFile) return Promise.resolve();
      const formData = new FormData();
      if (modalAvatarFile) formData.append('avatar_image', modalAvatarFile);
      if (modalCoverFile) formData.append('cover_image', modalCoverFile);
      return axios.post('http://127.0.0.1:8000/api/update-profile-images/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
    };

    doTextUpdate()
      .then(() => doImageUpdate())
      .then(() => {
        setEditSuccess('Profile updated successfully!');
        setSavingProfile(false);
        fetchProfile();
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setShowEditModal(false), 1200);
      })
      .catch(err => {
        setEditError(err.response?.data?.error || 'Failed to update profile');
        setSavingProfile(false);
      });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Loading profile...</div>;
  }

  if (!profile) {
    return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Could not load profile.</div>;
  }

  return (
    <div className="profile-page">
      <div
        className="profile-cover"
        onClick={() => coverInputRef.current.click()}
        style={{
          cursor: 'pointer',
          position: 'relative',
          ...(profile.cover_image ? {
            backgroundImage: `url(http://127.0.0.1:8000${profile.cover_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {})
        }}
      >
        <div style={{
          position: 'absolute', bottom: '12px', right: '12px',
          background: 'rgba(0,0,0,0.6)', color: 'white',
          padding: '6px 14px', borderRadius: '50px', fontSize: '12px',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          📷 {profile.cover_image ? 'Change cover' : 'Add cover photo'}
        </div>
      </div>
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleImageUpload(e.target.files[0], 'cover_image')}
      />

      <div className="profile-info-section">
        <div className="profile-avatar-row">
          <div
            className="profile-avatar"
            onClick={() => avatarInputRef.current.click()}
            style={{
              cursor: 'pointer',
              position: 'relative',
              ...(profile.avatar_image ? {
                backgroundImage: `url(http://127.0.0.1:8000${profile.avatar_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : {})
            }}
          >
            {!profile.avatar_image && profile.username[0].toUpperCase()}
            <div style={{
              position: 'absolute', bottom: '0', right: '0',
              background: 'var(--accent)', color: 'white',
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', border: '3px solid var(--primary)'
            }}>
              📷
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleImageUpload(e.target.files[0], 'avatar_image')}
          />

          <div className="profile-actions">
            <button className="edit-btn" onClick={openEditModal}>
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {uploading && <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>Uploading...</p>}

        <h1 className="profile-name">{profile.username}</h1>
        <p className="profile-username">{profile.email || 'No email added'}</p>
        {profile.phone && <p className="profile-username">📞 {profile.phone}</p>}
        <p className="profile-bio">
          Full-stack developer & tech writer building things with React and Django. 🚀
        </p>

        <div className="profile-stats-row">
          <div className="profile-stat">
            <div className="profile-stat-value">{profile.post_count}</div>
            <div className="profile-stat-label">Posts</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{profile.total_views.toLocaleString()}</div>
            <div className="profile-stat-label">Total Views</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{profile.total_likes.toLocaleString()}</div>
            <div className="profile-stat-label">Total Likes</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{profile.subscriber_count || 0}</div>
            <div className="profile-stat-label">Subscribers</div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
        </div>

        {activeTab === 'posts' && (
          <div className="profile-posts-grid">
            {profile.posts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                You haven't published any posts yet. <Link to="/write" style={{ color: 'var(--accent)' }}>Write your first post →</Link>
              </p>
            ) : (
              profile.posts.map(post => (
                <Link to={`/blog/${post.id}`} key={post.id} style={{ textDecoration: 'none' }}>
                  <div className="post-card">
                    <div
                      className="post-card-image"
                      style={post.cover_image ? {
                        backgroundImage: `url(http://127.0.0.1:8000${post.cover_image})`,
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
                      <div className="post-card-footer">
                        <div className="post-author">
                          <div className="author-avatar">{profile.username[0].toUpperCase()}</div>
                          <span className="author-name">{profile.username}</span>
                        </div>
                        <div className="post-stats">
                          <span className="stat">👁 {post.views}</span>
                          <span className="stat">❤️ {post.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            {editError && <div className="modal-error">{editError}</div>}
            {editSuccess && <div className="modal-success">{editSuccess}</div>}

            <p className="modal-section-title">Profile photos</p>
            <div className="modal-images-row">
              <div className="modal-image-upload">
                <div
                  className="modal-avatar-preview"
                  onClick={() => modalAvatarInputRef.current.click()}
                  style={modalAvatarPreview ? {
                    backgroundImage: `url(${modalAvatarPreview})`
                  } : profile.avatar_image ? {
                    backgroundImage: `url(http://127.0.0.1:8000${profile.avatar_image})`
                  } : {}}
                >
                  {!modalAvatarPreview && !profile.avatar_image && profile.username[0].toUpperCase()}
                </div>
                <span className="modal-image-label">Avatar</span>
                <input
                  ref={modalAvatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleModalAvatarSelect}
                />
              </div>
              <div className="modal-image-upload">
                <div
                  className="modal-cover-preview"
                  onClick={() => modalCoverInputRef.current.click()}
                  style={modalCoverPreview ? {
                    backgroundImage: `url(${modalCoverPreview})`, color: 'transparent'
                  } : profile.cover_image ? {
                    backgroundImage: `url(http://127.0.0.1:8000${profile.cover_image})`, color: 'transparent'
                  } : {}}
                >
                  {!modalCoverPreview && !profile.cover_image && 'Click to upload'}
                </div>
                <span className="modal-image-label">Cover photo</span>
                <input
                  ref={modalCoverInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleModalCoverSelect}
                />
              </div>
            </div>

            <p className="modal-section-title">Account info</p>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone number</label>
              <input type="tel" placeholder="+91 98765 43210" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
            </div>

            <p className="modal-section-title">Change password (optional)</p>
            <div className="form-group">
              <label>Current password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  placeholder="Required only if changing password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  style={{ paddingRight: '44px', width: '100%' }}
                />
                <span onClick={() => setShowCurrentPass(!showCurrentPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px' }}>
                  {showCurrentPass ? '🙈' : '👁️'}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label>New password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Leave blank to keep current password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ paddingRight: '44px', width: '100%' }}
                />
                <span onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px' }}>
                  {showNewPass ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            <button className="modal-save-btn" onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;