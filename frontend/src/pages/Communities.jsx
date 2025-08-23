import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Users, Award, Search } from 'lucide-react';
import { useInfiniteScroll, useApi } from '../hooks/useInfiniteScroll';

// This component fetches and displays a list of all communities with search functionality.
export default function Communities() {
  const [searchQuery, setSearchQuery] = useState('');
  const { apiCall } = useApi();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce the search query to avoid excessive API calls while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Use the infinite scroll hook with the debounced search query
  const { 
    data: communities, 
    loading, 
    hasMore, 
    loadMore, 
    reset 
  } = useInfiniteScroll(`/api/communities?search=${debouncedSearchQuery}`);

  // Reset the infinite scroll when the search query changes
  useEffect(() => {
    reset();
  }, [debouncedSearchQuery]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Communities</h1>
        <div className="mt-4 sm:mt-0 w-full sm:w-1/2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Find a community..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
      </div>
      
      {/* Communities List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        {loading && communities.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {communities.length > 0 ? (
              communities.map((community) => (
                <Link
                  key={community.id}
                  to={`/r/${community.name}`}
                  className="flex items-center space-x-4 p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {community.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                      r/{community.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {community.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 flex-shrink-0">
                    <span className="flex items-center space-x-1 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{community.memberCount.toLocaleString()}</span>
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                No communities found.
              </p>
            )}
            {hasMore && !loading && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}




