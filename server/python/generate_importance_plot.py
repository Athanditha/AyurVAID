import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def generate_plot():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base_dir, 'models', 'catboost')
    figures_dir = os.path.abspath(os.path.join(base_dir, '..', '..', 'Final Thesis', 'My Thesis', 'Figures'))
    
    if not os.path.exists(figures_dir):
        os.makedirs(figures_dir)
        
    # Load model and metadata
    model = joblib.load(os.path.join(model_dir, 'model.joblib'))
    
    # Get feature importances
    importances = model.get_feature_importance()
    feature_names = model.feature_names_
    
    # Create DataFrame
    df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
    df = df.sort_values(by='Importance', ascending=False).head(15) # Top 15
    
    # Plot
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Importance', y='Feature', data=df, palette='viridis')
    plt.title('Top 15 Feature Importances (CatBoost)')
    plt.xlabel('Importance Score')
    plt.ylabel('Feature')
    plt.tight_layout()
    
    # Save
    save_path = os.path.join(figures_dir, 'feature_importance.png')
    plt.savefig(save_path, dpi=300)
    print(f"Saved to {save_path}")

if __name__ == "__main__":
    generate_plot()
