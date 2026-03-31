import sys
import json
import os
import joblib
import pandas as pd

def predict_dosha(input_data_json):
    try:
        # 1. Parse Input
        input_data = json.loads(input_data_json)
        
        # 2. Setup Paths
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.join(base_dir, 'models')
        
        # 3. Load Artifacts
        xgb_model = joblib.load(os.path.join(model_dir, 'xgboost_model.joblib'))
        rf_model = joblib.load(os.path.join(model_dir, 'random_forest_model.joblib'))
        feature_encoders = joblib.load(os.path.join(model_dir, 'feature_encoders.joblib'))
        target_encoder = joblib.load(os.path.join(model_dir, 'target_encoder.joblib'))
        
        with open(os.path.join(model_dir, 'model_metadata.json'), 'r') as f:
            metadata = json.load(f)
            
        expected_features = metadata['features']
        
        # 4. Prepare DataFrame
        # input_data is a dict like {"Body Frame": "Well Built", ...}
        df_input = pd.DataFrame([input_data])
        
        # Ensure all expected features are present
        for feature in expected_features:
            if feature not in df_input.columns:
                df_input[feature] = "Unknown"  # Fallback if missing, though frontend shouldn't allow this
                
        # Reorder to match training precisely
        df_input = df_input[expected_features]
        
        # 5. Apply Encoders
        df_encoded = pd.DataFrame()
        for col in expected_features:
            le = feature_encoders[col]
            # Handle unseen labels gracefully by mapping to majority class or -1
            # Here we just use standard transform under assumption 
            # frontend exactly matches the training options.
            val = df_input[col].iloc[0]
            if val in le.classes_:
                encoded_val = le.transform([val])[0]
            else:
                # Fallback to the first class if unknown string received
                encoded_val = le.transform([le.classes_[0]])[0] 
                
            df_encoded[col] = [encoded_val]

        # 6. Predict Using XGBoost (Primary Engine)
        xgb_probs = xgb_model.predict_proba(df_encoded)[0]
        rf_probs = rf_model.predict_proba(df_encoded)[0]
        
        # 7. Format Output
        classes = target_encoder.classes_
        
        # Build scores mapping
        xgb_scores = {classes[i].lower(): round(prob * 100) for i, prob in enumerate(xgb_probs)}
        rf_scores = {classes[i].lower(): round(prob * 100) for i, prob in enumerate(rf_probs)}
        
        # Use XGBoost as the authoritative decision
        primary_idx = xgb_probs.argmax()
        primary_dosha = classes[primary_idx].lower()
        
        # Determine secondary dosha
        sorted_indices = xgb_probs.argsort()[::-1]
        secondary_idx = sorted_indices[1]
        secondary_dosha = classes[secondary_idx].lower()
        
        # Constitution string
        primary_pct = xgb_scores[primary_dosha]
        secondary_pct = xgb_scores[secondary_dosha]
        
        if primary_pct >= 60:
            constitution = f"Single Dosha ({primary_dosha.capitalize()})"
        elif primary_pct >= 40 and secondary_pct >= 30:
            constitution = f"Dual Dosha ({primary_dosha.capitalize()}-{secondary_dosha.capitalize()})"
        else:
            constitution = "Tri-Dosha (Balanced)"

        result = {
            "success": True,
            "engine": "XGBoost",
            "scores": xgb_scores,
            "primary": primary_dosha,
            "secondary": secondary_dosha,
            "constitutionType": constitution,
            "confidence": primary_pct,
            "comparative_rf_scores": rf_scores
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No input data provided"}))
        sys.exit(1)
        
    input_str = sys.argv[1]
    predict_dosha(input_str)
