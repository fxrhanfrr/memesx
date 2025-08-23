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
      {/* Navigation Section - Horizontal Layout */}
      <div className="sidebar">
        <div className="sidebar-section">
          <h2 className="sidebar-title mb-4">Menu</h2>
          <nav className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="community-item flex-shrink-0 min-w-[120px]"
            >
              <Home className="w-5 h-5 text-primary-500" />
              <div className="community-info">
                <h4>Home</h4>
                <p className="text-xs">Discover trending content</p>
              </div>
            </Link>
            <Link
              to="/popular"
              className="community-item flex-shrink-0 min-w-[120px]"
            >
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <div className="community-info">
                <h4>Popular</h4>
                <p className="text-xs">Most shared content</p>
              </div>
            </Link>
            {currentUser && (
              <Link
                to="/create"
                className="community-item flex-shrink-0 min-w-[120px]"
              >
                <Plus className="w-5 h-5 text-primary-500" />
                <div className="community-info">
                  <h4>Create Post</h4>
                  <p className="text-xs">Share something new</p>
                </div>
              </Link>
            )}
            <Link
              to="/communities"
              className="community-item flex-shrink-0 min-w-[120px]"
            >
              <Users className="w-5 h-5 text-primary-500" />
              <div className="community-info">
                <h4>Communities</h4>
                <p className="text-xs">Find your interests</p>
              </div>
            </Link>
          </nav>
        </div>
      </div>

      {/* Popular Communities Section - Horizontal Cards */}
      <div className="sidebar">
        <div className="sidebar-section">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary-500" />
            <h2 className="sidebar-title">Popular Communities</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {popularCommunities.map((community, index) => (
              <Link
                key={community.id}
                to={`/r/${community.name}`}
                className="community-item flex-shrink-0 min-w-[140px]"
              >
                <div className="community-avatar">
                  {community.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="community-info">
                  <h4>r/{community.name}</h4>
                  <p className="text-xs">{community.memberCount.toLocaleString()} members</p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            to="/communities"
            className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4 font-medium"
          >
            View All Communities
          </Link>
        </div>
      </div>

      {/* Create Community Section (only for logged-in users) */}
      {currentUser && (
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary-500" />
              <h2 className="sidebar-title">Create a Community</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Build and grow a community about something you care about
            </p>
            <Link
              to="/create-community"
              className="btn btn-primary w-full"
            >
              Create Community
            </Link>
          </div>
        </div>
      )}

      {/* About MemeX Section */}
      <div className="sidebar">
        <div className="sidebar-section">
          <h2 className="sidebar-title">About MemeX</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The ultimate platform for sharing memes, funny content, and engaging with the community.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            <p>© 2024 MemeX</p>
            <p>Built with React & Firebase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
