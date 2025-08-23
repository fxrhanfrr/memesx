import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader, Users, Plus, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi, useInfiniteScroll } from '../hooks/useInfiniteScroll';
import PostCard from '../components/PostCard';

// This component displays a single community's page, including a header with
// community details and a feed of posts from that community.
export default function Community() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  const { apiCall } = useApi();

  // State for community data
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch community details
  const fetchCommunityDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(`/api/communities/${name}`);
      setCommunity(response.community);
    } catch (err) {
      setError(err.message || 'Failed to load community details.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCommunityDetails();
  }, [name]);
  
  // Fetch posts for the community
  const {
    data: posts,
    loading: postsLoading,
    hasMore,
    loadMore,
  } = useInfiniteScroll(`/api/posts?community=${name}`);

  // Check if the current user is a member of this community
  const isMember = userProfile?.joinedCommunities?.includes(community?.id);

  const handleJoinLeave = async () => {
    if (!currentUser || !community) return;
    setLoading(true);
    
    try {
      const endpoint = isMember ? `/api/communities/${community.id}/leave` : `/api/communities/${community.id}/join`;
      await apiCall(endpoint, { method: 'POST' });
      await fetchCommunityDetails(); // Refresh community details
      await fetchUserProfile(currentUser); // Refresh user profile to update joined communities
    } catch (err) {
      setError(err.message || `Failed to ${isMember ? 'leave' : 'join'} community.`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !community) {
    return (
      <div className="flex justify-center items-center h-screen-minus-nav">
        <Loader className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-500 dark:text-red-400">
          {error || 'Community not found.'}
        </p>
        <Link
          to="/communities"
          className="mt-4 inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Award className="w-4 h-4" />
          <span>View all communities</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Community Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
            {community.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              r/{community.name}
            </h1>
            <p className="text-gray-700 dark:text-gray-300">{community.description}</p>
            <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2 text-gray-600 dark:text-gray-400">
              <span className="flex items-center space-x-1 text-sm">
                <Users className="w-4 h-4" />
                <span>{community.memberCount.toLocaleString()} members</span>
              </span>
              <span className="flex items-center space-x-1 text-sm">
                <Award className="w-4 h-4 text-orange-500" />
                <span>{community.postCount.toLocaleString()} posts</span>
              </span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            {currentUser && (
              <button
                onClick={handleJoinLeave}
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isMember
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  isMember ? 'Leave Community' : 'Join Community'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Community Posts */}
      <div className="space-y-6">
        {postsLoading && posts.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                No posts in this community yet.
              </p>
            )}
            {hasMore && !postsLoading && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
                >
                  Load More Posts
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
