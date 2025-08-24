import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Loader, Search as SearchIcon, Users, Award } from 'lucide-react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

// This component handles the search results page, fetching results
// based on the query parameter in the URL.
export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const query = new URLSearchParams(location.search).get('q') || '';

  // Check if user needs to complete profile setup
  useEffect(() => {
    if (currentUser && userProfile && !userProfile.displayName) {
      navigate('/profile-setup');
    }
  }, [currentUser, userProfile, navigate]);

  const [searchQuery, setSearchQuery] = useState(query);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the search input to prevent too many API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch search results using the debounced query
  // This assumes your backend has a search endpoint that can handle this query.
  const { 
    data: searchResults, 
    loading, 
    hasMore, 
    loadMore,
    reset
  } = useInfiniteScroll(`/api/posts?search=${debouncedQuery}`);

  // Reset the search state when a new search is submitted
  useEffect(() => {
    reset();
  }, [debouncedQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setDebouncedQuery(searchQuery.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Search Results for "{query}"
        </h1>
        <form onSubmit={handleSearchSubmit} className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search MemeX"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
          />
        </form>
      </div>

      <div className="space-y-6">
        {loading && searchResults.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                // This is a simplified rendering, you may need to adjust based on
                // your API's search result format (e.g., if it returns users, communities, and posts).
                <PostCard key={result.id} post={result} />
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                No results found for "{query}".
              </p>
            )}
            {hasMore && !loading && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
                >
                  Load More Results
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

