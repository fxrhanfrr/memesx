import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronUp, 
  ChevronDown, 
  MessageCircle, 
  Share, 
  Bookmark,
  ExternalLink,
  Play,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useInfiniteScroll.jsx';
import CanvaEditor from './CanvaEditor';

export default function PostCard({ post, onVote }) {
  const { currentUser } = useAuth();
  const { apiCall } = useApi();
  const [userVote, setUserVote] = useState(null);
  const [score, setScore] = useState(post.score);
  const [isVoting, setIsVoting] = useState(false);
  const [showCanvaEditor, setShowCanvaEditor] = useState(false);

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
    <div className="post-card">
      <div className="flex">
        {/* Vote section */}
        <div className="post-vote-section">
          <button
            onClick={() => handleVote('upvote')}
            disabled={!currentUser || isVoting}
            className={`vote-button ${userVote === 'upvote' ? 'upvoted' : ''}`}
            aria-label="Upvote"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="post-score">
            {formatNumber(score)}
          </span>
          <button
            onClick={() => handleVote('downvote')}
            disabled={!currentUser || isVoting}
            className={`vote-button ${userVote === 'downvote' ? 'downvoted' : ''}`}
            aria-label="Downvote"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Content section */}
        <div className="flex-1">
          <div className="post-content">
            <div className="post-meta">
              <Link 
                to={`/r/${post.community}`}
                className="font-medium hover:text-primary-500"
              >
                r/{post.community}
              </Link>
              <span>•</span>
              <span>Posted by</span>
              <Link 
                to={`/user/${post.authorId}`}
                className="hover:text-primary-500"
              >
                u/{post.author?.displayName || 'Unknown'}
              </Link>
              <span>•</span>
              <span>{timeAgo(post.createdAt)}</span>
              {post.isFeatured && (
                <>
                  <span>•</span>
                  <span className="text-primary-500 font-medium">Featured</span>
                </>
              )}
            </div>

            <Link to={`/post/${post.id}`}>
              <h2 className="post-title">
                {post.title}
              </h2>
            </Link>

            {post.content && (
              <p className="post-text">
                {post.content}
              </p>
            )}

            {post.mediaUrl && (
              <div className="post-media">
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
                  <div className="relative group">
                    <img
                      src={post.mediaUrl}
                      alt={post.title}
                      className="max-w-full h-auto rounded-lg cursor-pointer"
                      onClick={() => window.open(post.mediaUrl, '_blank')}
                    />
                    
                    {/* Edit with Canva button overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-lg">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCanvaEditor(true);
                        }}
                        className="btn btn-primary opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit with Canva
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="post-tag"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="post-actions">
              <Link
                to={`/post/${post.id}`}
                className="post-action"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {post.commentCount} Comments
                </span>
              </Link>
              <button 
                onClick={handleShare}
                className="post-action"
              >
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="post-action">
                <Bookmark className="w-4 h-4" />
                <span>Save</span>
              </button>
              {post.mediaUrl && (
                <a
                  href={post.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="post-action"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Canva Editor Modal */}
      {showCanvaEditor && post.mediaUrl && (
        <CanvaEditor
          imageUrl={post.mediaUrl}
          onSave={(editedImageUrl, editedImageBlob) => {
            // For now, just close the editor
            // In a real app, you might want to update the post with the edited image
            setShowCanvaEditor(false);
          }}
          onClose={() => setShowCanvaEditor(false)}
          isOpen={showCanvaEditor}
        />
      )}
    </div>
  );
}