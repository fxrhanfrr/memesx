# MemeX - Social Media Platform for Memes

A modern, full-stack social media application built with React, Node.js, and Firebase for sharing and discovering memes.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with dark/light theme support
- **Real-time Updates**: Live feed updates and notifications
- **User Authentication**: Secure login/signup with Firebase Auth
- **Community System**: Create and join communities around interests
- **Post Management**: Share memes, images, and videos with voting system
- **Responsive Design**: Mobile-first approach with excellent cross-device support

## 🏗️ Project Structure

```
memex/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   └── styles/        # CSS and styling
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js/Express backend API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middlewares/   # Express middlewares
│   │   └── config/        # Configuration files
│   └── package.json
└── package.json       # Root package.json for workspace management
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Firebase** - Authentication and real-time database

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Firebase Admin** - Server-side Firebase integration
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **Helmet** - Security middleware

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd memex
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   - Create `.env` file in the backend directory
   - Add your Firebase configuration
   - Set up environment variables

4. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend    # Frontend on port 3000
   npm run dev:backend     # Backend on port 5000
   ```

## 🎨 Customization

The application uses a comprehensive CSS system with CSS variables for easy customization. See `frontend/CSS_CUSTOMIZATION.md` for detailed customization guide.

### Quick Customization Examples

**Change Theme Colors:**
```css
:root {
  --primary-500: #3b82f6;  /* Change to blue */
  --primary-600: #2563eb;
}
```

**Adjust Spacing:**
```css
:root {
  --space-md: 0.75rem;     /* More compact */
  --space-lg: 2rem;        /* More spacious */
}
```

## 📱 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run install:all` - Install dependencies for all packages
- `npm run build` - Build frontend for production

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🔧 Development

### Frontend Development
- Located in `frontend/` directory
- Uses Vite for fast development
- Hot module replacement enabled
- Tailwind CSS for styling

### Backend Development
- Located in `backend/` directory
- Express.js API server
- Firebase integration
- JWT authentication

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend
```bash
cd backend
npm start
# Or use PM2 for production
pm2 start src/server.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using modern web technologies