import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Hash, 
  Save,
  ArrowLeft,
  Shield,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useInfiniteScroll';

export default function CreateCommunity() {
  const { currentUser, userProfile } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();
  const nameInputRef = useRef(null);

  // Check if user needs to complete profile setup
  useEffect(() => {
    if (currentUser && userProfile && !userProfile.displayName) {
      navigate('/profile-setup');
    }
  }, [currentUser, userProfile, navigate]);

  // State for form inputs
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState(['']);
  const [category, setCategory] = useState('entertainment');
  const [isPublic, setIsPublic] = useState(true);
  const [allowImages, setAllowImages] = useState(true);
  const [allowVideos, setAllowVideos] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nameChecking, setNameChecking] = useState(false);
  const [nameAvailable, setNameAvailable] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');

  // Community categories
  const categories = [
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'gaming', label: 'Gaming', icon: '🎮' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'music', label: 'Music', icon: '🎵' },
    { value: 'art', label: 'Art & Design', icon: '🎨' },
    { value: 'food', label: 'Food & Cooking', icon: '🍕' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'other', label: 'Other', icon: '🔗' }
  ];

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (name || displayName || description || rules.some(rule => rule.trim())) {
        setAutoSaveStatus('saving');
        setTimeout(() => {
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        }, 500);
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [name, displayName, description, rules]);

  // Check community name availability
  useEffect(() => {
    const checkNameAvailability = async () => {
      if (name.length >= 3 && /^[a-z0-9_]+$/.test(name)) {
        setNameChecking(true);
        try {
          const response = await apiCall(`/api/communities/check-name?name=${name}`);
          setNameAvailable(response.available);
        } catch (err) {
          setNameAvailable(null);
        } finally {
          setNameChecking(false);
        }
      } else {
        setNameAvailable(null);
      }
    };

    const debounceTimer = setTimeout(checkNameAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [name, apiCall]);

  // Handle name input with validation
  const handleNameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setName(value);
    if (value && !displayName) {
      setDisplayName(value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '));
    }
  };

  // Handle adding a new rule input field
  const handleAddRule = () => {
    if (rules.length < 10) {
      setRules([...rules, '']);
    }
  };

  // Handle updating a rule's text
  const handleRuleChange = (index, value) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  // Handle removing a rule input field
  const handleRemoveRule = (index) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('You must be logged in to create a community.');
      return;
    }

    if (!name.trim() || !displayName.trim() || !description.trim()) {
      setError('Community name, display name, and description are required.');
      return;
    }

    if (name.length < 3 || name.length > 21) {
      setError('Community name must be between 3 and 21 characters.');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(name)) {
      setError('Community name can only contain lowercase letters, numbers, and underscores.');
      return;
    }

    if (nameAvailable === false) {
      setError('This community name is already taken.');
      return;
    }

    // Filter out empty rule strings
    const filteredRules = rules.filter(rule => rule.trim() !== '');

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiCall('/api/communities', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          displayName: displayName.trim(),
          description: description.trim(),
          rules: filteredRules,
          category,
          isPublic,
          allowImages,
          allowVideos
        }),
      });

      if (response.name) {
        setSuccess('Community created successfully!');
        setTimeout(() => {
          navigate(`/r/${response.name}`);
        }, 1000);
      } else {
        setError('An unexpected error occurred.');
      }
    } catch (err) {
      setError(err.message || 'Failed to create community.');
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
            <div className="create-header-left">
              <button
                onClick={() => navigate('/communities')}
                className="create-back-button"
              >
                <ArrowLeft />
              </button>
              <div>
                <h1 className="create-title">Create a New Community</h1>
                <p className="create-subtitle">Build a space for your community to share and connect</p>
              </div>
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
            {/* Community Name */}
            <div className="create-form-group">
              <label htmlFor="name" className="create-label">
                Community Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash />
                </div>
                <input
                  id="name"
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g., cool_memes"
                  required
                  maxLength={21}
                  className="create-input pl-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {nameChecking && <Loader className="create-loading-spinner" />}
                  {nameAvailable === true && <CheckCircle className="text-green-500" />}
                  {nameAvailable === false && <X className="text-red-500" />}
                </div>
              </div>
              <div className="create-char-count">
                <span>{name.length}/21 characters</span>
                {nameAvailable === true && <span className="text-green-600">Name available</span>}
                {nameAvailable === false && <span className="text-red-600">Name taken</span>}
              </div>
              <p className="create-char-count">
                Only lowercase letters, numbers, and underscores allowed
              </p>
            </div>

            {/* Display Name */}
            <div className="create-form-group">
              <label htmlFor="displayName" className="create-label">
                Display Name *
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Cool Memes"
                required
                maxLength={50}
                className="create-input"
              />
              <div className="create-char-count">
                {displayName.length}/50 characters
              </div>
            </div>

            {/* Category */}
            <div className="create-form-group">
              <label htmlFor="category" className="create-label">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="create-select"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="create-form-group">
              <label htmlFor="description" className="create-label">
                Description *
              </label>
              <textarea
                id="description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us what your community is about..."
                required
                maxLength={500}
                className="create-textarea"
              ></textarea>
              <div className="create-char-count">
                {description.length}/500 characters
              </div>
            </div>

            {/* Community Settings */}
            <div className="create-settings-section">
              <h3 className="create-settings-title">
                <Shield />
                Community Settings
              </h3>
              <div className="space-y-3">
                <div className="create-settings-item">
                  <div className="create-settings-info">
                    <h4>Public Community</h4>
                    <p>Anyone can view and join</p>
                  </div>
                  <label className="create-toggle">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <span className="create-toggle-slider"></span>
                  </label>
                </div>
                <div className="create-settings-item">
                  <div className="create-settings-info">
                    <h4>Allow Images</h4>
                    <p>Members can post images</p>
                  </div>
                  <label className="create-toggle">
                    <input
                      type="checkbox"
                      checked={allowImages}
                      onChange={(e) => setAllowImages(e.target.checked)}
                    />
                    <span className="create-toggle-slider"></span>
                  </label>
                </div>
                <div className="create-settings-item">
                  <div className="create-settings-info">
                    <h4>Allow Videos</h4>
                    <p>Members can post videos</p>
                  </div>
                  <label className="create-toggle">
                    <input
                      type="checkbox"
                      checked={allowVideos}
                      onChange={(e) => setAllowVideos(e.target.checked)}
                    />
                    <span className="create-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Rules Section */}
            <div className="create-form-group">
              <label className="create-label">
                Community Rules ({rules.filter(r => r.trim()).length}/10)
              </label>
              <div className="create-rules-container">
                {rules.map((rule, index) => (
                  <div key={index} className="create-rule-item">
                    <span className="create-rule-number">{index + 1}</span>
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => handleRuleChange(index, e.target.value)}
                      placeholder="Enter a community rule"
                      maxLength={200}
                      className="create-rule-input"
                    />
                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(index)}
                        className="create-rule-remove"
                      >
                        <X />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {rules.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="create-add-rule-button"
                >
                  <Plus />
                  Add Rule
                </button>
              )}
            </div>

            {/* Submit Button */}
            <div className="create-form-actions">
              <button
                type="button"
                onClick={() => navigate('/communities')}
                className="create-cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || !displayName.trim() || !description.trim() || nameAvailable === false}
                className="create-submit-button"
              >
                {loading ? (
                  <>
                    <div className="create-loading-spinner"></div>
                    Creating Community...
                  </>
                ) : (
                  <>
                    <Users />
                    Create Community
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
    