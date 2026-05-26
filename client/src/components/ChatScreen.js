import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ArrowLeft, Sparkles, ThumbsUp, ThumbsDown, Cpu, Brain } from 'lucide-react';
import axios from 'axios';
import './ChatScreen.css';

// Lightweight Markdown → HTML renderer (no external deps needed)
function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (```...```)
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic *text*
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Headers (### → h4, ## → h3, # → h2)
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    // Line breaks
    .replace(/\n/g, '<br/>');
  return html;
}

function formatProviderName(provider) {
  const names = {
    'gemini': 'Gemini LLM (Hybrid AI)',
    'custom': 'Rule-Based Engine (Traditional Wisdom)',
  };
  return names[provider] || `AI Provider: ${provider}`;
}

const ChatScreen = ({ userProfile, profileId, conversationId, setIsLoading, onBackToDashboard, setConversationId, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState({});
  const [messageFeedback, setMessageFeedback] = useState({}); // { messageId: 'positive' | 'negative' }
  const [currentProvider, setCurrentProvider] = useState('gemini');
  const [isSwitchingProvider, setIsSwitchingProvider] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch active provider on mount
  useEffect(() => {
    const fetchActiveProvider = async () => {
      try {
        const response = await axios.get('/api/chat/ai-info');
        if (response.data.success) {
          setCurrentProvider(response.data.providerInfo.current);
        }
      } catch (error) {
        console.error('Error fetching active AI provider:', error);
      }
    };
    fetchActiveProvider();
  }, []);

  const handleSwitchProvider = async (provider) => {
    if (provider === currentProvider || isSwitchingProvider) return;
    setIsSwitchingProvider(true);
    try {
      const response = await axios.post('/api/chat/switch-provider', { provider });
      if (response.data.success) {
        setCurrentProvider(response.data.currentProvider);
      }
    } catch (error) {
      console.error('Error switching AI provider:', error);
      alert('Failed to switch AI engine: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSwitchingProvider(false);
    }
  };

  const scrollToBottom = (delay = 0) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, delay);
  };

  useEffect(() => {
    scrollToBottom(100);
  }, [messages, expandedExplanations]);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      // Initialize with welcome message for new conversations
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: "Welcome to AyurVAID! I'm your premium Ayurvedic health intelligence advisor. Based on your personalized dosha analysis, I can provide expert recommendations for diet, lifestyle, exercise, and holistic wellness. How may I assist you today?",
          timestamp: new Date()
        }
      ]);
    }
  }, [conversationId]);

  const loadConversation = async () => {
    if (!conversationId) return;
    
    setIsTyping(true);
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/conversations/${conversationId}`);
      if (response.data.success) {
        setConversation(response.data.conversation);
        setMessages(response.data.conversation.messages || []);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    // Removed setIsLoading(true) to avoid full-screen loading overlay

    try {
      const response = await axios.post('/api/chat/message', {
        conversationId: conversationId,
        profileId: profileId,
        message: inputMessage
      });

      if (response.data.success) {
        // If we got a new conversation ID, update it
        if (response.data.conversationId && !conversationId) {
          setConversationId(response.data.conversationId);
        }

        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.response.message,
          explanation: response.data.response.explanation,
          doshaContext: response.data.response.doshaContext,
          aiProvider: response.data.response.aiProvider,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        if (onMessageSent) onMessageSent(); // Notify sidebar to refresh
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = async (messageId, type) => {
    try {
      const response = await axios.post('/api/chat/feedback', {
        conversationId,
        messageId,
        feedback: type,
        rating: type === 'positive' ? 5 : 1
      });

      if (response.data.success) {
        setMessageFeedback(prev => ({ ...prev, [messageId]: type }));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="chat-container-full">
      {/* Premium AI Provider Selector Toggle */}
      <div className="ai-engine-selector-bar">
        <div className="selector-title">
          <Cpu size={16} className="sparkles-icon" />
          <span>Active Intelligence Layer:</span>
        </div>
        <div className="selector-options">
          <button 
            className={`selector-opt ${currentProvider === 'gemini' ? 'active' : ''}`}
            onClick={() => handleSwitchProvider('gemini')}
            disabled={isSwitchingProvider}
            title="Switch to Gemini LLM for fluent, contextual health guidance"
          >
            <Sparkles size={14} />
            <span>Gemini 1.5 (Hybrid AI)</span>
          </button>
          <button 
            className={`selector-opt ${currentProvider === 'custom' ? 'active' : ''}`}
            onClick={() => handleSwitchProvider('custom')}
            disabled={isSwitchingProvider}
            title="Switch to Custom Rule-Based Engine for transparent, classical wisdom validation"
          >
            <Brain size={14} />
            <span>Rule-Based Engine</span>
          </button>
        </div>
        {isSwitchingProvider && (
          <div className="selector-loading">Re-routing cognitive pathways...</div>
        )}
      </div>

      <div className="chat-messages">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`message ${message.type}-message`}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="message-avatar">
                {message.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className="message-content">
                {message.type === 'bot' ? (
                  <div className="markdown-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
                ) : (
                  <p>{message.content}</p>
                )}
                
                {message.aiProvider && (
                  <div className="provider-badge-container">
                    <div className="provider-badge" title={`This response was generated by the ${message.aiProvider === 'custom' ? 'Rule-Based Engine' : 'Gemini AI model'}`}>
                      <Sparkles size={12} />
                      <span>Source: {formatProviderName(message.aiProvider)}</span>
                    </div>
                    
                    {message.type === 'bot' && message.aiProvider === 'custom' && (
                      <div className="feedback-actions">
                        <button 
                          className={`feedback-btn ${messageFeedback[message.id] === 'positive' ? 'active positive' : ''}`}
                          onClick={() => handleFeedback(message.id, 'positive')}
                          disabled={messageFeedback[message.id]}
                          title="This was helpful"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button 
                          className={`feedback-btn ${messageFeedback[message.id] === 'negative' ? 'active negative' : ''}`}
                          onClick={() => handleFeedback(message.id, 'negative')}
                          disabled={messageFeedback[message.id]}
                          title="This was not helpful"
                        >
                          <ThumbsDown size={14} />
                        </button>
                        {messageFeedback[message.id] && (
                          <span className="feedback-thanks">Thanks for your feedback!</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {message.explanation && (
                  <div className="explanation-container">
                    <button 
                      className="explanation-toggle-btn"
                      onClick={() => {
                        const newExpanded = {...expandedExplanations, [message.id]: !expandedExplanations[message.id]};
                        setExpandedExplanations(newExpanded);
                      }}
                    >
                      {expandedExplanations[message.id] ? "🔼 Hide AI Analysis" : "🔽 View Explainable AI Analysis"}
                    </button>

                    <AnimatePresence>
                      {expandedExplanations[message.id] && (
                        <motion.div 
                          className="explanation"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h5>🧠 Evidence-Based Reasoning</h5>
                    
                    {/* Main reasoning */}
                    {message.explanation.reasoning && Array.isArray(message.explanation.reasoning) && (
                      <div className="reasoning-section">
                        <h6>Why this advice?</h6>
                        <ul>
                          {message.explanation.reasoning.map((reason, index) => (
                            <li key={index}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Confidence and methodology */}
                    <div className="explanation-meta">
                      {message.explanation.confidence && (
                        <div className="confidence-badge">
                          <strong>Confidence:</strong> 
                          <span className={`confidence-level ${message.explanation.confidence.toLowerCase().replace(' ', '-')}`}>
                            {message.explanation.confidence}
                          </span>
                        </div>
                      )}
                      
                      {message.explanation.confidenceScore && (
                        <div className="confidence-score">
                          Score: {Math.round(message.explanation.confidenceScore * 100)}%
                        </div>
                      )}
                    </div>

                    {/* Evidence-based information */}
                    {message.explanation.evidenceBased && (
                      <div className="evidence-section">
                        <h6>📚 Evidence Base</h6>
                        {message.explanation.evidenceBased.traditionalBasis && (
                          <p><strong>Traditional Sources:</strong> {message.explanation.evidenceBased.traditionalBasis.join(', ')}</p>
                        )}
                        {message.explanation.evidenceBased.questionsAnalyzed && (
                          <p><strong>Assessment Data:</strong> {message.explanation.evidenceBased.questionsAnalyzed} questions analyzed</p>
                        )}
                      </div>
                    )}

                    {/* Research support */}
                    {message.explanation.evidenceSupport && message.explanation.evidenceSupport.research && message.explanation.evidenceSupport.research.length > 0 && (
                      <div className="research-section">
                        <h6>🔬 Research Support</h6>
                        {message.explanation.evidenceSupport.research.map((study, index) => (
                          <div key={index} className="research-item">
                            <p><strong>{study.study}</strong></p>
                            <p>{study.finding}</p>
                            <small>{study.relevance}</small>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Food details if available */}
                    {message.explanation.foodDetails && (
                      <div className="food-details-section">
                        <h6>🥗 Food Analysis</h6>
                        {message.explanation.foodDetails.map((food, index) => (
                          <div key={index} className="food-item">
                            <h7>{food.food}</h7>
                            <ul>
                              {food.whyRecommended.map((reason, rIndex) => (
                                <li key={rIndex}>{reason}</li>
                              ))}
                            </ul>
                            {food.ayurvedicProperties && (
                              <div className="ayurvedic-properties">
                                <small>
                                  <strong>Properties:</strong> {food.ayurvedicProperties.qualities?.join(', ')} | 
                                  <strong> Effect:</strong> {food.ayurvedicProperties.effect}
                                </small>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Decision tree visualization */}
                    {message.explanation.decisionTree && (
                      <div className="decision-tree-section">
                        <h6>🌳 Decision Process</h6>
                        <div className="decision-tree">
                          <div className="tree-root">{message.explanation.decisionTree.root}</div>
                          {message.explanation.decisionTree.branches && message.explanation.decisionTree.branches.map((branch, index) => (
                            <div key={index} className="tree-branch">
                              <div className="branch-node">{branch.node}</div>
                              <div className="branch-children">
                                {branch.children.map((child, cIndex) => (
                                  <div key={cIndex} className="tree-leaf">{child}</div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Methodology and transparency */}
                    {message.explanation.methodology && (
                      <div className="methodology-section">
                        <h6>⚙️ Methodology</h6>
                        <p>{message.explanation.methodology}</p>
                      </div>
                    )}

                    {/* Data sources */}
                    {message.explanation.sources && (
                      <div className="sources-section">
                        <h6>📖 Sources</h6>
                        <div className="sources-list">
                          {message.explanation.sources.map((source, index) => (
                            <span key={index} className="source-tag">{source}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alternatives if available */}
                    {message.explanation.alternatives && message.explanation.alternatives.length > 0 && (
                      <div className="alternatives-section">
                        <h6>🔄 Alternative Approaches</h6>
                        {message.explanation.alternatives.map((alt, index) => (
                          <div key={index} className="alternative-item">
                            <strong>{alt.approach}:</strong> {alt.suggestion}
                            <br /><small>{alt.rationale}</small>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Monitoring suggestions */}
                    {message.explanation.monitoring && (
                      <div className="monitoring-section">
                        <h6>📊 Monitoring & Follow-up</h6>
                        <p><strong>Timeframe:</strong> {message.explanation.monitoring.timeframe}</p>
                        <p><strong>Track:</strong> {message.explanation.monitoring.indicators?.join(', ')}</p>
                        <small>{message.explanation.monitoring.consultation}</small>
                      </div>
                    )}

                    {/* Dosha context */}
                    {message.doshaContext && message.doshaContext.whyThisAdvice && (
                      <div className="dosha-context-section">
                        <h6>🎯 Constitutional Context</h6>
                        <p>{message.doshaContext.whyThisAdvice}</p>
                        {message.doshaContext.seasonalContext && (
                          <p><strong>Seasonal:</strong> {message.doshaContext.seasonalContext}</p>
                        )}
                      </div>
                    )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                
                <div className="message-footer">
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              className="message bot-message"
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            >
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content typing-indicator-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your health, diet, lifestyle..."
            disabled={isTyping}
          />
          <motion.button
            className="btn btn-primary send-button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;