import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import Dashboard from './components/Dashboard';
import WelcomeScreen from './components/WelcomeScreen';
import AssessmentScreen from './components/AssessmentScreen';
import ResultsScreen from './components/ResultsScreen';
import ChatScreen from './components/ChatScreen';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [userProfile, setUserProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, loading } = useAuth();

  const screenVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const handleScreenChange = (screen, data = null) => {
    if (data) {
      if (data.profile) setUserProfile(data.profile);
      if (data.profileId) setProfileId(data.profileId);
      if (data.conversationId) setConversationId(data.conversationId);
    }
    setCurrentScreen(screen);
  };

  const handleViewProfile = (profile) => {
    setUserProfile(profile.analysis);
    setProfileId(profile.id);
    setCurrentScreen('results');
  };

  const handleNewConversation = (convId) => {
    setConversationId(convId);
    setCurrentScreen('chat');
  };

  const handleSelectConversation = (convId) => {
    setConversationId(convId);
    setCurrentScreen('chat');
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading AyurVAID...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container auth-layout">
        <Header />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={authMode}
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="screen-container"
            >
              {authMode === 'login' ? (
                <LoginScreen onSwitchToRegister={() => setAuthMode('register')} />
              ) : (
                <RegisterScreen onSwitchToLogin={() => setAuthMode('login')} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        <LoadingOverlay isVisible={isLoading} />
      </div>
    );
  }

  const renderMainContent = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard
            onStartAssessment={() => handleScreenChange('welcome')}
            onViewProfile={handleViewProfile}
            onStartChat={handleNewConversation}
            onViewConversation={handleSelectConversation}
          />
        );
      case 'welcome':
        return (
          <WelcomeScreen 
            onStartAssessment={() => handleScreenChange('assessment')}
          />
        );
      case 'assessment':
        return (
          <AssessmentScreen 
            onComplete={(profile, profileId) => 
              handleScreenChange('results', { profile, profileId })
            }
            setIsLoading={setIsLoading}
          />
        );
      case 'results':
        return (
          <ResultsScreen 
            userProfile={userProfile}
            onStartChat={() => handleScreenChange('chat')}
            onBackToDashboard={() => handleScreenChange('dashboard')}
          />
        );
      case 'chat':
        return (
          <ChatScreen 
            userProfile={userProfile}
            profileId={profileId}
            conversationId={conversationId}
            setIsLoading={setIsLoading}
            onBackToDashboard={() => handleScreenChange('dashboard')}
            setConversationId={setConversationId}
          />
        );
      case 'settings':
        return (
          <div className="settings-placeholder">
            <h2>Settings</h2>
            <p>Settings panel coming soon...</p>
            <button 
              className="btn btn-primary"
              onClick={() => handleScreenChange('dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        );
      default:
        return (
          <Dashboard
            onStartAssessment={() => handleScreenChange('welcome')}
            onViewProfile={handleViewProfile}
            onStartChat={handleNewConversation}
            onViewConversation={handleSelectConversation}
          />
        );
    }
  };

  return (
    <div className="app-container sidebar-layout">
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={handleScreenChange}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        activeConversationId={conversationId}
      />
      
      <main className="main-content-with-sidebar">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="screen-content"
          >
            {renderMainContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;