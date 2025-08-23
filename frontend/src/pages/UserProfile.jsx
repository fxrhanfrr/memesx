import React, { useState, useEffect } from 'react';
import Comment from '../components/Comment';
import { ArrowLeft } from 'lucide-react';   // Ensure ArrowLeft is imported for back button
import { useAuth } from '../context/AuthContext';   // Ensure useAuth is imported to get current user                       
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, User as UserIcon, Award, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { useApi, useFetch } from '../hooks/useInfiniteScroll';
import PostCard from '../components/PostCard';

// This component displays a user's profile, including their posts and comments.
export default function UserProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile: currentUserProfile } = useAuth();
  const { apiCall } = useApi();

  const [activeTab, setActiveTab] = useState('posts');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(`/api/users/${uid}`);
      setUser(response.user);
    } catch (err) {
      setError(err.message || 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) {
      fetchUserProfile();
    }
  }, [uid]);

  const isCurrentUserProfile = currentUser && currentUser.uid === uid;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen-minus-nav">
        <Loader className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-500 dark:text-red-400">
          {error || 'User not found.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="User profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {user.displayName}
            </h1>
            <div className="flex items-center justify-center sm:justify-start space-x-4 mb-2 text-gray-600 dark:text-gray-400">
              <span className="flex items-center space-x-1 text-sm">
                <Award className="w-4 h-4 text-orange-500" />
                <span>{user.karma} Karma</span>
              </span>
              <span className="flex items-center space-x-1 text-sm">
                <MessageCircle className="w-4 h-4" />
                <span>
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </span>
            </div>
            {user.bio && (
              <p className="text-gray-700 dark:text-gray-300 mt-2">{user.bio}</p>
            )}
          </div>
          {isCurrentUserProfile && (
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => navigate('/edit-profile')} // Assuming an edit profile page exists
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('posts')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'posts'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'comments'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Comments
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && <UserPosts uid={uid} />}
      {activeTab === 'comments' && <UserComments uid={uid} />}
    </div>
  );
}

// Sub-component to fetch and display user's posts
function UserPosts({ uid }) {
  const { data: postsData, loading, hasMore, loadMore } = useInfiniteScroll(`/api/users/${uid}/posts`);

  return (
    <div className="space-y-6">
      {loading && postsData.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          {postsData.length > 0 ? (
            postsData.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-6">
              This user has not made any posts yet.
            </p>
          )}
          {hasMore && !loading && (
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
  );
}

// Sub-component to fetch and display user's comments
function UserComments({ uid }) {
  const { data: commentsData, loading, hasMore, loadMore } = useInfiniteScroll(`/api/users/${uid}/comments`);

  const timeAgo = (date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  return (
    <div className="space-y-6">
      {loading && commentsData.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          {commentsData.length > 0 ? (
            commentsData.map((comment) => (
              <div
                key={comment.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Commented on:</span>
                  <a href={`/post/${comment.postId}`} className="text-orange-500 hover:underline">
                    {comment.postTitle}
                  </a>
                  <span>•</span>
                  <span>{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-gray-800 dark:text-gray-300">{comment.content}</p>
                <div className="mt-2 flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-orange-500" />
                    <span>{comment.score}</span>
                  </span>
                  <span>•</span>
                  <button
                    onClick={() => navigate(`/post/${comment.postId}`)}
                    className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors"
                  >
                    View in post
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-6">
              This user has not made any comments yet.
            </p>
          )}
          {hasMore && !loading && (
            <div className="text-center">
              <button
                onClick={loadMore}
                className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
              >
                Load More Comments
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


