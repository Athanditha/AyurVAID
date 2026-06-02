const ExplainableAI = require('./ExplainableAI');

describe('ExplainableAI (Rule-Based Engine) Unit Tests', () => {
  let xaiEngine;

  beforeEach(() => {
    xaiEngine = new ExplainableAI();
  });

  describe('DOSHA_ANALYSIS explanations', () => {
    test('should generate explanation WITH SHAP xaiInsights', () => {
      const analysisData = {
        primary: 'pitta',
        scores: { pitta: 45, kapha: 35, vata: 20 },
        engine: 'CatBoost_Python',
        responses: new Array(25).fill('test'),
        xaiInsights: {
          top_contributors: [
            { feature: 'Body_Frame', value: 'Medium' },
            { feature: 'Skin', value: 'Soft,Sweating' }
          ],
          counter_indicators: [
            { feature: 'Type_of_Hair', value: 'Dry' }
          ]
        }
      };

      const explanation = xaiEngine.generateExplanation(xaiEngine.explanationTypes.DOSHA_ANALYSIS, analysisData);

      expect(explanation.type).toBe('Statistical Machine Learning Analysis with SHAP');
      expect(explanation.confidence).toBe('High');
      expect(explanation.reasoning.length).toBe(4);
      expect(explanation.reasoning[0]).toContain('CatBoost_Python');
      expect(explanation.reasoning[1]).toContain('PITTA with 45%');
      expect(explanation.reasoning[2]).toContain("'Body Frame' (Medium), 'Skin' (Soft,Sweating)");
      expect(explanation.reasoning[3]).toContain("Counter Indicators: Traits like 'Type of Hair' (Dry)");
      expect(explanation.evidenceBased.interpretability).toBe('SHapley Additive exPlanations');
    });

    test('should generate explanation WITHOUT SHAP insights', () => {
      const analysisData = {
        primary: 'vata',
        scores: { pitta: 20, kapha: 30, vata: 50 },
        engine: 'CatBoost_Python',
        responses: new Array(25).fill('test')
      };

      const explanation = xaiEngine.generateExplanation(xaiEngine.explanationTypes.DOSHA_ANALYSIS, analysisData);

      expect(explanation.type).toBe('Statistical Machine Learning Analysis with SHAP');
      expect(explanation.reasoning.length).toBe(3);
      expect(explanation.reasoning[2]).toBe('This analysis was based on 25 exact physiological and behavioral features.');
    });
  });

  describe('RECOMMENDATION explanations', () => {
    test('should generate recommendation explanation with valid userProfile', () => {
      const recommendationData = {
        userProfile: { primary: 'kapha' }
      };

      const explanation = xaiEngine.generateExplanation(xaiEngine.explanationTypes.RECOMMENDATION, recommendationData);

      expect(explanation.type).toBe('AI Health Recommendation');
      expect(explanation.confidence).toBe('High');
      expect(explanation.reasoning[0]).toContain('strictly for a KAPHA-dominant physiology');
      expect(explanation.methodology).toBe('Heuristic alignment with traditional Ayurvedic frameworks');
    });

    test('should generate generic recommendation explanation without userProfile', () => {
      const recommendationData = {};

      const explanation = xaiEngine.generateExplanation(xaiEngine.explanationTypes.RECOMMENDATION, recommendationData);

      expect(explanation.type).toBe('AI Health Recommendation');
      expect(explanation.confidence).toBe('Medium');
      expect(explanation.reasoning[0]).toContain('General Ayurvedic advice');
      expect(explanation.reasoning[1]).toContain('please complete a Dosha assessment');
    });
  });

  describe('Generic explanations', () => {
    test('should return default explanation for unknown type', () => {
      const explanation = xaiEngine.generateExplanation('UNKNOWN_TYPE', {});

      expect(explanation.type).toBe('General AI Insight');
      expect(explanation.confidence).toBe('Medium');
      expect(explanation.reasoning[0]).toBe('Analysis based on general ayurvedic intelligence.');
    });
  });
});
