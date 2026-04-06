import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Home, Utensils, Activity, Brain, ArrowLeft, ShieldCheck } from 'lucide-react';
import './ResultsScreen.css';

const ResultsScreen = ({ userProfile, onStartChat, onBackToDashboard }) => {
  if (!userProfile) {
    return <div className="results-loading">Loading results...</div>;
  }

  const { scores, primary, secondary, constitutionType, profile, recommendations, explanation, aiInsight } = userProfile;

  const doshaLabels = {
    vata: 'Air & Space',
    pitta: 'Fire & Water',
    kapha: 'Earth & Water'
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



  return (
    <div className="results-wrapper">
      <div className="results-main">
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
              <div key={dosha} className={`dosha-item ${primary === dosha ? 'primary' : secondary === dosha ? 'secondary' : 'minor'}`}>
                <motion.div
                  className={`dosha-circle dosha-${dosha}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                >
                  <span className="dosha-initial">{dosha.charAt(0).toUpperCase()}</span>
                </motion.div>
                <div className="dosha-name">
                  {dosha.charAt(0).toUpperCase() + dosha.slice(1)}
                </div>
                <div className="dosha-label">{doshaLabels[dosha]}</div>
              </div>
            ))}
          </motion.div>

          <motion.div className="constitution-type" variants={itemVariants}>
            <h3>Your Constitution: {constitutionType}</h3>
            <p className="constitution-subtitle">
              Primary: {primary.toUpperCase()} | Secondary: {secondary.toUpperCase()}
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
      
      <div className="results-sidepanel">
        <motion.div 
          className="tree-diagram-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="tree-header">
             <Activity size={24} className="tree-icon" />
             <h3>{primary.toUpperCase()} Characteristics</h3>
          </div>
          
          <div className="tree-root">
             <div className="tree-node-circle root-circle">{primary.charAt(0).toUpperCase()}</div>
          </div>
          
          <div className="tree-branches">
            <div className="tree-branch strengths-branch">
              <div className="branch-line"></div>
              <div className="tree-node-content">
                <h4 className="node-title strengths-title">Strengths</h4>
                <ul className="node-list">
                  {profile.strengths.slice(0, 4).map((strength, i) => (
                    <li key={`str-${i}`}>{strength}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="tree-branch vulnerabilities-branch">
               <div className="branch-line"></div>
               <div className="tree-node-content">
                 <h4 className="node-title vulnerabilities-title">Vulnerabilities</h4>
                 <ul className="node-list">
                   {profile.vulnerabilities.slice(0, 4).map((vuln, i) => (
                     <li key={`vuln-${i}`}>{vuln}</li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsScreen;