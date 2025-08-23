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
    <div className="w-80 space-y-4">
      {/* Navigation Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Menu</h2>
          <nav className="space-y-2">
            <Link
              to="/"
              className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link
              to="/popular"
              className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Popular</span>
            </Link>
            {currentUser && (
              <Link
                to="/create"
                className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Post</span>
              </Link>
            )}
            <Link
              to="/communities"
              className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Communities</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Popular Communities Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Award className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Popular Communities</h2>
          </div>
          <div className="space-y-3">
            {popularCommunities.map((community, index) => (
              <Link
                key={community.id}
                to={`/r/${community.name}`}
                className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-2 rounded-md transition-colors group"
              >
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {community.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-orange-600">
                      r/{community.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {community.memberCount.toLocaleString()} members
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link
            to="/communities"
            className="block text-center text-sm text-orange-500 hover:text-orange-600 mt-3 font-medium"
          >
            View All Communities
          </Link>
        </div>
      </div>

      {/* Create Community Section (only for logged-in users) */}
      {currentUser && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Create a Community</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Build and grow a community about something you care about
            </p>
            <Link
              to="/create-community"
              className="block w-full bg-orange-500 text-white py-2 px-4 rounded-full hover:bg-orange-600 transition-colors font-medium text-center"
            >
              Create Community
            </Link>
          </div>
        </div>
      )}

      {/* About MemeX Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">About MemeX</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
