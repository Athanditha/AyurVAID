import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Home, Utensils, Activity, Brain, ArrowLeft, ShieldCheck } from 'lucide-react';
import './ResultsScreen.css';

const ResultsScreen = ({ userProfile, onStartChat, onBackToDashboard }) => {
  if (!userProfile) {
    return <div className="results-loading">Loading results...</div>;
  }

  const { scores, primary, secondary, constitutionType, profile, recommendations, explanation, aiInsight } = userProfile;

  const doshaColors = {
    vata: '#4A90E2',
    pitta: '#F5A623',
    kapha: 'var(--secondary-green)'
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const recommendationCards = [
    {
      icon: <Home size={24} />,
      title: "Lifestyle Recommendations",
      items: recommendations.lifestyle
    },
    {
      icon: <Utensils size={24} />,
      title: "Dietary Guidelines",
      items: [
        `Favor: ${recommendations.dietary.favor.join(', ')}`,
        `Avoid: ${recommendations.dietary.avoid.join(', ')}`
      ]
    },
    {
      icon: <Activity size={24} />,
      title: "Exercise Recommendations",
      items: recommendations.exercise
    },
    {
      icon: <Brain size={24} />,
      title: "Mental Wellness",
      items: recommendations.mentalWellness
    }
  ];

  return (
    <div className="results-content">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="results-header" variants={itemVariants}>
          <button
            className="back-button"
            onClick={onBackToDashboard}
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h2>Your Dosha Analysis Results</h2>
        </motion.div>

        <motion.div className="dosha-chart" variants={itemVariants}>
          {['vata', 'pitta', 'kapha'].map((dosha) => (
            <div key={dosha} className="dosha-item">
              <motion.div
                className={`dosha-circle dosha-${dosha}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
              >
                <span>{scores[dosha]}%</span>
              </motion.div>
              <div className="dosha-name">
                {dosha.charAt(0).toUpperCase() + dosha.slice(1)}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div className="constitution-type" variants={itemVariants}>
          <h3>Your Constitution: {constitutionType}</h3>
          <p>
            Primary: {primary.toUpperCase()} ({scores[primary]}%) |
            Secondary: {secondary.toUpperCase()} ({scores[secondary]}%)
          </p>
        </motion.div>

        <motion.div className="explanation" variants={itemVariants}>
          <div className="ai-wisdom-card">
            <div className="ai-wisdom-header">
              <Brain size={20} className="ai-icon" />
              <h5>Personalized Constitutional Wisdom</h5>
            </div>
            <p className="ai-wisdom-text">"{aiInsight || explanation?.summary}"</p>
          </div>

          <div className="xai-card">
             <div className="xai-header">
                 <ShieldCheck size={20} className="xai-icon" />
                 <h5>Explainable AI (xAI) Reasoning</h5>
             </div>
             <p className="xai-confidence"><strong>Model Confidence:</strong> {explanation?.confidence || 'High'}</p>
             <ul className="xai-list">
                 {explanation?.reasoning?.map((reason, index) => (
                 <li key={index}>
                     <span className="xai-bullet"></span>
                     {reason}
                 </li>
                 )) || <p>No explanation data available.</p>}
             </ul>
             {explanation?.evidenceBased && (
                 <div className="xai-footer">
                     <span className="xai-tag">{explanation.evidenceBased.interpretability || 'Machine Learning'}</span>
                     <span className="xai-tag">{explanation.evidenceBased.datasetSize || '5000'} Clinical Profiles</span>
                 </div>
             )}
          </div>
        </motion.div>

        <motion.div
          className="recommendations"
          variants={containerVariants}
        >
          {recommendationCards.map((card, index) => (
            <motion.div
              key={index}
              className="recommendation-card"
              variants={itemVariants}
              whileHover={{ y: -4 }}
            >
              <div className="card-header">
                <div className="card-icon">{card.icon}</div>
                <h4>{card.title}</h4>
              </div>
              <ul>
                {card.items.map((item, itemIndex) => (
                  <li key={itemIndex}>• {item}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          className="btn btn-primary chat-button"
          onClick={onStartChat}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={20} />
          Start AI Health Consultation
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ResultsScreen;