import React, { useState } from 'react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.jsx';
import PostCard from '../components/PostCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { Loader, TrendingUp, Clock, Award } from 'lucide-react';

export default function Home() {
  const [sortBy, setSortBy] = useState('hot');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <main className="flex-1">
          {/* Sort Options */}
          <div className="flex items-center space-x-4 mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    sortBy === option.value
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onVote={handleVote} />
            ))}
            
            {loading && (
              <div className="flex justify-center items-center py-8">
                <Loader className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            )}
            
            {!loading && posts.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Be the first to share something amazing!</p>
              </div>
            )}
            
            {hasMore && !loading && posts.length > 0 && (
              <div className="text-center py-4">
                <button
                  onClick={loadMore}
                  className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
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