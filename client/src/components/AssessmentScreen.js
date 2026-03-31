import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import './AssessmentScreen.css';

const AssessmentScreen = ({ onComplete, setIsLoading }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/dosha/questions');
      if (response.data.success) {
        setQuestions(response.data.questions);
        setResponses(new Array(response.data.questions.length).fill(null));
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    const question = questions[currentQuestionIndex];
    const selectedOption = question.options[optionIndex];

    const newResponses = [...responses];
    newResponses[currentQuestionIndex] = {
      questionId: question.id,
      csvColumn: question.csvColumn,
      value: selectedOption.value,
      text: selectedOption.text
    };

    setResponses(newResponses);
    setSelectedOption(optionIndex);
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(responses[currentQuestionIndex + 1]?.optionIndex || null);
    } else {
      await completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(responses[currentQuestionIndex - 1]?.optionIndex || null);
    }
  };

  const completeAssessment = async () => {
    setIsLoading(true);
    try {
      const analysisResponse = await axios.post('/api/dosha/analyze', {
        responses: responses,
        userInfo: { timestamp: new Date().toISOString() }
      });

      if (analysisResponse.data.success) {
        const profileResponse = await axios.post('/api/profile/store', {
          analysis: analysisResponse.data.analysis,
          userInfo: analysisResponse.data.userInfo
        });

        onComplete(
          analysisResponse.data.analysis,
          profileResponse.data.profileId
        );
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
      alert('Failed to complete assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (questions.length === 0) {
    return <div className="assessment-loading">Loading questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = selectedOption !== null;

  return (
    <div className="assessment-content">
      <div className="progress-container">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="question-counter">
          <span className="current">{currentQuestionIndex + 1}</span> of{' '}
          <span className="total">{questions.length}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          className="question-card"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="question-category">
            {currentQuestion.category}
          </div>
          <h3 className="question-text">
            {currentQuestion.question}
          </h3>

          <div className="options">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                className={`option ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(index)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {option.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="navigation-buttons">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canProceed}
        >
          {isLastQuestion ? 'Complete Assessment' : 'Next'}
          {!isLastQuestion && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
};

export default AssessmentScreen;