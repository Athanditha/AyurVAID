import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Plus, 
  User, 
  FileText, 
  LogOut, 
  Settings,
  Menu,
  X,
  Trash2,
  Edit3,
  Cpu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = ({ 
  currentScreen, 
  onNavigate, 
  onNewConversation, 
  onSelectConversation,
  activeConversationId,
  refreshTrigger
}) => {
  const [conversations, setConversations] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadUserData();
  }, [refreshTrigger]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [conversationsResponse, profilesResponse] = await Promise.all([
        axios.get('/api/conversations'),
        axios.get('/api/profile')
      ]);

      if (conversationsResponse.data.success) {
        setConversations(conversationsResponse.data.conversations);
      }

      if (profilesResponse.data.success) {
        setProfiles(profilesResponse.data.profiles);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    if (profiles.length === 0) {
      alert('Please complete your dosha assessment first.');
      return;
    }

    try {
      const response = await axios.post('/api/conversations');
      if (response.data.success) {
        await loadUserData(); // Refresh conversations
        onNewConversation(response.data.conversationId);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      try {
        await axios.delete(`/api/conversations/${conversationId}`);
        setConversations(conversations.filter(conv => conv.id !== conversationId));
        
        // If we're deleting the active conversation, navigate to dashboard
        if (conversationId === activeConversationId) {
          onNavigate('dashboard');
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '60px' }
  };

  const contentVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: { opacity: 0, display: 'none' }
  };

  return (
    <motion.div 
      className="sidebar"
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="sidebar-logo"
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              <span className="logo-icon">🌿</span>
              <span className="logo-text">AyurVAID</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Conversation Button */}
      <div className="sidebar-section">
        <button
          className={`new-conversation-btn ${profiles.length === 0 ? 'disabled-btn' : ''}`}
          onClick={handleNewConversation}
          title={isCollapsed ? (profiles.length === 0 ? "Assessment Required" : "New Conversation") : ""}
        >
          <Plus size={18} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                New Conversation
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="section-title"
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              Navigation
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="nav-items">
          <button
            className={`nav-item ${currentScreen === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
            title={isCollapsed ? "Dashboard" : ""}
          >
            <User size={18} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  Dashboard
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            className={`nav-item ${currentScreen === 'assessment' || currentScreen === 'welcome' ? 'active' : ''}`}
            onClick={() => onNavigate('welcome')}
            title={isCollapsed ? (profiles.length === 0 ? "Take Assessment" : "Update Assessment") : ""}
          >
            <FileText size={18} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  {profiles.length === 0 ? "Take Assessment" : "Update Assessment"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            className={`nav-item ${currentScreen === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate('settings')}
            title={isCollapsed ? "Settings" : ""}
          >
            <Settings size={18} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Conversations */}
      <div className="sidebar-section conversations-section">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="section-title"
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              Recent Conversations
            </motion.div>
          )}
        </AnimatePresence>

        <div className="conversations-list">
          {loading ? (
            <div className="loading-conversations">
              {!isCollapsed && <span>Loading...</span>}
            </div>
          ) : conversations.length === 0 ? (
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  className="empty-conversations"
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  No conversations yet
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            conversations.slice(0, 10).map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''}`}
                onClick={() => onSelectConversation(conversation.id)}
                title={isCollapsed ? conversation.title : ""}
              >
                <div className="conversation-icon">
                  <MessageCircle size={16} />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      className="conversation-content"
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      <div className="conversation-title">
                        {conversation.title}
                      </div>
                      <div className="conversation-meta">
                        {conversation.messageCount} messages
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.button
                      className="delete-conversation"
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      title="Delete conversation"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Profile & Settings */}
      <div className="sidebar-footer">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.button
              className={`user-info ${currentScreen === 'settings' ? 'active-account-btn' : ''}`}
              onClick={() => onNavigate('settings')}
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              style={{ border: 'none', background: 'none', cursor: 'pointer', outline: 'none', display: 'flex' }}
            >
              <div className="user-avatar">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="user-details">
                <div className="user-name">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="user-email">
                  {user?.email}
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="footer-actions">
        </div>
      </div>
      
      <button
        className="footer-btn logout-btn"
        onClick={logout}
        title={isCollapsed ? "Logout" : ""}
      >
        <LogOut size={18} />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              Logout
            </motion.span>
          )}
        </AnimatePresence>
      </button>

    </motion.div>
  );
};

export default Sidebar;