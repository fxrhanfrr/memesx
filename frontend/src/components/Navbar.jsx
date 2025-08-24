import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  User, 
  LogOut, 
  Home, 
  Moon, 
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Check if user needs to complete profile setup
  useEffect(() => {
    if (currentUser && userProfile && !userProfile.displayName) {
      navigate('/profile-setup');
    }
  }, [currentUser, userProfile, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">M</div>
          <span>MemeX</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="navbar-search">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search MemeX"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="navbar-search-input"
              />
              <Search className="navbar-search-icon" />
            </div>
          </form>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-actions">
          <button
            onClick={toggleTheme}
            className="navbar-btn navbar-btn-ghost"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="navbar-btn-icon" /> : <Moon className="navbar-btn-icon" />}
          </button>

          {currentUser ? (
            <>
              <Link
                to="/"
                className="navbar-btn navbar-btn-ghost"
                aria-label="Home"
              >
                <Home className="navbar-btn-icon" />
              </Link>
              <Link
                to="/create"
                className="navbar-btn navbar-btn-primary"
              >
                <Plus className="navbar-btn-icon" />
                <span>Create</span>
              </Link>
              <div className="navbar-user">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="navbar-user-btn"
                >
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Profile"
                      className="navbar-user-avatar"
                    />
                  ) : (
                    <div className="navbar-user-placeholder">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="navbar-user-name">
                    {userProfile?.displayName || 'User'}
                  </span>
                </button>
                {showUserMenu && (
                  <div className="navbar-user-menu">
                    <Link
                      to={`/user/${currentUser.uid}`}
                      className="navbar-user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="navbar-user-menu-icon" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="navbar-user-menu-item"
                    >
                      <LogOut className="navbar-user-menu-icon" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-actions">
              <Link
                to="/login"
                className="navbar-btn navbar-btn-ghost"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="navbar-btn navbar-btn-primary"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="navbar-mobile-btn"
          aria-label="Toggle mobile menu"
        >
          {showMobileMenu ? <X className="navbar-btn-icon" /> : <Menu className="navbar-btn-icon" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="navbar-mobile-menu">
          {/* Mobile Search */}
          <div className="navbar-mobile-search">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search MemeX"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="navbar-search-input"
                />
                <Search className="navbar-search-icon" />
              </div>
            </form>
          </div>

          {/* Mobile Navigation */}
          <div className="navbar-mobile-actions">
            <button
              onClick={toggleTheme}
              className="navbar-mobile-btn-item"
            >
              {isDark ? <Sun className="navbar-btn-icon" /> : <Moon className="navbar-btn-icon" />}
              {isDark ? 'Light' : 'Dark'}
            </button>

            {currentUser ? (
              <>
                <Link
                  to="/"
                  className="navbar-mobile-btn-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Home className="navbar-btn-icon" />
                  Home
                </Link>
                <Link
                  to="/create"
                  className="navbar-mobile-btn-item navbar-mobile-btn-primary"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Plus className="navbar-btn-icon" />
                  Create
                </Link>
                <Link
                  to={`/user/${currentUser.uid}`}
                  className="navbar-mobile-btn-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="navbar-btn-icon" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="navbar-mobile-btn-item"
                >
                  <LogOut className="navbar-btn-icon" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="navbar-mobile-btn-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="navbar-mobile-btn-item navbar-mobile-btn-primary"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}