import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, User, Edit3, Save, ArrowRight, Sparkles, Trophy, Users, Heart } from 'lucide-react';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    photoURL: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  // Profile setup steps
  const steps = [
    {
      id: 1,
      title: 'Welcome to MemeX!',
      subtitle: 'Let\'s get to know you better',
      icon: <Sparkles className="w-8 h-8 text-yellow-500" />
    },
    {
      id: 2,
      title: 'Choose Your Display Name',
      subtitle: 'This is how other users will see you',
      icon: <User className="w-8 h-8 text-blue-500" />
    },
    {
      id: 3,
      title: 'Tell Us About Yourself',
      subtitle: 'Share a bit about who you are (optional)',
      icon: <Edit3 className="w-8 h-8 text-green-500" />
    },
    {
      id: 4,
      title: 'Add a Profile Picture',
      subtitle: 'Make your profile stand out (optional)',
      icon: <Camera className="w-8 h-8 text-purple-500" />
    },
    {
      id: 5,
      title: 'You\'re All Set!',
      subtitle: 'Welcome to the MemeX community!',
      icon: <Trophy className="w-8 h-8 text-orange-500" />
    }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photoURL: 'Please select an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, photoURL: 'Image size should be less than 5MB' }));
      return;
    }

    setIsPhotoUploading(true);
    try {
      // In a real app, you would upload to Cloudinary or Firebase Storage
      // For now, we'll create a local URL
      const photoURL = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photoURL }));
      setErrors(prev => ({ ...prev, photoURL: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, photoURL: 'Failed to upload image' }));
    } finally {
      setIsPhotoUploading(false);
    }
  };

  // Validate current step
  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 2 && !formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (currentStep === 2 && formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    if (currentStep === 2 && formData.displayName.trim().length > 30) {
      newErrors.displayName = 'Display name must be less than 30 characters';
    }

    if (currentStep === 3 && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Go to next step
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleCompleteSetup();
      }
    }
  };

  // Go to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Complete profile setup
  const handleCompleteSetup = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      // Update user profile
      await updateUserProfile({
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        photoURL: formData.photoURL
      });

      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error completing profile setup:', error);
      setErrors(prev => ({ ...prev, general: 'Failed to complete profile setup. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip optional steps
  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteSetup();
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="setup-welcome">
            <div className="setup-welcome-icon">
              <Sparkles className="w-24 h-24 text-yellow-500" />
            </div>
            <h1 className="setup-welcome-title">Welcome to MemeX!</h1>
            <p className="setup-welcome-text">
              You're about to join an amazing community of meme creators and enthusiasts. 
              Let's set up your profile to get you started!
            </p>
            <div className="setup-features">
              <div className="setup-feature">
                <Users className="w-6 h-6 text-blue-500" />
                <span>Join communities</span>
              </div>
              <div className="setup-feature">
                <Heart className="w-6 h-6 text-red-500" />
                <span>Create and share memes</span>
              </div>
              <div className="setup-feature">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span>Earn achievements</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="setup-name">
            <h2 className="setup-step-title">What should we call you?</h2>
            <p className="setup-step-subtitle">
              Choose a display name that represents you. You can change this later.
            </p>
            <div className="setup-input-group">
              <label htmlFor="displayName" className="setup-label">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Enter your display name"
                maxLength={30}
                className={`setup-input ${errors.displayName ? 'setup-input-error' : ''}`}
              />
              {errors.displayName && (
                <p className="setup-error">{errors.displayName}</p>
              )}
              <div className="setup-char-count">
                {formData.displayName.length}/30 characters
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="setup-bio">
            <h2 className="setup-step-title">Tell us about yourself</h2>
            <p className="setup-step-subtitle">
              Share a bit about who you are. This helps other users get to know you.
            </p>
            <div className="setup-input-group">
              <label htmlFor="bio" className="setup-label">
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Share your interests, hobbies, or what brings you to MemeX..."
                maxLength={500}
                rows={4}
                className="setup-textarea"
              />
              <div className="setup-char-count">
                {formData.bio.length}/500 characters
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="setup-photo">
            <h2 className="setup-step-title">Add a profile picture</h2>
            <p className="setup-step-subtitle">
              Make your profile stand out with a great photo. You can skip this for now.
            </p>
            <div className="setup-photo-upload">
              <div className="setup-photo-preview">
                {formData.photoURL ? (
                  <img
                    src={formData.photoURL}
                    alt="Profile preview"
                    className="setup-photo-image"
                  />
                ) : (
                  <div className="setup-photo-placeholder">
                    <Camera className="w-16 h-16 text-gray-400" />
                    <p>No photo selected</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="setup-file-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="setup-photo-button"
                disabled={isPhotoUploading}
              >
                {isPhotoUploading ? (
                  <div className="setup-loading-spinner"></div>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
                {formData.photoURL ? 'Change Photo' : 'Choose Photo'}
              </button>
              {errors.photoURL && (
                <p className="setup-error">{errors.photoURL}</p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="setup-complete">
            <div className="setup-complete-icon">
              <Trophy className="w-24 h-24 text-yellow-500" />
            </div>
            <h2 className="setup-step-title">You're all set!</h2>
            <p className="setup-step-subtitle">
              Your profile is ready. Welcome to the MemeX community!
            </p>
            <div className="setup-profile-summary">
              <div className="setup-profile-item">
                <strong>Name:</strong> {formData.displayName}
              </div>
              {formData.bio && (
                <div className="setup-profile-item">
                  <strong>Bio:</strong> {formData.bio}
                </div>
              )}
              <div className="setup-profile-item">
                <strong>Photo:</strong> {formData.photoURL ? 'Added' : 'Not added'}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render progress bar
  const renderProgressBar = () => {
    const progress = (currentStep / steps.length) * 100;
    return (
      <div className="setup-progress">
        <div className="setup-progress-bar">
          <div 
            className="setup-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="setup-progress-text">
          Step {currentStep} of {steps.length}
        </div>
      </div>
    );
  };

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="setup-step-indicators">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`setup-step-indicator ${
              index + 1 === currentStep ? 'active' : 
              index + 1 < currentStep ? 'completed' : ''
            }`}
          >
            <div className="setup-step-number">
              {index + 1 < currentStep ? (
                <Trophy className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className="setup-step-label">{step.title}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render action buttons
  const renderActionButtons = () => {
    return (
      <div className="setup-actions">
        {currentStep > 1 && (
          <button
            onClick={handlePrevious}
            className="setup-button setup-button-secondary"
            disabled={isSubmitting}
          >
            Back
          </button>
        )}
        
        {currentStep < steps.length - 1 && (
          <button
            onClick={handleSkip}
            className="setup-button setup-button-ghost"
            disabled={isSubmitting}
          >
            Skip
          </button>
        )}
        
        <button
          onClick={handleNext}
          className="setup-button setup-button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="setup-loading-spinner"></div>
          ) : currentStep === steps.length - 1 ? (
            <>
              Complete Setup
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="setup-page-container">
      {/* Animated Background */}
      <div className="setup-page-background">
        <div className="setup-page-bg-circle"></div>
        <div className="setup-page-bg-circle"></div>
        <div className="setup-page-bg-circle"></div>
      </div>

      <div className="setup-page-content">
        {/* Header */}
        <div className="setup-header">
          <div className="setup-logo">
            <Trophy className="w-8 h-8 text-orange-500" />
            <span className="setup-logo-text">MemeX</span>
          </div>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Step Indicators */}
        {renderStepIndicators()}

        {/* Main Content */}
        <div className="setup-main">
          <div className="setup-card">
            <div className="setup-step-header">
              {steps[currentStep - 1].icon}
              <h1 className="setup-step-title">{steps[currentStep - 1].title}</h1>
              <p className="setup-step-subtitle">{steps[currentStep - 1].subtitle}</p>
            </div>

            <div className="setup-step-content">
              {renderStepContent()}
            </div>

            {/* Action Buttons */}
            {renderActionButtons()}
          </div>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="setup-general-error">
            {errors.general}
          </div>
        )}
      </div>
    </div>
  );
}
