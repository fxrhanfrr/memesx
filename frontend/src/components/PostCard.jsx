import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronUp, 
  ChevronDown, 
  MessageCircle, 
  Share, 
  Bookmark,
  ExternalLink,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

export default function PostCard({ post, onVote }) {
  const { currentUser } = useAuth();
  const { apiCall } = useApi();
  const [userVote, setUserVote] = useState(null);
  const [score, setScore] = useState(post.score);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType) => {
    if (!currentUser || isVoting) return;
    
    setIsVoting(true);
    try {
      const newVoteType = userVote === voteType ? 'remove' : voteType;
      const result = await apiCall(`/api/posts/${post.id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ voteType: newVoteType })
      });
      
      setUserVote(newVoteType === 'remove' ? null : newVoteType);
      setScore(result.newScore);
      onVote?.(post.id, newVoteType);
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

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

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: url
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        // You could show a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Vote section */}
        <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 px-2 py-4 space-y-1">
          <button
            onClick={() => handleVote('upvote')}
            disabled={!currentUser || isVoting}
            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 ${
              userVote === 'upvote' ? 'text-orange-500' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatNumber(score)}
          </span>
          <button
            onClick={() => handleVote('downvote')}
            disabled={!currentUser || isVoting}
            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 ${
              userVote === 'downvote' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Content section */}
        <div className="flex-1 p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Link 
              to={`/r/${post.community}`}
              className="font-medium hover:text-orange-500"
            >
              r/{post.community}
            </Link>
            <span>•</span>
            <span>Posted by</span>
            <Link 
              to={`/user/${post.authorId}`}
              className="hover:text-orange-500"
            >
              u/{post.author?.displayName || 'Unknown'}
            </Link>
            <span>•</span>
            <span>{timeAgo(post.createdAt)}</span>
            {post.isFeatured && (
              <>
                <span>•</span>
                <span className="text-orange-500 font-medium">Featured</span>
              </>
            )}
          </div>

          <Link to={`/post/${post.id}`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 hover:text-orange-600 cursor-pointer">
              {post.title}
            </h2>
          </Link>

          {post.content && (
            <p className="text-gray-800 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
              {post.content}
            </p>
          )}

          {post.mediaUrl && (
            <div className="mb-4">
              {post.mediaType === 'video' ? (
                <div className="relative">
                  <video
                    src={post.mediaUrl}
                    controls
                    className="max-w-full h-auto rounded-lg"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-12 h-12 text-white opacity-80" />
                  </div>
                </div>
              ) : (
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  className="max-w-full h-auto rounded-lg cursor-pointer"
                  onClick={() => window.open(post.mediaUrl, '_blank')}
                />
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
            <Link
              to={`/post/${post.id}`}
              className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {post.commentCount} Comments
              </span>
            </Link>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
            >
              <Share className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors">
              <Bookmark className="w-4 h-4" />
              <span className="text-sm font-medium">Save</span>
            </button>
            {post.mediaUrl && (
              <a
                href={post.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Open</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}