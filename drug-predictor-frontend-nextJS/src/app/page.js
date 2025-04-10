'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [formData, setFormData] = useState({
    target_pathway: '',
    feature_name: '',
    ic50_effect_size: '',
    feature_pos_ic50_var: '',
    feature_neg_ic50_var: '',
    feature_pval: '',
    tissue_pval: '',
    msi_pval: '',
    n_feature_pos: '',
    n_feature_neg: '',
    log_ic50_mean_pos: '',
    log_ic50_mean_neg: '',
    mutation_response_ratio: '',
    mutation_ratio: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictionDone, setPredictionDone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    const nPos = parseFloat(updatedFormData.n_feature_pos);
    const nNeg = parseFloat(updatedFormData.n_feature_neg);
    const logPos = parseFloat(updatedFormData.log_ic50_mean_pos);
    const logNeg = parseFloat(updatedFormData.log_ic50_mean_neg);

    if (!isNaN(nPos) && !isNaN(nNeg) && (nPos + nNeg) > 0) {
      updatedFormData.mutation_ratio = (nPos / (nPos + nNeg)).toString();
    }

    if (!isNaN(logPos) && !isNaN(logNeg)) {
      updatedFormData.mutation_response_ratio = (logPos / (logNeg + 1e-6)).toString();
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setPredictionDone(false);

    const requestData = {
      target_pathway: formData.target_pathway,
      feature_name: formData.feature_name,
      ic50_effect_size: Number(formData.ic50_effect_size),
      feature_pos_ic50_var: Number(formData.feature_pos_ic50_var),
      feature_neg_ic50_var: Number(formData.feature_neg_ic50_var),
      feature_pval: Number(formData.feature_pval),
      tissue_pval: Number(formData.tissue_pval),
      msi_pval: Number(formData.msi_pval),
      mutation_response_ratio: Number(formData.mutation_response_ratio),
      mutation_ratio: Number(formData.mutation_ratio)
    };

    try {
      const response = await axios.post('http://localhost:8000/predict/', requestData);
      setResult(response.data);
      setPredictionDone(true);
    } catch (error) {
      console.error(error);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 md:px-8 py-10 flex items-center justify-center" style={{ backgroundColor: '#f5f5dc' }}>
      <div className="w-full max-w-6xl">
        <div className="border border-gray-700 shadow-2xl rounded-3xl p-6 sm:p-8 md:p-12 mx-auto bg-gray-900 transition duration-300 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10 sm:mb-12">
            <img
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2R1OXdjaGFvNDRjc2FsemFtZ2dubDFqcjgwN243bnhmeWZqaWx1biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/sCqnpiUFN228E/200.webp"
              alt="cancer gif"
              className="w-16 h-16 object-cover rounded-full shadow-md"
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-center tracking-tight">
             Drug Response Prediction App
            </h1>
          </div>

          <div className="p-4 sm:p-6 md:p-10 rounded-3xl bg-gray-800 transition-colors duration-300">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize tracking-wide text-gray-200">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={value}
                    onChange={handleChange}
                    disabled={key === 'mutation_ratio' || key === 'mutation_response_ratio'}
                    className={`w-full border ${
                      key === 'mutation_ratio' || key === 'mutation_response_ratio'
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gray-900 text-white'
                    } border-gray-500 rounded-xl px-4 py-2 hover:ring-1 hover:ring-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-sm sm:text-base`}
                    placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                    required={
                      !['mutation_ratio', 'mutation_response_ratio'].includes(key)
                    }
                  />
                </div>
              ))}

              <div className="sm:col-span-2 text-center mt-4">
                <button
                  type="submit"
                  className={`cursor-pointer ${
                    predictionDone
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  } text-white font-semibold py-2 px-6 sm:px-8 rounded-xl shadow-md hover:shadow-lg transition duration-200`}
                >
                  {loading
                    ? 'Predicting...'
                    : predictionDone
                    ? 'Drug Predicted'
                    : 'Predict Drug'}
                </button>
              </div>
            </form>
          </div>

          {predictionDone && result && (
            <div className="mt-10 sm:mt-12 border-t pt-6 sm:pt-8 border-gray-600">
              <h2 className="text-xl sm:text-2xl font-semibold text-green-400 mb-4">Prediction Result</h2>
              <div className="text-sm sm:text-base space-y-3 font-mono text-gray-300">
                <p><strong>🎯 Predicted Drug:</strong> {result.predicted_drug}</p>
                <p><strong>📊 Confidence:</strong> {(result.confidence * 100).toFixed(6)}%</p>
                {result.top_predictions?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mt-4 mb-2">📌 Top Predictions:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {result.top_predictions.map((item, idx) => (
                        <li key={idx} className="hover:text-blue-400 transition-colors duration-150">
                          {item.drug} - {(item.Confidence* 100).toFixed(6)}% 
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}




