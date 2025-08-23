import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  X as XIcon,
  Tags,
  Loader,
  Edit3,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi, useFetch } from '../hooks/useInfiniteScroll';
import CanvaEditor from '../components/CanvaEditor';

export default function CreatePost() {
  const { currentUser } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  // State for form inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  // State for file upload and preview
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const mediaInputRef = useRef(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCanvaEditor, setShowCanvaEditor] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle, saving, saved, error

  // Fetch list of communities for the dropdown
  const { data: communitiesData, loading: communitiesLoading } = useFetch('/api/communities');
  const communities = communitiesData?.communities || [];

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (title || content || selectedCommunity || tags.length > 0) {
        setAutoSaveStatus('saving');
        // Simulate auto-save (you can implement actual auto-save here)
        setTimeout(() => {
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        }, 500);
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [title, content, selectedCommunity, tags]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

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

  // Handle Canva editor save
  const handleCanvaSave = async (editedImageUrl, editedImageBlob) => {
    const editedFile = new File([editedImageBlob], 'edited-image.png', {
      type: 'image/png'
    });
    
    setMediaFile(editedFile);
    setMediaPreview(editedImageUrl);
    setShowCanvaEditor(false);
  };

  // Handles adding tags
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (newTag && !tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase()) && tags.length < 10) {
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
    setSuccess('');

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
      });

      if (response.postId) {
        setSuccess('Post created successfully!');
        setTimeout(() => {
          navigate(`/post/${response.postId}`);
        }, 1000);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create a New Post
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Share your memes with the community
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center text-sm text-gray-500">
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </div>
              )}
              {autoSaveStatus === 'saved' && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-green-700 dark:text-green-400">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Post Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A catchy title for your meme"
                required
                maxLength={300}
                className="form-input w-full"
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {title.length}/300
              </div>
            </div>

            {/* Post Content/Description */}
            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="content"
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a description or context for your post"
                maxLength={2000}
                className="form-input w-full"
              ></textarea>
              <div className="mt-1 text-xs text-gray-500 text-right">
                {content.length}/2000
              </div>
            </div>

            {/* Community and Tags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Community Selection */}
              <div>
                <label htmlFor="community" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Community *
                </label>
                {communitiesLoading ? (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Loader className="w-4 h-4 animate-spin text-primary-500" />
                    <span className="text-sm text-gray-500">Loading communities...</span>
                  </div>
                ) : (
                  <select
                    id="community"
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    required
                    className="form-input w-full"
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
                <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tags ({tags.length}/10)
                </label>
                <div className="flex space-x-2">
                  <input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInput}
                    placeholder="e.g., funny, cat, oc"
                    className="form-input flex-1"
                    disabled={tags.length >= 10}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim() || tags.length >= 10}
                    className="btn btn-secondary px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center space-x-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-100"
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Media
              </label>
              
              {/* Drag & Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!mediaPreview ? (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="media-upload" className="btn btn-primary cursor-pointer">
                        Choose File
                      </label>
                      <input
                        id="media-upload"
                        type="file"
                        accept="image/*,video/*"
                        ref={mediaInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      or drag and drop (max 10MB)
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, GIF, MP4, MOV
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {mediaFile.type.startsWith('image/') ? (
                      <div className="relative group">
                        <img src={mediaPreview} alt="Media preview" className="max-h-64 mx-auto rounded-lg" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-lg">
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              type="button"
                              onClick={() => setShowCanvaEditor(true)}
                              className="btn btn-primary"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveMedia}
                              className="btn btn-secondary"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <video src={mediaPreview} controls className="max-h-64 mx-auto rounded-lg" />
                        <button
                          type="button"
                          onClick={handleRemoveMedia}
                          className="absolute top-2 right-2 btn btn-secondary"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !selectedCommunity}
                className="btn btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 mr-3 animate-spin" />
                    Creating Post...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-3" />
                    Create Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Canva Editor Modal */}
      {showCanvaEditor && mediaPreview && (
        <CanvaEditor
          imageUrl={mediaPreview}
          onSave={handleCanvaSave}
          onClose={() => setShowCanvaEditor(false)}
          isOpen={showCanvaEditor}
        />
      )}
    </div>
  );
}
