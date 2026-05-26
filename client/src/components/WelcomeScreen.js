import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Brain, Search } from 'lucide-react';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onStartAssessment }) => {
  const features = [
    {
      icon: <Leaf size={48} />,
      title: "Dosha Assessment",
      description: "12 comprehensive questions to determine your Vata, Pitta, and Kapha balance"
    },
    {
      icon: <Brain size={48} />,
      title: "AI Health Advisor",
      description: "Personalized recommendations based on your unique constitution"
    },
    {
      icon: <Search size={48} />,
      title: "Explainable AI",
      description: "Understand the reasoning behind every recommendation"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
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
    <div className="welcome-content">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={itemVariants}>
          Welcome to AyurVAID
        </motion.h2>
        
        <motion.p variants={itemVariants} className="welcome-description">
          Experience the future of personalized wellness through ancient Ayurvedic wisdom 
          enhanced by artificial intelligence. Discover your unique constitution and receive 
          premium health guidance tailored just for you.
        </motion.p>


        <motion.button
          className="btn btn-primary start-button"
          onClick={onStartAssessment}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Dosha Assessment
        </motion.button>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;