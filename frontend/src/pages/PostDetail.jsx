import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, MessageCircle, ArrowLeft } from 'lucide-react';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useApi, useFetch } from '../hooks/useInfiniteScroll';

// This component fetches and displays a single post and its comments.
// It uses the post ID from the URL parameters to make API calls.
export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { apiCall } = useApi();

  // State for post and comment data
  const { data: postData, loading: postLoading, error: postError } = useFetch(`/api/posts/${id}`);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentError, setCommentError] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (postData) {
      setPost(postData.post);
    }
  }, [postData]);

  // Fetch comments for the post
  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      setCommentError(null);
      const response = await apiCall(`/api/comments/post/${id}`);
      setComments(response.comments);
    } catch (err) {
      setCommentError(err.message || 'Failed to load comments.');
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id]);

  const handlePostVote = (postId, newVote) => {
    setPost(prevPost => {
      if (!prevPost) return prevPost;
      let newUpvotes = prevPost.upvotes;
      let newDownvotes = prevPost.downvotes;
      let newScore = prevPost.score;

      // Logic to update vote count based on the new vote type.
      // This is a basic optimistic update. The server response will
      // provide the final score.
      // For simplicity, we just trigger a re-fetch.
      return { ...prevPost };
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setCommentSubmitting(true);
    setCommentError('');

    try {
      await apiCall('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          postId: id,
          content: commentContent
        }),
      });
      setCommentContent('');
      await fetchComments(); // Re-fetch comments to show the new one
    } catch (err) {
      setCommentError(err.message || 'Failed to submit comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (postLoading) {
    return (
      <div className="flex justify-center items-center h-screen-minus-nav">
        <Loader className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-500 dark:text-red-400">
          {postError || 'Post not found.'}
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
      <div className="mb-6">
        <PostCard post={post} onVote={handlePostVote} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-orange-500" />
          <span>Comments ({comments.length})</span>
        </h2>
        
        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="What are your thoughts?"
              rows="3"
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
              disabled={commentSubmitting}
            />
            {commentError && (
              <p className="text-sm text-red-500 mt-2">{commentError}</p>
            )}
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={commentSubmitting}
              >
                {commentSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            <a href="/login" className="text-orange-500 hover:underline">Log in</a> to comment.
          </p>
        )}

        {commentsLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map(comment => (
                <Comment key={comment.id} comment={comment} />
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple Comment component for displaying a single comment.
// This is a simplified version and could be a separate component for larger apps.
function Comment({ comment }) {
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

  const CommentAuthor = ({ author, createdAt }) => (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        {author?.displayName?.charAt(0).toUpperCase() || 'U'}
      </div>
      <p className="font-medium">{author?.displayName || 'Unknown'}</p>
      <span>•</span>
      <p>{timeAgo(createdAt)}</p>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
      <CommentAuthor author={comment.author} createdAt={comment.createdAt} />
      <p className="mt-2 text-gray-800 dark:text-gray-300 leading-relaxed">{comment.content}</p>
    </div>
  );
}


