import React, { useState } from 'react';
import FoodItemCard from './components/FoodItemCard';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      setError("");
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setAnalysisResult(null);
    setError("");
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const res = await fetch('https://food-calorie-estimator-xi58.onrender.com/analyze', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Analysis failed");
      }
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Food Calorie & Nutrition Estimator</h1>
      </header>
      
      <div className="upload-section">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="Food preview" />
          </div>
        )}
        <button onClick={handleAnalyze} disabled={!selectedFile || loading}>
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </div>

      {loading && (
        <div className="loading">Processing image, please wait...</div>
      )}

      {error && (
        <div className="error">{error}</div>
      )}

{analysisResult && !loading && (
  <div className="results">
    <h2>Analysis Results:</h2>
    {/* results-layout for side-by-side on wide screens */}
    <div className="results-layout">
      <div className="image-preview">
        <img src={previewUrl} alt="Analyzed food" />
      </div>
      <div className="food-list">
        {analysisResult.items.map((item, index) => (
          <FoodItemCard key={index} item={item} />
        ))}
      </div>
    </div>
    <div className="summary">
      <div><strong>Total Calories:</strong> {analysisResult.summary.total_calories.toFixed(0)} kcal</div>
      <div><strong>Total Protein:</strong> {analysisResult.summary.total_protein.toFixed(1)} g</div>
      <div><strong>Total Carbs:</strong> {analysisResult.summary.total_carbs.toFixed(1)} g</div>
      <div><strong>Total Fat:</strong> {analysisResult.summary.total_fat.toFixed(1)} g</div>
    </div>
  </div>
)}
    </div>
  );
}

export default App;
