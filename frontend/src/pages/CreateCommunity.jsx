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
  const { currentUser } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();
  const nameInputRef = useRef(null);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/communities')}
                className="btn btn-ghost p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Create a New Community
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Build a space for your community to share and connect
                </p>
              </div>
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
            {/* Community Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Community Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
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
                  className="form-input w-full pl-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {nameChecking && <Loader className="w-4 h-4 animate-spin text-gray-400" />}
                  {nameAvailable === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {nameAvailable === false && <X className="w-4 h-4 text-red-500" />}
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span>{name.length}/21 characters</span>
                {nameAvailable === true && <span className="text-green-600">Name available</span>}
                {nameAvailable === false && <span className="text-red-600">Name taken</span>}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Only lowercase letters, numbers, and underscores allowed
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                className="form-input w-full"
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {displayName.length}/50 characters
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input w-full"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                className="form-input w-full"
              ></textarea>
              <div className="mt-1 text-xs text-gray-500 text-right">
                {description.length}/500 characters
              </div>
            </div>

            {/* Community Settings */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Community Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Public Community
                    </label>
                    <p className="text-xs text-gray-500">Anyone can view and join</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Allow Images
                    </label>
                    <p className="text-xs text-gray-500">Members can post images</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowImages}
                      onChange={(e) => setAllowImages(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Allow Videos
                    </label>
                    <p className="text-xs text-gray-500">Members can post videos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowVideos}
                      onChange={(e) => setAllowVideos(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Rules Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Community Rules ({rules.filter(r => r.trim()).length}/10)
              </label>
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{index + 1}.</span>
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => handleRuleChange(index, e.target.value)}
                      placeholder="Enter a community rule"
                      maxLength={200}
                      className="form-input flex-1"
                    />
                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(index)}
                        className="btn btn-ghost p-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {rules.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="mt-3 btn btn-secondary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </button>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/communities')}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || !displayName.trim() || !description.trim() || nameAvailable === false}
                className="btn btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 mr-3 animate-spin" />
                    Creating Community...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-3" />
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
    