# MemeX - Reddit-Style Meme Sharing Platform

A full-stack web application built with React, Node.js, and Firebase that allows users to share memes, create communities, and engage with content through voting and commenting.

## 🚀 Features

### Authentication
- Email/password signup and login
- Google OAuth integration
- JWT-based session handling
- User roles (admin and regular user)

### Communities (Subreddit-style)
- Create and join meme communities
- Community-specific feeds
- Member management
- Popular communities discovery

### Posts (Memes)
- Upload images and videos to Firebase Cloud Storage
- Rich text content with titles and descriptions
- Tag system for better discovery
- Upvote/downvote system with hot algorithm
- Post sorting (Hot, New, Top)
- Featured posts (admin feature)

### Comments
- Threaded comment system
- Add, edit, and delete comments
- Comment voting
- Real-time comment counts

### Feed & Discovery
- Global feed with all communities
- Community-specific feeds
- Infinite scroll pagination
- Advanced search functionality
- Trending content

### Admin Panel
- User management (ban/unban users)
- Content moderation (delete posts/comments)
- Feature posts
- Admin dashboard with statistics
- Promote users to admin

### UI/UX
- Modern, Reddit-inspired design
- Fully responsive (desktop + mobile)
- Dark/light mode toggle
- Smooth animations and transitions
- Accessible design patterns

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **TailwindCSS** for responsive, utility-first styling
- **React Router** for client-side routing
- **Lucide React** for beautiful icons
- **Firebase SDK** for authentication and storage

### Backend
- **Node.js** with Express.js REST API
- **Firebase Admin SDK** for server-side operations
- **Firebase Firestore** for database
- **Firebase Cloud Storage** for media files
- **Firebase Authentication** for user management
- **JWT** for secure API authentication

### Database & Storage
- **Firebase Firestore** - NoSQL document database
- **Firebase Cloud Storage** - File storage for images/videos
- **Firebase Authentication** - User authentication service

## 📁 Project Structure

```
/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   └── firebase.js     # Firebase client configuration
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Data models
│   │   ├── middlewares/    # Express middlewares
│   │   └── config/         # Configuration files
│   ├── server.js           # Express server entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore, Authentication, and Storage enabled

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable the following services:
   - **Authentication**: Enable Email/Password and Google providers
   - **Firestore Database**: Create in production mode
   - **Storage**: Enable for file uploads

3. Generate Firebase Admin SDK credentials:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file

4. Get your Firebase web app configuration:
   - Go to Project Settings > General
   - Add a web app and copy the config object

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your `.env` file with Firebase credentials:
```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Config
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

5. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your `.env` file with Firebase web config:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

5. Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create user profile
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/verify` - Verify JWT token

### Posts Endpoints
- `GET /api/posts` - Get posts with pagination and sorting
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post (with file upload)
- `POST /api/posts/:id/vote` - Vote on post
- `DELETE /api/posts/:id` - Delete post

### Comments Endpoints
- `GET /api/comments/post/:postId` - Get comments for post
- `POST /api/comments` - Create comment
- `POST /api/comments/:id/vote` - Vote on comment
- `PUT /api/comments/:id` - Edit comment
- `DELETE /api/comments/:id` - Delete comment

### Communities Endpoints
- `GET /api/communities` - Get all communities
- `GET /api/communities/:name` - Get single community
- `POST /api/communities` - Create community
- `POST /api/communities/:id/join` - Join community
- `POST /api/communities/:id/leave` - Leave community

### Admin Endpoints
- `GET /api/admin/stats` - Get admin dashboard stats
- `POST /api/admin/users/:uid/ban` - Ban user
- `POST /api/admin/users/:uid/unban` - Unban user
- `DELETE /api/admin/posts/:id` - Delete post (admin)
- `POST /api/admin/posts/:id/feature` - Feature post

## 🔒 Security Features

- JWT-based authentication
- Firebase Admin SDK for secure server operations
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Secure file upload handling
- Role-based access control

## 🎨 Design Features

- Modern, clean interface inspired by Reddit
- Fully responsive design for all devices
- Dark/light mode support
- Smooth animations and micro-interactions
- Accessible design with proper ARIA labels
- Loading states and error handling
- Infinite scroll for better performance

## 🚀 Deployment

### Backend Deployment
The backend can be deployed to platforms like:
- Heroku
- Railway
- Render
- Google Cloud Run
- AWS Elastic Beanstalk

### Frontend Deployment
The frontend can be deployed to:
- Vercel
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront

### Environment Variables
Make sure to set all required environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Reddit's design and functionality
- Built with modern web technologies
- Firebase for backend infrastructure
- TailwindCSS for styling system
- Lucide for beautiful icons

---

**MemeX** - Share your best memes with the world! 🎭✨#   m e m e s x  
 