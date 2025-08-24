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
  const { currentUser, userProfile } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  // Check if user needs to complete profile setup
  useEffect(() => {
    if (currentUser && userProfile && !userProfile.displayName) {
      navigate('/profile-setup');
    }
  }, [currentUser, userProfile, navigate]);

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
    <div className="create-page-container">
      {/* Animated Background */}
      <div className="create-page-background">
        <div className="create-page-bg-circle"></div>
        <div className="create-page-bg-circle"></div>
        <div className="create-page-bg-circle"></div>
      </div>

      <div className="create-page-content">
        {/* Header */}
        <div className="create-header">
          <div className="create-header-content">
            <div>
              <h1 className="create-title">Create a New Post</h1>
              <p className="create-subtitle">Share your memes with the community</p>
            </div>
            <div className="create-auto-save">
              {autoSaveStatus === 'saving' && (
                <div className="create-auto-save-saving">
                  <Loader />
                  Saving...
                </div>
              )}
              {autoSaveStatus === 'saved' && (
                <div className="create-auto-save-saved">
                  <CheckCircle />
                  Saved
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="create-form-container">
          {/* Status Messages */}
          {error && (
            <div className="create-status-message create-status-error">
              <div className="create-status-content">
                <AlertCircle />
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="create-status-message create-status-success">
              <div className="create-status-content">
                <CheckCircle />
                <span>{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-form">
            {/* Post Title */}
            <div className="create-form-group">
              <label htmlFor="title" className="create-label">
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
                className="create-input"
              />
              <div className="create-char-count">
                {title.length}/300
              </div>
            </div>

            {/* Post Content/Description */}
            <div className="create-form-group">
              <label htmlFor="content" className="create-label">
                Description
              </label>
              <textarea
                id="content"
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a description or context for your post"
                maxLength={2000}
                className="create-textarea"
              ></textarea>
              <div className="create-char-count">
                {content.length}/2000
              </div>
            </div>

            {/* Community and Tags */}
            <div className="create-grid">
              {/* Community Selection */}
              <div className="create-form-group">
                <label htmlFor="community" className="create-label">
                  Community *
                </label>
                {communitiesLoading ? (
                  <div className="create-input">
                    <Loader />
                    Loading communities...
                  </div>
                ) : (
                  <select
                    id="community"
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    required
                    className="create-select"
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
              <div className="create-form-group">
                <label htmlFor="tags" className="create-label">
                  Tags ({tags.length}/10)
                </label>
                <div className="create-tags-container">
                  <input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInput}
                    placeholder="e.g., funny, cat, oc"
                    className="create-tags-input"
                    disabled={tags.length >= 10}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim() || tags.length >= 10}
                    className="create-tags-button"
                  >
                    <Plus />
                  </button>
                </div>
                <div className="create-tags-list">
                  {tags.map((tag) => (
                    <span key={tag} className="create-tag">
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="create-tag-remove"
                      >
                        <XIcon />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="create-form-group">
              <label className="create-label">
                Media
              </label>
              
              {/* Drag & Drop Zone */}
              <div
                className={`create-media-upload ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!mediaPreview ? (
                  <>
                    <Upload className="create-media-upload-icon" />
                    <label htmlFor="media-upload" className="create-media-upload-button">
                      Choose File
                      <input
                        id="media-upload"
                        type="file"
                        accept="image/*,video/*"
                        ref={mediaInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="create-media-upload-text">
                      or drag and drop (max 10MB)
                    </p>
                    <p className="create-char-count">
                      PNG, JPG, GIF, MP4, MOV
                    </p>
                  </>
                ) : (
                  <div className="create-media-preview">
                    {mediaFile.type.startsWith('image/') ? (
                      <div className="relative group">
                        <img src={mediaPreview} alt="Media preview" />
                        <div className="create-media-actions">
                          <button
                            type="button"
                            onClick={() => setShowCanvaEditor(true)}
                            className="create-media-action-button"
                          >
                            <Edit3 />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveMedia}
                            className="create-media-action-button"
                          >
                            <Trash2 />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <video src={mediaPreview} controls />
                        <button
                          type="button"
                          onClick={handleRemoveMedia}
                          className="create-media-action-button"
                          style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="create-form-actions">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="create-cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !selectedCommunity}
                className="create-submit-button"
              >
                {loading ? (
                  <>
                    <div className="create-loading-spinner"></div>
                    Creating Post...
                  </>
                ) : (
                  <>
                    <Save />
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
