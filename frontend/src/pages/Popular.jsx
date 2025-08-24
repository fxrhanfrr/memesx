import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.jsx';
import PostCard from '../components/PostCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { Loader, TrendingUp, Clock, Award, Flame, Star, TrendingUp as TrendingIcon, Zap, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Popular() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('popular');
  const { currentUser, userProfile } = useAuth();
  const { data: posts, loading, hasMore, loadMore } = useInfiniteScroll(`/api/posts?sort=${sortBy}`);

  // Check if user needs to complete profile setup
  useEffect(() => {
    if (currentUser && userProfile && !userProfile.displayName) {
      navigate('/profile-setup');
    }
  }, [currentUser, userProfile, navigate]);

  const sortOptions = [
    { 
      value: 'popular', 
      label: 'Popular', 
      icon: TrendingUp,
      description: 'Most upvoted content',
      color: 'from-orange-500 to-red-500'
    },
    { 
      value: 'trending', 
      label: 'Trending', 
      icon: Flame,
      description: 'Rising in popularity',
      color: 'from-red-500 to-pink-500'
    },
    { 
      value: 'top', 
      label: 'Top', 
      icon: Crown,
      description: 'All-time best posts',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const handleVote = (postId, voteType) => {
    // Update local state optimistically
    // The actual vote is handled in PostCard component
  };

  return (
    <div className="page-container">
      {/* Animated Background */}
      <div className="page-background">
        <div className="page-bg-circle"></div>
        <div className="page-bg-circle"></div>
        <div className="page-bg-circle"></div>
      </div>

      <div className="page-content">
        <div className="page-layout">
          <main className="page-main">
            {/* Enhanced Hero Section */}
            <div className="hero-section">
              <div className="hero-sparkles">
                <Flame className="hero-sparkle text-orange-500" />
                <TrendingIcon className="hero-sparkle text-red-500" />
                <Crown className="hero-sparkle text-yellow-500" />
              </div>
              <h1 className="hero-title">Popular Content</h1>
              <p className="hero-subtitle">
                Discover the most trending and popular memes that everyone is talking about! 
                From viral sensations to community favorites, find what's hot right now.
              </p>
              {currentUser && (
                <div className="hero-actions">
                  <Link to="/create" className="hero-button">
                    <Zap className="w-5 h-5" />
                    Create Trending Content
                  </Link>
                  <Link to="/communities" className="hero-button-secondary">
                    <TrendingUp className="w-5 h-5" />
                    Explore Communities
                  </Link>
                </div>
              )}
            </div>

            {/* Enhanced Sort Options */}
            <div className="sort-section">
              <div className="sort-header">
                <div className="sort-label">Sort by:</div>
                <div className="sort-description">Choose how you want to discover content</div>
              </div>
              <div className="sort-options">
                {sortOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`sort-button ${
                        sortBy === option.value
                          ? 'sort-button-active'
                          : 'sort-button-inactive'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="sort-button-content">
                        <Icon className="sort-icon" />
                        <div className="sort-text">
                          <span className="sort-label-text">{option.label}</span>
                          <span className="sort-description-text">{option.description}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="posts-feed">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="post-card-wrapper"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PostCard post={post} onVote={handleVote} />
                </div>
              ))}
              
              {loading && (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Loading amazing content...</p>
                </div>
              )}
              
              {!loading && posts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <TrendingUp className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="empty-state-title">No popular posts yet</h3>
                  <p className="empty-state-text">
                    Be the first to create trending content! Your memes could be the next big thing.
                  </p>
                  {currentUser && (
                    <Link to="/create" className="empty-state-button">
                      <Zap className="w-5 h-5" />
                      Create Your First Post
                    </Link>
                  )}
                </div>
              )}
              
              {hasMore && !loading && posts.length > 0 && (
                <div className="load-more-container">
                  <button
                    onClick={loadMore}
                    className="load-more-button"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Load More Popular Content
                  </button>
                </div>
              )}
            </div>
          </main>
          
          <aside className="page-sidebar">
            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
