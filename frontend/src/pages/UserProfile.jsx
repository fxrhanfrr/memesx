import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Trophy, Calendar, Users, Target, TrendingUp, Heart, MessageCircle, Eye, Share2, Edit3, Camera, Palette, Bell, Shield, Star, Zap, Crown, Flame, Award, LogOut, Save, X, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useInfiniteScroll';
import PostCard from '../components/PostCard';

// This component displays a user's profile, including their posts and comments.
export default function UserProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { currentUser, logout, userProfile } = useAuth();
  const { apiCall } = useApi();

  // Check if current user needs to complete profile setup
  useEffect(() => {
    if (currentUser && currentUser.uid === uid && userProfile && !userProfile.displayName) {
      navigate('/profile-setup');
    }
  }, [currentUser, uid, userProfile, navigate]);

  const [activeTab, setActiveTab] = useState('posts');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingBio, setEditingBio] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showCommunities, setShowCommunities] = useState(false);

  // Mock data
  const achievements = [
    { id: 1, name: 'First Post', icon: Star, color: 'text-yellow-500', description: 'Created your first post', unlocked: true },
    { id: 2, name: 'Popular Creator', icon: TrendingUp, color: 'text-orange-500', description: 'Reached 100+ upvotes', unlocked: true },
    { id: 3, name: 'Community Pillar', icon: Users, color: 'text-blue-500', description: 'Joined 5+ communities', unlocked: false },
    { id: 4, name: 'Viral Sensation', icon: Flame, color: 'text-red-500', description: 'Post reached 1000+ upvotes', unlocked: false },
    { id: 5, name: 'Comment Master', icon: MessageCircle, color: 'text-green-500', description: '100+ comments', unlocked: true },
    { id: 6, name: 'Karma King', icon: Crown, color: 'text-purple-500', description: 'Reached 1000+ karma', unlocked: false }
  ];

  const recentActivity = [
    { id: 1, type: 'post', action: 'created a post', title: 'Funny meme about cats', time: '2 hours ago', score: 45 },
    { id: 2, type: 'comment', action: 'commented on', title: 'Best programming jokes', time: '5 hours ago', score: 12 },
    { id: 3, type: 'upvote', action: 'upvoted', title: 'Weekend vibes', time: '1 day ago', score: null },
    { id: 4, type: 'community', action: 'joined community', title: 'Tech Humor', time: '2 days ago', score: null }
  ];

  const socialConnections = {
    followers: 127,
    following: 89,
    communities: 12,
    mutualFriends: 23
  };

  const userCommunities = [
    { id: 1, name: 'Tech Humor', members: 15420, description: 'The best programming jokes and memes', isModerator: false },
    { id: 2, name: 'Gaming Memes', members: 8920, description: 'Gaming culture and humor', isModerator: true },
    { id: 3, name: 'Cat Lovers', members: 23450, description: 'Cats doing funny things', isModerator: false },
    { id: 4, name: 'Developer Life', members: 12340, description: 'Real life of software developers', isModerator: false }
  ];

  // Create a demo user profile
  const createDemoUser = (uid) => {
    return {
      uid: uid,
      displayName: `Demo_${uid.slice(0, 8)}`,
      photoURL: null,
      email: 'demo@example.com',
      bio: 'This is a demo profile to showcase the new features! The user ID you entered does not exist in our database.',
      karma: Math.floor(Math.random() * 1000) + 100,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      posts: [],
      comments: [],
      totalUpvotes: Math.floor(Math.random() * 500) + 50,
      bestPostScore: Math.floor(Math.random() * 200) + 20,
      activeDays: Math.floor(Math.random() * 30) + 5,
      communityRank: 'Demo User',
      isDemo: true,
      joinedCommunities: userCommunities
    };
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching user profile for UID:', uid);
      const response = await apiCall(`/api/users/${uid}`);
      console.log('API Response:', response);
      
      if (response && response.user) {
        setUser(response.user);
        setEditingName(response.user.displayName || '');
        setEditingBio(response.user.bio || '');
      } else if (response && response.data) {
        setUser(response.data);
        setEditingName(response.data.displayName || '');
        setEditingBio(response.data.bio || '');
      } else {
        console.log('API response format unexpected, creating demo user');
        const demoUser = createDemoUser(uid);
        setUser(demoUser);
        setEditingName(demoUser.displayName || '');
        setEditingBio(demoUser.bio || '');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('User not found. This user ID does not exist in our database.');
      const demoUser = createDemoUser(uid);
      setUser(demoUser);
      setEditingName(demoUser.displayName || '');
      setEditingBio(demoUser.bio || '');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile editing
  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setEditingName(user.displayName || '');
    setEditingBio(user.bio || '');
  };

  const handleSaveProfile = async () => {
    try {
      console.log('Saving profile:', { displayName: editingName, bio: editingBio });
      setUser(prev => ({
        ...prev,
        displayName: editingName,
        bio: editingBio
      }));
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditingName(user.displayName || '');
    setEditingBio(user.bio || '');
  };

  // Handle profile picture upload
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      console.log('Uploading photo:', file.name);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fakePhotoURL = URL.createObjectURL(file);
      setUser(prev => ({
        ...prev,
        photoURL: fakePhotoURL
      }));
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    if (uid) {
      fetchUserProfile();
    }
  }, [uid]);

  const isCurrentUserProfile = currentUser && currentUser.uid === uid;

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="profile-loading">
          <div className="profile-loading-spinner"></div>
          <p className="loading-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-page-container">
        <div className="profile-page-content">
          <div className="profile-empty-state">
            <h3 className="profile-empty-title">{error}</h3>
            <p className="profile-empty-text">
              Unable to load the user profile. This might be due to a network issue or the user doesn't exist.
            </p>
            <div className="profile-error-actions">
              <button
                onClick={() => fetchUserProfile()}
                className="profile-load-more-button"
              >
                <TrendingUp className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => navigate(-1)}
                className="profile-load-more-button profile-secondary-button"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="profile-page-container">
        {/* Animated Background */}
        <div className="profile-page-background">
          <div className="profile-page-bg-circle"></div>
          <div className="profile-page-bg-circle"></div>
          <div className="profile-page-bg-circle"></div>
        </div>

        <div className="profile-page-content">
          {/* Demo Banner */}
          {user.isDemo && (
            <div className="demo-banner">
              <div className="demo-banner-content">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div className="demo-banner-text">
                  <strong>Demo Mode</strong> - This user ID doesn't exist in our database. 
                  We're showing you a demo profile to showcase all the new features!
                </div>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-header-content">
              <div className="profile-avatar-container">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User profile"
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                {isCurrentUserProfile && (
                  <div className="profile-avatar-actions">
                    <label className="profile-avatar-edit" htmlFor="photo-upload">
                      <Camera className="w-4 h-4" />
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {isUploadingPhoto && (
                      <div className="profile-avatar-uploading">
                        <div className="profile-loading-spinner"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <div className="profile-name-section">
                  {isEditingProfile ? (
                    <div className="profile-name-edit">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="profile-name-input"
                        placeholder="Enter your name"
                        maxLength={50}
                      />
                      <div className="profile-name-edit-actions">
                        <button
                          onClick={handleSaveProfile}
                          className="profile-save-button"
                          disabled={!editingName.trim()}
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="profile-cancel-button"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <h1 className="profile-name">
                      {user.displayName}
                    </h1>
                  )}
                  {isCurrentUserProfile && !isEditingProfile && (
                    <div className="profile-actions">
                      <button 
                        onClick={handleEditProfile}
                        className="profile-edit-button profile-edit-button-small"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        className="profile-settings-button"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="profile-stats">
                  <span className="profile-stat">
                    <Award className="w-4 h-4" />
                    <span>{user.karma || 0} Karma</span>
                  </span>
                  <span className="profile-stat">
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="profile-stat">
                    <Eye className="w-4 h-4" />
                    <span>{user.posts?.length || 0} Posts</span>
                  </span>
                </div>
                
                {/* Bio Section */}
                <div className="profile-bio-section">
                  {isEditingProfile ? (
                    <div className="profile-bio-edit">
                      <textarea
                        value={editingBio}
                        onChange={(e) => setEditingBio(e.target.value)}
                        className="profile-bio-input"
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                        rows={3}
                      />
                      <div className="profile-bio-char-count">
                        {editingBio.length}/500 characters
                      </div>
                    </div>
                  ) : (
                    <div className="profile-bio-display">
                      {user.bio ? (
                        <p className="profile-bio">{user.bio}</p>
                      ) : (
                        <p className="profile-bio-empty">
                          {isCurrentUserProfile ? 'No bio yet. Click Edit to add one!' : 'This user has not set a bio yet.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Logout Button for Current User */}
              {isCurrentUserProfile && (
                <div className="profile-logout-section">
                  <button
                    onClick={handleLogout}
                    className="profile-logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Stats Dashboard */}
            <div className="profile-stats-dashboard">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{socialConnections.followers}</div>
                    <div className="stat-label">Followers</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{socialConnections.following}</div>
                    <div className="stat-label">Following</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{user.joinedCommunities?.length || socialConnections.communities}</div>
                    <div className="stat-label">Communities</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{socialConnections.mutualFriends}</div>
                    <div className="stat-label">Mutual</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Communities Information */}
            {user.joinedCommunities && user.joinedCommunities.length > 0 && (
              <div className="profile-communities">
                <div className="communities-header">
                  <h3 className="communities-title">
                    <Hash className="w-5 h-5" />
                    Communities
                  </h3>
                  <button
                    onClick={() => setShowCommunities(!showCommunities)}
                    className="communities-toggle-button"
                  >
                    {showCommunities ? 'Hide' : 'Show'} Communities
                  </button>
                </div>
                
                {showCommunities && (
                  <div className="communities-grid">
                    {user.joinedCommunities.map((community) => (
                      <div key={community.id} className="community-card">
                        <div className="community-info">
                          <h4 className="community-name">
                            r/{community.name}
                            {community.isModerator && (
                              <span className="moderator-badge">Mod</span>
                            )}
                          </h4>
                          <p className="community-description">{community.description}</p>
                          <div className="community-meta">
                            <span className="community-members">
                              {community.members.toLocaleString()} members
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Achievement Badges */}
            <div className="profile-achievements">
              <h3 className="achievements-title">
                <Trophy className="w-5 h-5" />
                Achievements
              </h3>
              <div className="achievements-grid">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={achievement.id} 
                      className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                      title={achievement.description}
                    >
                      <Icon className={`w-6 h-6 ${achievement.unlocked ? achievement.color : 'text-gray-400'}`} />
                      <span className="achievement-name">{achievement.name}</span>
                      {achievement.unlocked && (
                        <div className="achievement-unlock-indicator">
                          <Star className="w-3 h-3 text-yellow-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="profile-tabs">
            <nav className="profile-tabs-nav" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('posts')}
                className={`profile-tab-button ${
                  activeTab === 'posts' ? 'active' : ''
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Posts
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`profile-tab-button ${
                  activeTab === 'comments' ? 'active' : ''
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Comments
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`profile-tab-button ${
                  activeTab === 'activity' ? 'active' : ''
                }`}
              >
                <Calendar className="w-4 h-4" />
                Activity
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`profile-tab-button ${
                  activeTab === 'insights' ? 'active' : ''
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Insights
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="profile-tab-content">
            {activeTab === 'posts' && <UserPosts uid={uid} />}
            {activeTab === 'comments' && <UserComments uid={uid} />}
            {activeTab === 'activity' && <UserActivity recentActivity={recentActivity} />}
            {activeTab === 'insights' && <UserInsights user={user} />}
          </div>
        </div>

        {/* Profile Settings Menu */}
        {showProfileMenu && (
          <div className="profile-settings-menu">
            <div className="settings-menu-header">
              <h3>Profile Settings</h3>
              <button 
                onClick={() => setShowProfileMenu(false)}
                className="settings-close-button"
              >
                ×
              </button>
            </div>
            <div className="settings-menu-items">
              <button className="settings-menu-item" onClick={handleEditProfile}>
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
              <label className="settings-menu-item" htmlFor="photo-upload-settings">
                <Camera className="w-4 h-4" />
                Change Photo
                <input
                  id="photo-upload-settings"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <button className="settings-menu-item">
                <Palette className="w-4 h-4" />
                Customize Theme
              </button>
              <button className="settings-menu-item">
                <Bell className="w-4 h-4" />
                Notification Settings
              </button>
              <button className="settings-menu-item">
                <Shield className="w-4 h-4" />
                Privacy Settings
              </button>
              <button className="settings-menu-item" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-page-content">
        <div className="profile-empty-state">
          <h3 className="profile-empty-title">Something went wrong</h3>
          <p className="profile-empty-text">
            We couldn't load the profile. Please try again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="profile-load-more-button"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function UserPosts({ uid }) {
  return (
    <div className="profile-posts-container">
      <div className="profile-empty-state">
        <h3 className="profile-empty-title">No posts yet</h3>
        <p className="profile-empty-text">
          This user has not made any posts yet.
        </p>
      </div>
    </div>
  );
}

function UserComments({ uid }) {
  return (
    <div className="profile-comments-container">
      <div className="profile-empty-state">
        <h3 className="profile-empty-title">No comments yet</h3>
        <p className="profile-empty-text">
          This user has not made any comments yet.
        </p>
      </div>
    </div>
  );
}

function UserActivity({ recentActivity }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'post': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'upvote': return <Heart className="w-4 h-4 text-red-500" />;
      case 'community': return <Users className="w-4 h-4 text-purple-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="profile-activity-container">
      <div className="activity-timeline">
        {recentActivity.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-text">
                <span className="activity-action">{activity.action}</span>
                <span className="activity-title">{activity.title}</span>
              </div>
              <div className="activity-meta">
                <span className="activity-time">{activity.time}</span>
                {activity.score && (
                  <span className="activity-score">
                    <Award className="w-3 h-3" />
                    {activity.score}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserInsights({ user }) {
  const insights = [
    { label: 'Total Posts', value: user.posts?.length || 0, icon: MessageCircle, color: 'text-blue-500' },
    { label: 'Total Comments', value: user.comments?.length || 0, icon: MessageCircle, color: 'text-green-500' },
    { label: 'Total Upvotes', value: user.totalUpvotes || 0, icon: Heart, color: 'text-red-500' },
    { label: 'Best Post Score', value: user.bestPostScore || 0, icon: TrendingUp, color: 'text-orange-500' },
    { label: 'Active Days', value: user.activeDays || 0, icon: Calendar, color: 'text-purple-500' },
    { label: 'Community Rank', value: user.communityRank || 'Newcomer', icon: Crown, color: 'text-yellow-500' }
  ];

  return (
    <div className="profile-insights-container">
      <div className="insights-grid">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="insight-card">
              <div className="insight-icon">
                <Icon className={`w-6 h-6 ${insight.color}`} />
              </div>
              <div className="insight-content">
                <div className="insight-value">{insight.value}</div>
                <div className="insight-label">{insight.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="insights-chart-placeholder">
        <div className="chart-placeholder-content">
          <TrendingUp className="w-12 h-12 text-gray-400" />
          <h3 className="chart-placeholder-title">Activity Analytics</h3>
          <p className="chart-placeholder-text">
            Detailed charts and analytics coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}


