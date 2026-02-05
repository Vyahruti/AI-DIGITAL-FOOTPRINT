"""
Script to train ML model for privacy risk classification
Run this after collecting sufficient training data
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings


def load_training_data():
    """Load training data from CSV or generate synthetic data"""
    
    # Check if training data exists
    if os.path.exists('data/training_data.csv'):
        df = pd.read_csv('data/training_data.csv')
        return df
    
    # Generate synthetic training data for demonstration
    print("⚠️  No training data found. Generating synthetic data...")
    
    np.random.seed(42)
    n_samples = 500
    
    data = []
    for _ in range(n_samples):
        # Generate random features
        num_emails = np.random.randint(0, 4)
        num_phones = np.random.randint(0, 3)
        num_locations = np.random.randint(0, 6)
        num_persons = np.random.randint(0, 4)
        num_organizations = np.random.randint(0, 3)
        num_dates = np.random.randint(0, 5)
        text_length = np.random.randint(50, 1000)
        total_entities = num_emails + num_phones + num_locations + num_persons + num_organizations + num_dates
        entity_density = total_entities / text_length if text_length > 0 else 0
        sensitive_keywords = np.random.randint(0, 6)
        
        # Calculate risk level based on rules
        risk_score = (
            num_emails * 0.15 +
            num_phones * 0.15 +
            num_locations * 0.10 +
            num_persons * 0.12 +
            num_organizations * 0.08 +
            entity_density * 0.20 +
            sensitive_keywords * 0.15
        )
        
        if risk_score < 0.3:
            label = 0  # LOW
        elif risk_score < 0.6:
            label = 1  # MEDIUM
        else:
            label = 2  # HIGH
        
        data.append([
            num_emails, num_phones, num_locations, num_persons,
            num_organizations, num_dates, text_length, entity_density,
            sensitive_keywords, label
        ])
    
    df = pd.DataFrame(data, columns=[
        'num_emails', 'num_phones', 'num_locations', 'num_persons',
        'num_organizations', 'num_dates', 'text_length', 'entity_density',
        'sensitive_keywords', 'label'
    ])
    
    # Save synthetic data
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/training_data.csv', index=False)
    
    return df


def train_models(X_train, X_test, y_train, y_test):
    """Train both Logistic Regression and Random Forest models"""
    
    results = {}
    
    # 1. Logistic Regression (Baseline)
    print("\n📊 Training Logistic Regression (Baseline)...")
    lr_model = LogisticRegression(random_state=42, max_iter=1000)
    lr_model.fit(X_train, y_train)
    lr_pred = lr_model.predict(X_test)
    lr_accuracy = accuracy_score(y_test, lr_pred)
    
    print(f"✅ Logistic Regression Accuracy: {lr_accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, lr_pred, target_names=['LOW', 'MEDIUM', 'HIGH']))
    
    results['logistic_regression'] = {
        'model': lr_model,
        'accuracy': lr_accuracy,
        'predictions': lr_pred
    }
    
    # 2. Random Forest (Final Model)
    print("\n📊 Training Random Forest (Final Model)...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    )
    rf_model.fit(X_train, y_train)
    rf_pred = rf_model.predict(X_test)
    rf_accuracy = accuracy_score(y_test, rf_pred)
    
    print(f"✅ Random Forest Accuracy: {rf_accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, rf_pred, target_names=['LOW', 'MEDIUM', 'HIGH']))
    
    # Feature importance
    feature_names = [
        'num_emails', 'num_phones', 'num_locations', 'num_persons',
        'num_organizations', 'num_dates', 'text_length', 'entity_density',
        'sensitive_keywords'
    ]
    
    print("\n📊 Feature Importance (Random Forest):")
    for name, importance in zip(feature_names, rf_model.feature_importances_):
        print(f"  {name}: {importance:.4f}")
    
    results['random_forest'] = {
        'model': rf_model,
        'accuracy': rf_accuracy,
        'predictions': rf_pred,
        'feature_importance': dict(zip(feature_names, rf_model.feature_importances_))
    }
    
    return results


def save_models(scaler, best_model, model_name='random_forest'):
    """Save trained model and scaler"""
    
    os.makedirs('app/ml/models', exist_ok=True)
    
    model_path = 'app/ml/models/risk_classifier.pkl'
    scaler_path = 'app/ml/models/vectorizer.pkl'
    
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"\n✅ Model saved to {model_path}")
    print(f"✅ Scaler saved to {scaler_path}")


def main():
    """Main training pipeline"""
    
    print("🚀 Starting ML Model Training Pipeline\n")
    
    # 1. Load data
    print("📂 Loading training data...")
    df = load_training_data()
    print(f"✅ Loaded {len(df)} samples")
    print(f"   Class distribution:")
    print(f"   LOW: {(df['label'] == 0).sum()}")
    print(f"   MEDIUM: {(df['label'] == 1).sum()}")
    print(f"   HIGH: {(df['label'] == 2).sum()}")
    
    # 2. Prepare features
    X = df.drop('label', axis=1).values
    y = df['label'].values
    
    # 3. Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n✅ Train set: {len(X_train)} samples")
    print(f"✅ Test set: {len(X_test)} samples")
    
    # 4. Scale features
    print("\n🔧 Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 5. Train models
    results = train_models(X_train_scaled, X_test_scaled, y_train, y_test)
    
    # 6. Select best model
    lr_acc = results['logistic_regression']['accuracy']
    rf_acc = results['random_forest']['accuracy']
    
    print("\n" + "="*50)
    print("📊 MODEL COMPARISON")
    print("="*50)
    print(f"Logistic Regression: {lr_acc:.4f}")
    print(f"Random Forest:       {rf_acc:.4f}")
    
    best_model_name = 'random_forest' if rf_acc >= lr_acc else 'logistic_regression'
    best_model = results[best_model_name]['model']
    
    print(f"\n✅ Best Model: {best_model_name.upper()} ({results[best_model_name]['accuracy']:.4f})")
    
    # 7. Save models
    save_models(scaler, best_model, best_model_name)
    
    # 8. Confusion Matrix
    print("\n📊 Confusion Matrix (Test Set):")
    y_pred = results[best_model_name]['predictions']
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    print("\n✅ Training complete! Model is ready to use.")
    print("   Restart the backend server to load the new model.")


if __name__ == "__main__":
    main()
