import React from 'react';
import { Link } from 'react-router-dom';
import { Home, TrendingUp, Plus, Users, Award, Star } from 'lucide-react';
import { useFetch } from '../hooks/useInfiniteScroll';
import { useAuth } from '../context/AuthContext';

// The Sidebar component provides global navigation and a summary of popular communities.
export default function Sidebar() {
  const { currentUser } = useAuth();
  
  // Use the custom hook to fetch a list of popular communities.
  // This assumes the backend returns an array of communities.
  const { data: communitiesData } = useFetch('/api/communities?limit=5');

  const popularCommunities = communitiesData?.communities || [];

  return (
    <div className="w-full lg:w-80 space-y-6">
      {/* Navigation Section */}
      <div className="sidebar-modern">
        <h2 className="sidebar-title-modern">
          <Home className="sidebar-title-icon" />
          Menu
        </h2>
        <nav className="sidebar-nav">
          <Link
            to="/"
            className="sidebar-nav-item"
          >
            <Home className="sidebar-nav-icon" />
            <div className="sidebar-nav-info">
              <h4>Home</h4>
              <p>Discover trending content</p>
            </div>
          </Link>
          <Link
            to="/popular"
            className="sidebar-nav-item"
          >
            <TrendingUp className="sidebar-nav-icon" />
            <div className="sidebar-nav-info">
              <h4>Popular</h4>
              <p>Most shared content</p>
            </div>
          </Link>
          {currentUser && (
            <Link
              to="/create"
              className="sidebar-nav-item"
            >
              <Plus className="sidebar-nav-icon" />
              <div className="sidebar-nav-info">
                <h4>Create Post</h4>
                <p>Share something new</p>
              </div>
            </Link>
          )}
          <Link
            to="/communities"
            className="sidebar-nav-item"
          >
            <Users className="sidebar-nav-icon" />
            <div className="sidebar-nav-info">
              <h4>Communities</h4>
              <p>Find your interests</p>
            </div>
          </Link>
        </nav>
      </div>

      {/* Popular Communities Section */}
      <div className="sidebar-modern">
        <h2 className="sidebar-title-modern">
          <Award className="sidebar-title-icon" />
          Popular Communities
        </h2>
        <div className="sidebar-communities">
          {popularCommunities.map((community) => (
            <Link
              key={community.id}
              to={`/r/${community.name}`}
              className="sidebar-community-item"
            >
              <div className="sidebar-community-avatar">
                {community.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-community-info">
                <h4>r/{community.name}</h4>
                <p>{community.memberCount.toLocaleString()} members</p>
              </div>
            </Link>
          ))}
        </div>
        <Link
          to="/communities"
          className="sidebar-link"
        >
          View All Communities
        </Link>
      </div>

      {/* Create Community Section (only for logged-in users) */}
      {currentUser && (
        <div className="sidebar-modern">
          <h2 className="sidebar-title-modern">
            <Star className="sidebar-title-icon" />
            Create a Community
          </h2>
          <p className="sidebar-text">
            Build and grow a community about something you care about
          </p>
          <Link
            to="/create-community"
            className="sidebar-button"
          >
            Create Community
          </Link>
        </div>
      )}

      {/* About MemeX Section */}
      <div className="sidebar-modern">
        <h2 className="sidebar-title-modern">About MemeX</h2>
        <p className="sidebar-text">
          The ultimate platform for sharing memes, funny content, and engaging with the community.
        </p>
        <div className="sidebar-footer">
          <p>© 2024 MemeX</p>
          <p>Built with React & Firebase</p>
        </div>
      </div>
    </div>
  );
}
