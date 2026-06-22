# BlogSpace 🚀

A full-stack blogging platform built with **React** (frontend) and **Django REST Framework** (backend). Users can write, publish, and discover blog posts — with real authentication, notifications, analytics, and AI-powered writing assistance.

---

## Live Demo

> Coming soon — deployment in progress

---

## Features

### For Readers
- Browse and discover blog posts by category
- Like and comment on posts
- Subscribe to authors
- Share posts via native share or clipboard
- View author public profiles

### For Writers
- Write and publish blogs with cover images
- Smart writing assistant with auto-tags and tips
- Personal dashboard with views, likes, and subscriber stats
- Edit profile — username, email, phone, password, avatar, cover photo

### Authentication
- JWT-based secure login and registration
- Forgot password via real Gmail email with reset link
- Password show/hide on all forms

### Notifications
- Real-time bell icon with unread count
- Notified when someone likes your post, comments, or subscribes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Axios, Custom CSS |
| Backend | Django, Django REST Framework |
| Authentication | SimpleJWT (JSON Web Tokens) |
| Database | SQLite (dev) |
| File Storage | Django Media (Pillow) |
| Email | Gmail SMTP |

---

## Project Structure

```
Blogs/
├── blog-frontend/        # React app
│   ├── src/
│   │   ├── components/   # Navbar, PostCard
│   │   ├── pages/        # Home, Login, Register, Profile, BlogDetail, Dashboard, WriteBlog, Explore, Notifications
│   │   └── styles/       # CSS files
│   └── package.json
│
└── backend/              # Django project
    ├── blog/
    │   ├── models.py     # Post, Comment, Profile, Notification, PasswordResetToken
    │   ├── views.py      # All API endpoints
    │   ├── serializers.py
    │   └── urls.py
    └── myblog/
        ├── settings.py
        └── urls.py
```

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/blogspace.git
cd blogspace/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux

# Install dependencies
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt Pillow

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd ../blog-frontend

# Install dependencies
npm install

# Start development server
npm start
```

App runs on `http://localhost:3000` and API on `http://127.0.0.1:8000`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts/` | All blog posts |
| GET | `/api/posts/:id/` | Single post + view count |
| POST | `/api/posts/:id/like/` | Like a post |
| POST | `/api/posts/:id/comment/` | Comment on a post |
| POST | `/api/create-post/` | Publish a new post |
| POST | `/api/register/` | Register new user |
| POST | `/api/token/` | Login (get JWT tokens) |
| GET | `/api/my-profile/` | Logged-in user profile |
| GET | `/api/profile/:username/` | Public user profile |
| POST | `/api/subscribe/:username/` | Toggle subscribe |
| POST | `/api/update-profile/` | Edit profile info |
| POST | `/api/update-profile-images/` | Upload avatar/cover |
| POST | `/api/forgot-password/` | Send reset email |
| POST | `/api/reset-password/` | Reset with token |
| GET | `/api/notifications/` | Get notifications |
| POST | `/api/dashboard/` | Dashboard analytics |

---

## Screenshots

> Add screenshots here after deployment

---

## Author

**Sagar** — Built from scratch as a full-stack portfolio project.

- GitHub: [Sagars6344](https://github.com/YOUR_USERNAME)

---

## License

MIT License — free to use and modify.
