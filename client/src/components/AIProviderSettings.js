import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Cpu, Cloud, Brain, Zap } from 'lucide-react';
import axios from 'axios';
import './AIProviderSettings.css';

const AIProviderSettings = ({ onClose }) => {
  const [providerInfo, setProviderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    loadProviderInfo();
  }, []);

  const loadProviderInfo = async () => {
    try {
      const response = await axios.get('/api/chat/ai-info');
      if (response.data.success) {
        setProviderInfo(response.data.providerInfo);
      }
    } catch (error) {
      console.error('Error loading provider info:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchProvider = async (provider) => {
    setSwitching(true);
    try {
      const response = await axios.post('/api/chat/switch-provider', {
        provider: provider
      });
      
      if (response.data.success) {
        await loadProviderInfo(); // Reload info
        // Show success message
      }
    } catch (error) {
      console.error('Error switching provider:', error);
      alert('Failed to switch provider: ' + error.response?.data?.error);
    } finally {
      setSwitching(false);
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'custom': return <Brain size={20} />;
      case 'local': return <Cpu size={20} />;
      case 'huggingface': return <Zap size={20} />;
      case 'openai': return <Cloud size={20} />;
      default: return <Settings size={20} />;
    }
  };

  const getProviderDescription = (provider) => {
    switch (provider) {
      case 'custom':
        return {
          name: 'Custom Rule-Based AI',
          description: 'Traditional Ayurvedic knowledge-based responses',
          pros: ['No external dependencies', 'Always available', 'Privacy-focused', 'Fast responses'],
          cons: ['Limited conversational ability', 'Predefined responses only']
        };
      case 'local':
        return {
          name: 'Local AI (Ollama)',
          description: 'AI models running locally on your machine',
          pros: ['Complete privacy', 'No API costs', 'Customizable models', 'Offline capable'],
          cons: ['Requires local setup', 'Uses system resources', 'Setup complexity']
        };
      case 'huggingface':
        return {
          name: 'Hugging Face Models',
          description: 'Open-source AI models via Hugging Face',
          pros: ['Wide model selection', 'Local execution', 'Medical-focused options', 'Free to use'],
          cons: ['Python setup required', 'Complex configuration', 'Resource intensive']
        };
      case 'openai':
        return {
          name: 'OpenAI GPT',
          description: 'Cloud-based GPT models from OpenAI',
          pros: ['Highest quality responses', 'Easy setup', 'Reliable service', 'Advanced reasoning'],
          cons: ['Requires API key', 'Usage costs', 'Privacy concerns', 'Internet dependent']
        };
      default:
        return { name: 'Unknown Provider', description: '', pros: [], cons: [] };
    }
  };

  if (loading) {
    return (
      <div className="ai-settings-overlay">
        <div className="ai-settings-modal">
          <div className="loading-spinner">Loading AI provider information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-settings-overlay">
      <motion.div 
        className="ai-settings-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="ai-settings-header">
          <h2>AI Provider Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="ai-settings-content">
          <div className="current-provider-section">
            <h3>Current Provider</h3>
            <div className="current-provider-card">
              {getProviderIcon(providerInfo.current)}
              <div>
                <h4>{getProviderDescription(providerInfo.current).name}</h4>
                <p>{getProviderDescription(providerInfo.current).description}</p>
              </div>
              <div className="provider-status active">Active</div>
            </div>
          </div>

          <div className="available-providers-section">
            <h3>Available Providers</h3>
            <div className="providers-grid">
              {Object.entries(providerInfo.available).map(([provider, available]) => {
                const info = getProviderDescription(provider);
                const isCurrent = provider === providerInfo.current;
                
                return (
                  <motion.div
                    key={provider}
                    className={`provider-card ${isCurrent ? 'current' : ''} ${!available ? 'unavailable' : ''}`}
                    whileHover={{ scale: available ? 1.02 : 1 }}
                  >
                    <div className="provider-header">
                      {getProviderIcon(provider)}
                      <div>
                        <h4>{info.name}</h4>
                        <p>{info.description}</p>
                      </div>
                      <div className={`provider-status ${available ? 'available' : 'unavailable'}`}>
                        {available ? (isCurrent ? 'Active' : 'Available') : 'Unavailable'}
                      </div>
                    </div>

                    <div className="provider-details">
                      <div className="pros-cons">
                        <div className="pros">
                          <h5>Pros:</h5>
                          <ul>
                            {info.pros.map((pro, index) => (
                              <li key={index}>✓ {pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="cons">
                          <h5>Cons:</h5>
                          <ul>
                            {info.cons.map((con, index) => (
                              <li key={index}>⚠ {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {available && !isCurrent && (
                        <button
                          className="switch-provider-btn"
                          onClick={() => switchProvider(provider)}
                          disabled={switching}
                        >
                          {switching ? 'Switching...' : 'Switch to this provider'}
                        </button>
                      )}

                      {!available && (
                        <div className="setup-hint">
                          <p>Setup required. Check AI_SETUP_GUIDE.md for instructions.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {providerInfo.localModels && providerInfo.localModels.length > 0 && (
            <div className="local-models-section">
              <h3>Available Local Models</h3>
              <div className="models-list">
                {providerInfo.localModels.map((model, index) => (
                  <div key={index} className="model-item">
                    <span className="model-name">{model.name}</span>
                    <span className="model-size">{model.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ai-settings-footer">
            <p>
              <strong>Fallback Provider:</strong> {getProviderDescription(providerInfo.fallback).name}
            </p>
            <p>
              If the current provider fails, the system will automatically fall back to the fallback provider.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIProviderSettings;