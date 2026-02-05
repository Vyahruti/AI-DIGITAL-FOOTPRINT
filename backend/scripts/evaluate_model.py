"""
Model Evaluation Script
Generate comprehensive metrics and visualizations
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report, confusion_matrix, 
    accuracy_score, precision_recall_fscore_support,
    roc_curve, auc
)
import joblib
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def load_model_and_data():
    """Load trained model and test data"""
    
    model_path = 'app/ml/models/risk_classifier.pkl'
    scaler_path = 'app/ml/models/vectorizer.pkl'
    data_path = 'data/training_data.csv'
    
    if not os.path.exists(model_path):
        print("❌ No trained model found. Run train_model.py first.")
        return None, None, None, None
    
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    
    df = pd.read_csv(data_path)
    X = df.drop('label', axis=1).values
    y = df['label'].values
    
    X_scaled = scaler.transform(X)
    
    return model, scaler, X_scaled, y


def generate_metrics_report(model, X, y):
    """Generate comprehensive metrics report"""
    
    y_pred = model.predict(X)
    y_proba = model.predict_proba(X)
    
    print("="*60)
    print("MODEL EVALUATION REPORT")
    print("="*60)
    
    # Overall Accuracy
    accuracy = accuracy_score(y, y_pred)
    print(f"\n📊 Overall Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Per-class metrics
    precision, recall, f1, support = precision_recall_fscore_support(y, y_pred)
    
    print("\n📈 Per-Class Metrics:")
    print("-"*60)
    classes = ['LOW', 'MEDIUM', 'HIGH']
    for i, cls in enumerate(classes):
        print(f"{cls}:")
        print(f"  Precision: {precision[i]:.4f}")
        print(f"  Recall:    {recall[i]:.4f}")
        print(f"  F1-Score:  {f1[i]:.4f}")
        print(f"  Support:   {support[i]}")
    
    # Classification Report
    print("\n📋 Full Classification Report:")
    print(classification_report(y, y_pred, target_names=classes))
    
    # Confusion Matrix
    print("\n🔢 Confusion Matrix:")
    cm = confusion_matrix(y, y_pred)
    print(cm)
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'confusion_matrix': cm,
        'y_pred': y_pred,
        'y_proba': y_proba
    }


def plot_confusion_matrix(cm, save_path='results/confusion_matrix.png'):
    """Plot confusion matrix heatmap"""
    
    os.makedirs('results', exist_ok=True)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues',
        xticklabels=['LOW', 'MEDIUM', 'HIGH'],
        yticklabels=['LOW', 'MEDIUM', 'HIGH']
    )
    plt.title('Confusion Matrix - Privacy Risk Classification')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"✅ Confusion matrix saved to {save_path}")
    plt.close()


def plot_feature_importance(model, save_path='results/feature_importance.png'):
    """Plot feature importance"""
    
    if not hasattr(model, 'feature_importances_'):
        print("⚠️  Model does not support feature importance")
        return
    
    feature_names = [
        'Emails', 'Phones', 'Locations', 'Persons',
        'Organizations', 'Dates', 'Text Length', 
        'Entity Density', 'Sensitive Keywords'
    ]
    
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    plt.figure(figsize=(10, 6))
    plt.bar(range(len(importances)), importances[indices])
    plt.xticks(range(len(importances)), [feature_names[i] for i in indices], rotation=45, ha='right')
    plt.title('Feature Importance - Random Forest Model')
    plt.ylabel('Importance Score')
    plt.xlabel('Features')
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"✅ Feature importance plot saved to {save_path}")
    plt.close()


def generate_latex_table(metrics):
    """Generate LaTeX table for academic report"""
    
    latex = """
\\begin{table}[h]
\\centering
\\caption{Privacy Risk Classification Results}
\\begin{tabular}{|l|c|c|c|}
\\hline
\\textbf{Class} & \\textbf{Precision} & \\textbf{Recall} & \\textbf{F1-Score} \\\\
\\hline
"""
    
    classes = ['LOW', 'MEDIUM', 'HIGH']
    for i, cls in enumerate(classes):
        latex += f"{cls} & {metrics['precision'][i]:.3f} & {metrics['recall'][i]:.3f} & {metrics['f1'][i]:.3f} \\\\\n"
    
    latex += f"""\\hline
\\textbf{{Overall Accuracy}} & \\multicolumn{{3}}{{c|}}{{{metrics['accuracy']:.3f}}} \\\\
\\hline
\\end{{tabular}}
\\end{{table}}
"""
    
    # Save to file
    os.makedirs('results', exist_ok=True)
    with open('results/metrics_table.tex', 'w') as f:
        f.write(latex)
    
    print("✅ LaTeX table saved to results/metrics_table.tex")


def main():
    """Run full evaluation"""
    
    print("🚀 Starting Model Evaluation\n")
    
    # Load model and data
    model, scaler, X, y = load_model_and_data()
    
    if model is None:
        return
    
    # Generate metrics
    metrics = generate_metrics_report(model, X, y)
    
    # Generate visualizations
    print("\n📊 Generating visualizations...")
    plot_confusion_matrix(metrics['confusion_matrix'])
    plot_feature_importance(model)
    
    # Generate LaTeX table
    print("\n📄 Generating LaTeX table...")
    generate_latex_table(metrics)
    
    print("\n✅ Evaluation complete! Check 'results/' folder for outputs.")


if __name__ == "__main__":
    main()
