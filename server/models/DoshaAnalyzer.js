const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const ayurvedicKnowledge = require('../data/ayurvedic-knowledge');

class DoshaAnalyzer {
  constructor() {
    this.pythonScriptPath = path.join(__dirname, '../python/catboost_model.py');
    this.doshaDescriptions = ayurvedicKnowledge.doshaProfiles;
  }

  async analyzeResponses(responses) {
    try {
      // 1. Convert responses (Array of { csvColumn, value }) to a dictionary
      const inputData = {};
      responses.forEach(r => {
        if (r.csvColumn && r.value) {
          inputData[r.csvColumn] = r.value;
        }
      });

      console.log('Sending to ML Model:', inputData);

      // 2. Call the Python Inference Script
      const predictionResponse = await this.runPythonPrediction(inputData);
      
      if (!predictionResponse.success) {
        throw new Error(predictionResponse.error || "Model prediction failed");
      }

      console.log('ML Prediction successful:', predictionResponse.primary);

      const primary = predictionResponse.primary;
      const secondary = predictionResponse.secondary;

      // 3. Construct unified response format expected by frontend
        return {
          scores: predictionResponse.scores, // e.g. { vata: 20, pitta: 70, kapha: 10 }
          primary: primary,
          secondary: secondary,
          constitutionType: predictionResponse.constitutionType,
          confidence: predictionResponse.confidence,
          engine: predictionResponse.engine,
          xaiInsights: predictionResponse.xai_insights,
          profile: this.generateProfile(predictionResponse.scores, primary, secondary),
  
          recommendations: this.generateRecommendations(primary)
        };

    } catch (error) {
      console.error('Error in ML DoshaAnalyzer:', error);
      throw error;
    }
  }

  async runPythonPrediction(inputData) {
    // Attempt to use FastAPI server first for performance
    try {
      const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(`${pythonApiUrl}/predict`, { data: inputData }, { timeout: 5000 });
      return response.data;
    } catch (err) {
      console.warn('FastAPI server unreachable or failed, falling back to spawning python process...', err.message);
      
      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
          this.pythonScriptPath,
          JSON.stringify(inputData)
        ]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
          outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(`Python process exited with code ${code}. Error: ${errorData}`));
          }
          
          try {
            const jsonMatch = outputData.match(/\{.*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              resolve(parsed);
            } else {
              console.warn('Raw Python output:', outputData);
              resolve(JSON.parse(outputData));
            }
          } catch (e) {
            reject(new Error(`Failed to parse Python output: ${e.message}\nRaw Data: ${outputData}`));
          }
        });
      });
    }
  }

  generateProfile(percentages, primary, secondary) {
    const primaryDesc = this.doshaDescriptions[primary] || this.doshaDescriptions['vata'];
    const secondaryDesc = this.doshaDescriptions[secondary] || this.doshaDescriptions['pitta'];

    return {
      constitution: {
        primary: {
          dosha: primary,
          percentage: percentages[primary],
          description: primaryDesc
        },
        secondary: {
          dosha: secondary,
          percentage: percentages[secondary],
          description: secondaryDesc
        }
      },
      strengths: primaryDesc.balancedState.concat(secondaryDesc.balancedState.slice(0, 2)),
      vulnerabilities: primaryDesc.imbalancedState.concat(secondaryDesc.imbalancedState.slice(0, 2))
    };
  }

  generateRecommendations(primary) {
    const primaryDesc = this.doshaDescriptions[primary] || this.doshaDescriptions['vata'];
    
    return {
      lifestyle: primaryDesc.lifestyle ? Object.values(primaryDesc.lifestyle) : [],
      diet: [
        ...(primaryDesc.balancingFoods?.favor || []).map(item => `Favor: ${item}`),
        ...(primaryDesc.balancingFoods?.avoid || []).map(item => `Avoid: ${item}`)
      ],
      exercise: ayurvedicKnowledge.yogaPractices[primary] || [],
      mentalWellness: ayurvedicKnowledge.mentalHealth[primary]?.practices || []
    };
  }
}

module.exports = DoshaAnalyzer;