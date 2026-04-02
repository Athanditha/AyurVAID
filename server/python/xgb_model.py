import sys
import json
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

def get_paths():
    """Returns absolute paths for the dataset and where the models should be saved."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Path to the dataset
    csv_path = os.path.join(base_dir, '../../datasets/ayurvedic_dosha_dataset (1).csv')
    # Path to the directory where this specific model's artifacts will be saved
    model_dir = os.path.join(base_dir, 'models', 'xgb')
    return base_dir, csv_path, model_dir

def train():
    """Trains the XGBoost model and saves it to a file."""
    base_dir, csv_path, model_dir = get_paths()
    
    # Create the model directory if it doesn't already exist
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    print(f"Loading dataset from: {csv_path}")
    try:
        # Load the CSV data into a pandas DataFrame
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"Error: Could not find dataset at {csv_path}")
        return

    # Clean the dataset: remove leading and trailing white spaces from column names and string values
    df.columns = df.columns.str.strip()
    df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)

    # Identifies the target column (the data we want to predict)
    target_col = 'Dosha'
    if target_col not in df.columns:
        print(f"Error: '{target_col}' column not found in dataset. Available columns: {df.columns.tolist()}")
        return

    # Separate the target column from the input features
    feature_cols = [col for col in df.columns if col != target_col]
    X = df[feature_cols]
    y = df[target_col]

    # Initialize a dictionary to keep track of encoders mapping text -> numbers
    feature_encoders = {}
    X_encoded = pd.DataFrame()
    
    # Machine Learning models require numbers, not strings. 
    # Use LabelEncoder to convert each textual feature into a numerical representation.
    for col in feature_cols:
        le = LabelEncoder()
        X_encoded[col] = le.fit_transform(X[col].astype(str))
        feature_encoders[col] = le

    # Encode the target labels (e.g. Vata, Pitta, Kapha -> 0, 1, 2)
    target_le = LabelEncoder()
    y_encoded = target_le.fit_transform(y.astype(str))

    # Split dataset into training set (80%) and test set (20%)
    X_train, X_test, y_train, y_test = train_test_split(X_encoded, y_encoded, test_size=0.2, random_state=42)

    print("\n--- Training XGBoost Classifier ---")
    # Initialize the XGBoost model which learns sequentially from its mistakes
    model = XGBClassifier(
        n_estimators=100,       # Number of gradient boosted trees
        learning_rate=0.1,      # Step size taken to correct errors per tree
        max_depth=5,            # Max depth per tree
        objective='multi:softprob', # Multi-class classification returning probabilities
        random_state=42,
        use_label_encoder=False,
        eval_metric='mlogloss'
    )
    # Train the model on the training data
    model.fit(X_train, y_train)
    
    # Test the model on the testing data to see how well it learned
    preds = model.predict(X_test)
    accuracy = accuracy_score(y_test, preds)
    print(f"XGBoost Accuracy: {accuracy:.4f}")
    
    # Save the trained model and the encoders to files so we can load them later for inference
    joblib.dump(model, os.path.join(model_dir, 'model.joblib'))
    joblib.dump(feature_encoders, os.path.join(model_dir, 'feature_encoders.joblib'))
    joblib.dump(target_le, os.path.join(model_dir, 'target_encoder.joblib'))
    
    # Save metadata like the expected columns so the frontend knows what to pass
    metadata = {
        "features": feature_cols,
        "classes": target_le.classes_.tolist(),
        "performance": {
            "accuracy": float(accuracy)
        }
    }
    with open(os.path.join(model_dir, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=4)

    print(f"\n✅ Training Complete. Models and metadata saved to {model_dir}")

def predict(input_data_json):
    """Predicts a patient's Dosha given JSON input representing their traits."""
    try:
        # 1. Parse Input from JSON string to dictionary
        input_data = json.loads(input_data_json)
        base_dir, csv_path, model_dir = get_paths()
        
        # 2. Load the trained model and artifacts from disk
        model = joblib.load(os.path.join(model_dir, 'model.joblib'))
        feature_encoders = joblib.load(os.path.join(model_dir, 'feature_encoders.joblib'))
        target_encoder = joblib.load(os.path.join(model_dir, 'target_encoder.joblib'))
        
        # 3. Load metadata to know exactly what features the model expects
        with open(os.path.join(model_dir, 'model_metadata.json'), 'r') as f:
            metadata = json.load(f)
            
        expected_features = metadata['features']
        
        # 4. Prepare data: convert dictionary to pandas DataFrame
        df_input = pd.DataFrame([input_data])
        
        # Ensure all expected features are present (fallback to "Unknown" if missing)
        for feature in expected_features:
            if feature not in df_input.columns:
                df_input[feature] = "Unknown"
                
        # Reorder features exactly as the model expects them
        df_input = df_input[expected_features]
        df_encoded = pd.DataFrame()
        
        # 5. Apply the identical numerical encoders we used during training
        for col in expected_features:
            le = feature_encoders[col]
            val = df_input[col].iloc[0]
            if val in le.classes_:
                encoded_val = le.transform([val])[0]
            else:
                # Fallback to the first available class if an unrecognized string comes in
                encoded_val = le.transform([le.classes_[0]])[0] 
            df_encoded[col] = [encoded_val]

        # 6. Make prediction (returns probabilities for each Dosha)
        probs = model.predict_proba(df_encoded)[0]
        classes = target_encoder.classes_
        
        # Calculate scores out of 100 for each dosha
        scores = {classes[i].lower(): round(prob * 100) for i, prob in enumerate(probs)}
        
        # Identify Primary dosha
        primary_idx = probs.argmax()
        primary_dosha = classes[primary_idx].lower()
        
        # Identify Secondary dosha
        sorted_indices = probs.argsort()[::-1]
        secondary_idx = sorted_indices[1]
        secondary_dosha = classes[secondary_idx].lower()
        
        # Formulate Constitution logic
        primary_pct = scores[primary_dosha]
        secondary_pct = scores[secondary_dosha]
        
        if primary_pct >= 60:
            constitution = f"Single Dosha ({primary_dosha.capitalize()})"
        elif primary_pct >= 40 and secondary_pct >= 30:
            constitution = f"Dual Dosha ({primary_dosha.capitalize()}-{secondary_dosha.capitalize()})"
        else:
            constitution = "Tri-Dosha (Balanced)"

        # 7. Print the results to standard output so Node.js can read them
        result = {
            "success": True,
            "engine": "XGBoost", # Marks this engine
            "scores": scores,
            "primary": primary_dosha,
            "secondary": secondary_dosha,
            "constitutionType": constitution,
            "confidence": primary_pct
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    import warnings
    warnings.filterwarnings('ignore') # Hides unnecessary warnings from terminal output
    
    # If the script is run without arguments, trigger training.
    # If run with JSON arguments, trigger prediction.
    if len(sys.argv) < 2:
        train()
    else:
        predict(sys.argv[1])
