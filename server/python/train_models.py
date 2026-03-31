import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import json

def train_and_evaluate_models():
    # Set up paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, '../../datasets/ayurvedic_dosha_dataset (1).csv')
    model_dir = os.path.join(base_dir, 'models')
    
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    print(f"Loading dataset from: {csv_path}")
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"Error: Could not find dataset at {csv_path}")
        return

    # Clean column names and string values
    df.columns = df.columns.str.strip()
    df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)

    # Automatically identify feature columns vs target
    # We assume 'Dosha' is the target. All other columns are features.
    target_col = 'Dosha'
    if target_col not in df.columns:
        print(f"Error: '{target_col}' column not found in dataset. Available columns: {df.columns.tolist()}")
        return

    feature_cols = [col for col in df.columns if col != target_col]
    
    X = df[feature_cols]
    y = df[target_col]

    print(f"Total records: {len(df)}")
    print(f"Features ({len(feature_cols)}): {feature_cols}")
    
    # 1. Encode Features
    feature_encoders = {}
    X_encoded = pd.DataFrame()
    
    for col in feature_cols:
        le = LabelEncoder()
        # Convert to string to handle mixed types/NaNs robustly
        X_encoded[col] = le.fit_transform(X[col].astype(str))
        feature_encoders[col] = le

    # 2. Encode Target
    target_le = LabelEncoder()
    y_encoded = target_le.fit_transform(y.astype(str))

    # 3. Train/Test Split (80% training, 20% testing)
    X_train, X_test, y_train, y_test = train_test_split(X_encoded, y_encoded, test_size=0.2, random_state=42)

    # ---------------------------------------------------------
    # MODEL 1: Random Forest
    # ---------------------------------------------------------
    print("\n--- Training Random Forest Classifier ---")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    rf_accuracy = accuracy_score(y_test, rf_preds)
    print(f"Random Forest Accuracy: {rf_accuracy:.4f}")
    
    # Save Random Forest
    joblib.dump(rf_model, os.path.join(model_dir, 'random_forest_model.joblib'))

    # ---------------------------------------------------------
    # MODEL 2: XGBoost
    # ---------------------------------------------------------
    print("\n--- Training XGBoost Classifier ---")
    # XGBoost requires class labels to be integers starting from 0, which LabelEncoder already did.
    xgb_model = XGBClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        objective='multi:softprob',
        random_state=42,
        use_label_encoder=False,
        eval_metric='mlogloss'
    )
    xgb_model.fit(X_train, y_train)
    xgb_preds = xgb_model.predict(X_test)
    xgb_accuracy = accuracy_score(y_test, xgb_preds)
    print(f"XGBoost Accuracy: {xgb_accuracy:.4f}")
    
    # Save XGBoost
    joblib.dump(xgb_model, os.path.join(model_dir, 'xgboost_model.joblib'))


    # ---------------------------------------------------------
    # Save Encoders and Metadata
    # ---------------------------------------------------------
    joblib.dump(feature_encoders, os.path.join(model_dir, 'feature_encoders.joblib'))
    joblib.dump(target_le, os.path.join(model_dir, 'target_encoder.joblib'))
    
    metadata = {
        "features": feature_cols,
        "classes": target_le.classes_.tolist(),
        "performance": {
            "random_forest_accuracy": float(rf_accuracy),
            "xgboost_accuracy": float(xgb_accuracy)
        }
    }
    with open(os.path.join(model_dir, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=4)

    print(f"\n✅ Training Complete. Models and metadata saved to {model_dir}")
    print(f"Classes found: {target_le.classes_.tolist()}")

if __name__ == "__main__":
    train_and_evaluate_models()
