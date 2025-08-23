import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component displays a single comment, including the author,
// content, and timestamp.
export default function Comment({ comment }) {
  // A helper function to format the timestamp into a human-readable "time ago" string.
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

  const { userProfile: currentUserProfile } = useAuth();
  const isAuthor = currentUserProfile?.uid === comment.authorId;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Comment Header with Author Info */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
        {comment.author?.photoURL ? (
          <img
            src={comment.author.photoURL}
            alt={comment.author.displayName}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {comment.author?.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <Link
          to={`/user/${comment.authorId}`}
          className="font-medium hover:text-orange-500"
        >
          {comment.author?.displayName || 'Unknown'}
        </Link>
        <span>•</span>
        <span className="text-gray-500">{timeAgo(comment.createdAt)}</span>
        {isAuthor && <span className="text-orange-500 font-medium">(You)</span>}
        {comment.isEdited && (
          <>
            <span>•</span>
            <span className="text-gray-400 dark:text-gray-500">edited</span>
          </>
        )}
      </div>

      {/* Comment Content */}
      <p className="text-gray-800 dark:text-gray-300 leading-relaxed">
        {comment.content}
      </p>
    </div>
  );
}
