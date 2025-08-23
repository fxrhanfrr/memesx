import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from 'project\frontend\src\context\AuthContext.jsx';
import { ThemeProvider } from 'project\frontend\src\context\ThemeContext.jsx';
import Navbar from 'src\components\Navbar.jsx';
import Home from 'project\frontend\src\pages\Home.jsx';
import Login from 'project\frontend\src\pages\Login.jsx';
import Signup from 'project\frontend\src\pages\Signup.jsx';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import UserProfile from './pages/UserProfile';
import Community from './pages/Community';
import Communities from './pages/Communities';
import CreateCommunity from './pages/CreateCommunity';
import Search from './pages/Search';
import NotFound from './pages/NotFound';

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;