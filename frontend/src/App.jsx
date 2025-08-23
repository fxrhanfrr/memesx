import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import CreatePost from './pages/CreatePost.jsx';
import PostDetail from './pages/PostDetail.jsx';
import UserProfile from './pages/UserProfile.jsx';
import Community from './pages/Community.jsx';
import Communities from './pages/Communities.jsx';
import CreateCommunity from './pages/CreateCommunity.jsx';
import Search from './pages/Search.jsx';
import NotFound from './pages/NotFound.jsx';
import './styles/app.css';

// Simple test component
function TestHome() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
        MemeX - Social Media for Memes
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400">
        Welcome to MemeX! The app is working correctly.
      </p>
      <div className="mt-8 text-center">
        <button className="btn btn-primary">
          Test Button
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/user/:uid" element={<UserProfile />} />
              <Route path="/r/:name" element={<Community />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/create-community" element={<CreateCommunity />} />
              <Route path="/search" element={<Search />} />
              <Route path="/test" element={<TestHome />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;