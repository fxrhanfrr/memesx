import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.jsx';
import PostCard from '../components/PostCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { Loader, TrendingUp, Clock, Award, Sparkles, Flame, Star, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [sortBy, setSortBy] = useState('hot');
  const [animatePosts, setAnimatePosts] = useState(false);
  const { currentUser } = useAuth();
  const { data: posts, loading, hasMore, loadMore } = useInfiniteScroll(`/api/posts?sort=${sortBy}`);

  const sortOptions = [
    { value: 'hot', label: 'Hot', icon: TrendingUp },
    { value: 'new', label: 'New', icon: Clock },
    { value: 'top', label: 'Top', icon: Award }
  ];

  const handleVote = (postId, voteType) => {
    // Update local state optimistically
    // The actual vote is handled in PostCard component
  };

  return (
    <div className="container py-8">
      <div className="flex gap-8">
        <main className="flex-1">
          {/* Hero Section */}
          <div className="card mb-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="card-body text-center py-12">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 mr-3 animate-pulse" />
                <h1 className="text-3xl font-bold">Welcome to MemeX</h1>
                <Sparkles className="w-8 h-8 ml-3 animate-pulse" />
              </div>
              <p className="text-xl text-primary-100 mb-6">
                Discover, create, and share the best memes with the world!
              </p>
              {currentUser && (
                <Link to="/create" className="btn btn-secondary hover:bg-white hover:text-primary-600 transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Post
                </Link>
              )}
            </div>
          </div>

          {/* Sort Options */}
          <div className="card mb-6 animate-slide-in-top">
            <div className="card-body">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                {sortOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`btn ${
                        sortBy === option.value
                          ? 'btn-primary'
                          : 'btn-secondary'
                      } animate-slide-in-top`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className={`animate-slide-in-bottom ${
                  animatePosts ? 'animate-slide-in-bottom' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard post={post} onVote={handleVote} />
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="loading"></div>
              </div>
            )}
            
            {!loading && posts.length === 0 && (
              <div className="card text-center py-12">
                <div className="card-body">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Be the first to share something amazing!</p>
                </div>
              </div>
            )}
            
            {hasMore && !loading && posts.length > 0 && (
              <div className="text-center py-4">
                <button
                  onClick={loadMore}
                  className="btn btn-primary"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </main>
        
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}