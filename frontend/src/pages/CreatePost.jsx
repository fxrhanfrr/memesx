import Communities from '../pages/Communities';
import CreateCommunity from '../pages/CreateCommunity';  
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  X as XIcon,
  Tags,
  Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi, useFetch } from '../hooks/useInfiniteScroll';

// This component provides a form for users to create a new post.
// It handles post details like title, content, community, tags, and media uploads.
export default function CreatePost() {
  const { currentUser } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  // State for form inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [tags, setTags] = useState([]);
  
  // State for file upload and preview
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const mediaInputRef = useRef(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch list of communities for the dropdown
  // Note: The useFetch hook from the provided files can be used here.
  const { data: communitiesData, loading: communitiesLoading } = useFetch('/api/communities');
  const communities = communitiesData?.communities || [];

  // Handles file selection and preview generation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // Handles removing the selected media file
  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (mediaInputRef.current) {
      mediaInputRef.current.value = null;
    }
  };

  // Handles adding tags from an input field
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      e.target.value = '';
    }
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to create a post.');
      return;
    }
    if (!title.trim() || !selectedCommunity) {
      setError('Title and community are required.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('community', selectedCommunity);
    formData.append('tags', JSON.stringify(tags));

    if (mediaFile) {
      formData.append('media', mediaFile);
    }
    
    try {
      const response = await apiCall('/api/posts', {
        method: 'POST',
        body: formData,
        headers: {
          // Note: Do not set Content-Type header manually for FormData.
          // The browser will set it automatically with the correct boundary.
        },
      });

      if (response.postId) {
        navigate(`/post/${response.postId}`);
      } else {
        setError('An unexpected error occurred.');
      }
    } catch (err) {
      setError(err.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create a New Post
        </h1>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A catchy title for your meme"
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
          </div>

          {/* Post Content/Description */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (optional)
            </label>
            <textarea
              id="content"
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a description or context for your post"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            ></textarea>
          </div>

          {/* Community and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Community Selection */}
            <div>
              <label htmlFor="community" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Choose a Community
              </label>
              {communitiesLoading ? (
                <div className="flex items-center space-x-2 mt-1 p-2">
                  <Loader className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="text-sm text-gray-500">Loading communities...</span>
                </div>
              ) : (
                <select
                  id="community"
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                >
                  <option value="">Select a community</option>
                  {communities.map((community) => (
                    <option key={community.id} value={community.name}>
                      r/{community.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tags Input */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (press Enter to add)
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  id="tags"
                  type="text"
                  onKeyDown={handleTagInput}
                  placeholder="e.g., funny, cat, oc"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label htmlFor="media-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Media (optional, max 10MB)
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                ref={mediaInputRef}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-orange-50 file:text-orange-700
                  hover:file:bg-orange-100 dark:file:bg-orange-900 dark:file:text-orange-200 dark:hover:file:bg-orange-800"
              />
              {mediaFile && (
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            {mediaPreview && (
              <div className="mt-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                {mediaFile.type.startsWith('image/') ? (
                  <img src={mediaPreview} alt="Media preview" className="w-full h-auto object-cover" />
                ) : (
                  <video src={mediaPreview} controls className="w-full h-auto object-cover" />
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-3 animate-spin" />
                  Posting...
                </>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}







// Note: The above code assumes the existence of certain API endpoints and context providers. Adjust as necessary to fit the actual application structure and API.import React from 'react';
