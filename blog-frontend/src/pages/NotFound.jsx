import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '64px', marginBottom: '8px' }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '16px' }}>
        Oops, this page doesn't exist
      </p>
      <Link to="/" style={{ color: 'var(--accent)', fontWeight: '600' }}>
        ← Go back home
      </Link>
    </div>
  );
}

export default NotFound;