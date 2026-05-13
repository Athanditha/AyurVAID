import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MessageCircle, FileText, Plus, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ onStartAssessment, onViewProfile, onStartChat, onViewConversation }) => {
  const [profiles, setProfiles] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [profilesResponse, conversationsResponse] = await Promise.all([
        axios.get('/api/profile'),
        axios.get('/api/conversations')
      ]);

      if (profilesResponse.data.success) {
        setProfiles(profilesResponse.data.profiles);
      }

      if (conversationsResponse.data.success) {
        setConversations(conversationsResponse.data.conversations);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await axios.post('/api/conversations');
      if (response.data.success) {
        onStartChat(response.data.conversationId);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await axios.delete(`/api/conversations/${conversationId}`);
        setConversations(conversations.filter(conv => conv.id !== conversationId));
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  if (loading || !user) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="dashboard-header" variants={itemVariants}>
          <div className="user-welcome">
            <h2>Welcome back, {user.firstName}!</h2>
            <p>Continue your wellness journey with AyurVAID</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={loadUserData}
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              className="btn btn-secondary logout-btn"
              onClick={logout}
              title="Logout"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="quick-actions" variants={itemVariants}>
          <h3>Quick Actions</h3>
          <div className="action-cards">
            {profiles.length === 0 ? (
              <motion.button
                className="action-card"
                onClick={onStartAssessment}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="action-icon">
                  <FileText size={24} />
                </div>
                <h4>Take Assessment</h4>
                <p>Discover your dosha profile</p>
              </motion.button>
            ) : (
              <motion.button
                className="action-card"
                onClick={() => onViewProfile(profiles[0])}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="action-icon">
                  <FileText size={24} />
                </div>
                <h4>View Profile</h4>
                <p>Review your dosha assessment</p>
              </motion.button>
            )}

            <motion.button
              className={`action-card ${profiles.length === 0 ? 'disabled-card' : ''}`}
              onClick={profiles.length === 0 ? () => alert('Please complete your dosha assessment first.') : handleNewConversation}
              whileHover={profiles.length === 0 ? {} : { y: -4 }}
              whileTap={profiles.length === 0 ? {} : { scale: 0.98 }}
            >
              <div className="action-icon">
                <Plus size={24} />
              </div>
              <h4>New Consultation</h4>
              <p>{profiles.length === 0 ? 'Assessment required' : 'Start a new AI health conversation'}</p>
            </motion.button>
          </div>
        </motion.div>

        {/* Dosha Profiles */}
        <motion.div className="dashboard-section" variants={itemVariants}>
          <div className="section-header">
            <h3>Your Dosha Profile</h3>
          </div>
          
          {profiles.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h4>No profile yet</h4>
              <p>Take your dosha assessment to get personalized recommendations and unlock chatting</p>
              <button className="btn btn-primary" onClick={onStartAssessment}>
                Take Assessment
              </button>
            </div>
          ) : (
            <div className="single-profile-container">
                <motion.div
                  className="profile-card"
                  onClick={() => onViewProfile(profiles[0])}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="profile-header">
                    <User size={20} />
                    <span className="profile-date">
                      {new Date(profiles[0].createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="profile-doshas">
                    <div className="dosha-primary">
                      Primary: {profiles[0].analysis.primary.toUpperCase()} ({profiles[0].analysis.scores[profiles[0].analysis.primary]}%)
                    </div>
                    <div className="dosha-secondary">
                      Secondary: {profiles[0].analysis.secondary.toUpperCase()} ({profiles[0].analysis.scores[profiles[0].analysis.secondary]}%)
                    </div>
                  </div>
                  <div className="profile-type">
                    {profiles[0].analysis.constitutionType}
                  </div>
                </motion.div>
            </div>
          )}
        </motion.div>

        {/* Conversations */}
        <motion.div className="dashboard-section" variants={itemVariants}>
          <div className="section-header">
            <h3>Your Conversations</h3>
            <span className="section-count">{conversations.length}</span>
          </div>
          
          {conversations.length === 0 ? (
            <div className="empty-state">
              <MessageCircle size={48} />
              <h4>No conversations yet</h4>
              <p>Start your first AI health consultation to get personalized guidance</p>
              <button 
                className="btn btn-primary" 
                onClick={profiles.length === 0 ? () => alert('Please complete your dosha assessment first.') : handleNewConversation}
              >
                Start Consultation
              </button>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  className="conversation-card"
                  onClick={() => onViewConversation(conversation.id)}
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="conversation-icon">
                    <MessageCircle size={20} />
                  </div>
                  <div className="conversation-info">
                    <h4>{conversation.title}</h4>
                    <p>{conversation.messageCount} messages</p>
                    <span className="conversation-date">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="delete-conversation"
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    title="Delete conversation"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;