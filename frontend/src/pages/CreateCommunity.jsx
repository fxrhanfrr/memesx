import React, { useState, useEffect } from 'react';
import { Loader, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useInfiniteScroll';
import { useLocation, useNavigate } from 'react-router-dom';  

// This component provides a form for authenticated users to create a new community.
export default function CreateCommunity() {
  const { currentUser } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  // State for form inputs
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState(['']); // Start with one empty rule field

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle adding a new rule input field
  const handleAddRule = () => {
    setRules([...rules, '']);
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
    if (!name.trim() || !description.trim()) {
      setError('Community name and description are required.');
      return;
    }
    
    // Filter out empty rule strings
    const filteredRules = rules.filter(rule => rule.trim() !== '');

    setLoading(true);
    setError('');

    try {
      const response = await apiCall('/api/communities', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          rules: filteredRules
        }),
      });

      if (response.name) {
        navigate(`/r/${response.name}`);
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create a New Community
        </h1>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Community Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., cool_memes (3-21 lowercase characters, numbers and underscores)"
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what your community is about."
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            ></textarea>
          </div>
          
          {/* Rules Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Community Rules (optional)
            </label>
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">{index + 1}.</span>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    placeholder="Enter a community rule"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  />
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(index)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddRule}
              className="mt-3 inline-flex items-center space-x-2 px-3 py-1 text-sm font-medium text-orange-600 border border-orange-600 rounded-full hover:bg-orange-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add another rule</span>
            </button>
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
                  Creating...
                </>
              ) : (
                'Create Community'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// This component provides a search interface and displays search results.
    