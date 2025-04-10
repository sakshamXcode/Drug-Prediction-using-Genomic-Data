# Drug Response Prediction from Genomic Data

## 🔬 Project Overview
This project focuses on building an **Artificial Neural Network (ANN)** to predict cancer drug sensitivity (IC50 values) using gene expression and mutation data. The system aids precision medicine by suggesting suitable drugs based on the genomic profile of cancer cells.

## 🧠 Key Technologies
- **Backend:** Python, FastAPI, TensorFlow, Scikit-learn
- **Frontend:** Next.js, Tailwind CSS (React-based form interface)
- **ML Model:** Sequential ANN with Dense & Dropout layers
- **Dataset:** GDSC (Genomics of Drug Sensitivity in Cancer)
- **Visualization:** Matplotlib, Seaborn (for analysis phase)

## 📦 Features
- Upload gene mutation expression data via a web interface
- Automatic computation of mutation interaction features:
  - `mutation_ratio`
  - `mutation_response_ratio`
- Model predicts the most suitable drug based on ANN output (highest softmax probability)
- Displays prediction confidence and top-5 ranked drugs

## 🛠 Architecture
```
Frontend (Next.js) → FastAPI Backend → Preprocessing Pipeline → ANN Model → Predicted Drug Response
```

## ⚙️ Training Pipeline Summary
- **Preprocessing:**
  - One-hot encode categorical features (Feature Name, Target Pathway)
  - Scale numerical features (StandardScaler)
- **Feature Engineering:**
  - Derived interaction features to enhance learning
- **Model Architecture:**
```python
Sequential([
  Dense(256, activation='relu'),
  Dropout(0.3),
  Dense(128, activation='relu'),
  Dropout(0.3),
  Dense(64, activation='relu'),
  Dense(num_classes, activation='softmax')
])
```
- **Loss:** Categorical Crossentropy
- **Optimizer:** Adam (lr=0.001)
- **Evaluation Metrics:** Accuracy, Precision, Recall, F1 Score, ROC-AUC

## ✅ Model Performance
- **Accuracy on Test Data:** ~97.6%
- **Evaluation Tools:** Classification Report, Confusion Matrix, Balanced Accuracy

## 🧪 How to Use
1. Run FastAPI backend:
```bash
uvicorn app:app --reload
```
2. Launch frontend using Next.js:
```bash
cd frontend && npm run dev
```
3. Enter values in the web form → Submit → Get prediction result

## 🔍 Example Input
```json
{
  "target_pathway": "Apoptosis regulation",
  "feature_name": "PHF6_mut",
  "ic50_effect_size": 0.985,
  "feature_pos_ic50_var": 10.98,
  "feature_neg_ic50_var": 1.09,
  "feature_pval": 0.06,
  "tissue_pval": 0.0,
  "msi_pval": 0.1,
  "mutation_response_ratio": 0.65,
  "mutation_ratio": 0.8
}
```

## 👨‍🔬 Team

- Saksham Singh
- Debasmith Mishra
- Jasmin Ray
- Sejal Nath
- Pratik Agarwal

### Guide: Dr. Chittaranjan Pradhan

## 📌 Future Scope
- Use SHAP/LIME for explainability
- Handle class imbalance
- Add real-time genomics API integration
- Support additional omics layers (e.g., methylation, CNVs)

## 📄 License
This project is part of a Bachelor’s degree requirement submitted to **KIIT University** under the School of Computer Engineering.

