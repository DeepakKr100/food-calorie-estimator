import React, { useState } from 'react';
import FoodItemCard from './components/FoodItemCard';
import './App.css';  // includes Tailwind base and utilities

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
      // Create a local URL for image preview
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
      const res = await fetch('http://localhost:5000/analyze', {
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
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Food Calorie & Nutrition Estimator</h1>
      {/* Upload Section */}
      <div className="w-full max-w-xl flex flex-col items-center border-2 border-dashed border-gray-300 p-6 rounded-lg bg-white">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="mb-3"
        />
        {previewUrl && (
          <img src={previewUrl} alt="Food preview" className="max-w-full max-h-64 object-contain mb-3"/>
        )}
        <button 
          onClick={handleAnalyze} 
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-500 disabled:bg-gray-300"
          disabled={!selectedFile || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-4 text-blue-600">Processing image, please wait...</div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 text-red-500 font-semibold">{error}</div>
      )}

      {/* Results Section */}
      {analysisResult && !loading && (
        <div className="w-full max-w-4xl mt-6">
          <h2 className="text-xl font-bold mb-4">Analysis Results:</h2>
          <div className="flex flex-col md:flex-row md:space-x-8">
            {/* Image on left (for larger screens) */}
            <div className="md:w-1/2 mb-4 md:mb-0">
              <img src={previewUrl} alt="Analyzed food" className="rounded-lg shadow-sm max-w-full"/>
            </div>
            {/* Nutritional info on right */}
            <div className="md:w-1/2">
              {analysisResult.items.map((item, index) => (
                <FoodItemCard key={index} item={item} />
              ))}
              {/* Totals */}
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <div className="font-semibold">Total for this meal:</div>
                <div>Calories: <b>{analysisResult.summary.total_calories.toFixed(0)}</b> kcal</div>
                <div>Protein: <b>{analysisResult.summary.total_protein.toFixed(1)}</b> g</div>
                <div>Carbs: <b>{analysisResult.summary.total_carbs.toFixed(1)}</b> g</div>
                <div>Fat: <b>{analysisResult.summary.total_fat.toFixed(1)}</b> g</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
