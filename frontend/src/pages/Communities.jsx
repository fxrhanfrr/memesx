import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, Users, Award, Search } from 'lucide-react';
import { useInfiniteScroll, useApi } from '../hooks/useInfiniteScroll';
import { useAuth } from '../context/AuthContext';

// This component fetches and displays a list of all communities with search functionality.
export default function Communities() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { apiCall } = useApi();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Check if user needs to complete profile setup
  useEffect(() => {
    if (currentUser && userProfile && !userProfile.displayName) {
      navigate('/profile-setup');
    }
  }, [currentUser, userProfile, navigate]);

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
    <div className="page-container">
      {/* Animated Background */}
      <div className="page-background">
        <div className="page-bg-circle"></div>
        <div className="page-bg-circle"></div>
        <div className="page-bg-circle"></div>
      </div>

      <div className="page-content">
        {/* Page Header */}
        <div className="communities-header">
          <h1 className="communities-title">All Communities</h1>
          <div className="communities-search">
            <input
              type="text"
              placeholder="Find a community..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="communities-search-input"
            />
            <Search className="communities-search-icon" />
          </div>
        </div>
        
        {/* Communities List */}
        <div className="communities-list">
          {loading && communities.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
              {communities.length > 0 ? (
                communities.map((community) => (
                  <Link
                    key={community.id}
                    to={`/r/${community.name}`}
                    className="community-item-modern"
                  >
                    <div className="community-avatar-modern">
                      {community.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="community-info-modern">
                      <h2 className="community-name-modern">
                        r/{community.name}
                      </h2>
                      <p className="community-description-modern">
                        {community.description}
                      </p>
                    </div>
                    <div className="community-members-modern">
                      <Users className="community-members-icon" />
                      <span>{community.memberCount.toLocaleString()}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-state">
                  <h3 className="empty-state-title">No communities found</h3>
                  <p className="empty-state-text">Try adjusting your search terms or browse all communities.</p>
                </div>
              )}
              {hasMore && !loading && (
                <div className="load-more-container">
                  <button
                    onClick={loadMore}
                    className="load-more-button"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}




