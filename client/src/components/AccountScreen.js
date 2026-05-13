import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Trash2, Shield, AlertTriangle, User, Calendar, Cpu } from 'lucide-react';
import AIProviderSettings from './AIProviderSettings';
import './AccountScreen.css';

const AccountScreen = () => {
  const { user, updateEmail, updatePassword, deleteAccount } = useAuth();
  
  const [emailDetails, setEmailDetails] = useState({ email: user?.email || '', status: '', message: '' });
  const [passwordDetails, setPasswordDetails] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', status: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteStatus, setDeleteStatus] = useState({ status: '', message: '' });
  const [showAISettings, setShowAISettings] = useState(false);

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailDetails(prev => ({ ...prev, status: 'loading', message: '' }));
    
    if (emailDetails.email === user?.email) {
      setEmailDetails(prev => ({ ...prev, status: 'error', message: 'This is already your current email address.' }));
      return;
    }
    
    const result = await updateEmail(emailDetails.email);
    if (result.success) {
      setEmailDetails(prev => ({ ...prev, status: 'success', message: 'Email address updated successfully.' }));
      setTimeout(() => setEmailDetails(prev => ({ ...prev, status: '', message: '' })), 4000);
    } else {
      setEmailDetails(prev => ({ ...prev, status: 'error', message: result.error }));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordDetails(prev => ({ ...prev, status: 'loading', message: '' }));
    
    if (passwordDetails.newPassword !== passwordDetails.confirmPassword) {
      setPasswordDetails(prev => ({ ...prev, status: 'error', message: 'New passwords do not match.' }));
      return;
    }
    
    const result = await updatePassword(passwordDetails.currentPassword, passwordDetails.newPassword);
    if (result.success) {
      setPasswordDetails({ currentPassword: '', newPassword: '', confirmPassword: '', status: 'success', message: 'Password changed successfully.' });
      setTimeout(() => setPasswordDetails(prev => ({ ...prev, status: '', message: '' })), 4000);
    } else {
      setPasswordDetails(prev => ({ ...prev, status: 'error', message: result.error }));
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteEmail !== user?.email) {
      setDeleteStatus({ status: 'error', message: 'Email confirmation does not match.' });
      return;
    }
    
    setDeleteStatus({ status: 'loading', message: '' });
    const result = await deleteAccount();
    if (!result.success) {
      setDeleteStatus({ status: 'error', message: result.error || 'Failed to delete account' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="account-screen">
      <div className="account-header">
        <h1>Account & Settings</h1>
        <p>Manage your profile, security, data preferences, and AI engine settings.</p>
      </div>

      <div className="account-grid">
        {/* Profile Information Card */}
        <section className="account-card profile-card">
          <div className="card-header">
            <User className="card-icon" />
            <h2>Profile Information</h2>
          </div>
          <div className="profile-details">
            <div className="profile-avatar">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="profile-info-grid">
              <div className="info-group">
                <label>First Name</label>
                <div className="info-value">{user?.firstName}</div>
              </div>
              <div className="info-group">
                <label>Last Name</label>
                <div className="info-value">{user?.lastName}</div>
              </div>
              <div className="info-group">
                <label>Member Since</label>
                <div className="info-value flex-align">
                  <Calendar size={14} className="icon-mr" />
                  {formatDate(user?.createdAt)}
                </div>
              </div>
              <div className="info-group">
                <label>Last Login</label>
                <div className="info-value flex-align">
                  <Shield size={14} className="icon-mr" />
                  {user?.lastLogin ? formatDate(user?.lastLogin) : 'Just now'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Change Email Card */}
        <section className="account-card">
          <div className="card-header">
            <Mail className="card-icon blue" />
            <h2>Change Email Address</h2>
          </div>
          <form className="account-form" onSubmit={handleEmailUpdate}>
            <div className="form-group">
              <label>Current Email Address</label>
              <div className="read-only-email">{user?.email}</div>
            </div>
            <div className="form-group">
              <label htmlFor="newEmail">New Email Address</label>
              <input 
                type="email" 
                id="newEmail"
                value={emailDetails.email}
                onChange={(e) => setEmailDetails(prev => ({...prev, email: e.target.value}))}
                required
                placeholder="Enter new email address"
              />
            </div>
            
            <AnimatePresence>
              {emailDetails.message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`status-message ${emailDetails.status}`}
                >
                  {emailDetails.message}
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={emailDetails.status === 'loading'}
            >
              {emailDetails.status === 'loading' ? <span className="spinner-small"></span> : 'Update Email'}
            </button>
          </form>
        </section>

        {/* Change Password Card */}
        <section className="account-card">
          <div className="card-header">
            <Lock className="card-icon amber" />
            <h2>Change Password</h2>
          </div>
          <form className="account-form" onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input 
                type="password" 
                id="currentPassword"
                value={passwordDetails.currentPassword}
                onChange={(e) => setPasswordDetails(prev => ({...prev, currentPassword: e.target.value}))}
                required
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input 
                type="password" 
                id="newPassword"
                value={passwordDetails.newPassword}
                onChange={(e) => setPasswordDetails(prev => ({...prev, newPassword: e.target.value}))}
                required
                placeholder="Enter new password (min. 6 characters)"
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword"
                value={passwordDetails.confirmPassword}
                onChange={(e) => setPasswordDetails(prev => ({...prev, confirmPassword: e.target.value}))}
                required
                placeholder="Confirm new password"
                minLength="6"
              />
            </div>

            <AnimatePresence>
              {passwordDetails.message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`status-message ${passwordDetails.status}`}
                >
                  {passwordDetails.message}
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              type="submit" 
              className="btn btn-outline"
              disabled={passwordDetails.status === 'loading'}
            >
              {passwordDetails.status === 'loading' ? <span className="spinner-small"></span> : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Danger Zone Card */}
        <section className="account-card danger-card">
          <div className="card-header">
            <AlertTriangle className="card-icon red" />
            <h2>Danger Zone</h2>
          </div>
          <div className="danger-content">
            <div className="danger-description">
              <h3>Delete Account</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            
            {!deleteConfirm ? (
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => setDeleteConfirm(true)}
              >
                Delete Account
              </button>
            ) : (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="delete-confirmation-form"
                onSubmit={handleDeleteAccount}
              >
                <div className="form-group">
                  <label>Type your email (<b>{user?.email}</b>) to confirm:</label>
                  <input 
                    type="email" 
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    required
                    placeholder="Enter email to confirm"
                  />
                </div>
                
                <AnimatePresence>
                  {deleteStatus.message && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`status-message ${deleteStatus.status}`}
                    >
                      {deleteStatus.message}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="delete-actions">
                  <button 
                    type="submit" 
                    className="btn btn-danger"
                    disabled={deleteStatus.status === 'loading'}
                  >
                    {deleteStatus.status === 'loading' ? <span className="spinner-small"></span> : 'Permanently Delete'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost"
                    onClick={() => {
                      setDeleteConfirm(false);
                      setDeleteEmail('');
                      setDeleteStatus({status: '', message: ''});
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </section>

        {/* AI Provider Settings Card */}
        <section className="account-card">
          <div className="card-header">
            <Cpu className="card-icon" style={{ color: '#8b5cf6' }} />
            <h2>AI Engine Settings</h2>
          </div>
          <div className="account-form">
            <div className="form-group">
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-medium)', lineHeight: '1.6' }}>
                Configure the artificial intelligence engine that powers your AyurVAID chatbot. Choose between cloud providers like Gemini or run models locally for enhanced privacy.
              </p>
              <button 
                className="btn btn-outline" 
                onClick={() => setShowAISettings(true)}
                style={{ width: '100%' }}
              >
                Configure AI Provider
              </button>
            </div>
          </div>
        </section>

      </div>
      
      <AnimatePresence>
        {showAISettings && (
          <AIProviderSettings onClose={() => setShowAISettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountScreen;
