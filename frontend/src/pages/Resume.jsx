import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { resumeAPI } from '../services/api';

export default function Resume() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
        setError('Please upload a PDF or Word document.');
        return;
      }
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await resumeAPI.analyze(file);
      setResult(response.data);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Error analyzing resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume Analysis</h1>
          <p className="text-lg text-gray-600">
            Upload your resume and get AI-powered feedback to improve it.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!result ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Upload Area */}
            <div className="mb-8">
              <label className="block text-center border-2 border-dashed border-blue-300 rounded-lg p-12 cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <Upload className="mx-auto text-blue-600 mb-4" size={48} />
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  {file ? file.name : 'Drop your resume here'}
                </p>
                <p className="text-sm text-gray-600">
                  or click to select a file
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: PDF, DOC, DOCX (Max 5MB)
                </p>
              </label>
            </div>

            {file && (
              <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-gray-900">Selected file:</p>
                <p className="text-blue-600">{file.name}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </button>
              {file && (
                <button
                  onClick={() => setFile(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Assessment */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Overall Assessment</h2>
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {result.overallAssessment}
              </p>
            </div>

            {/* Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="text-green-600 mr-2" size={24} />
                  Strengths
                </h3>
                <ul className="space-y-3">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {result.weaknesses && result.weaknesses.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="text-yellow-600 mr-2" size={24} />
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {result.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Improvements */}
            {result.suggestedImprovements && result.suggestedImprovements.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Suggested Improvements</h3>
                <ol className="space-y-3 list-decimal list-inside">
                  {result.suggestedImprovements.map((improvement, idx) => (
                    <li key={idx} className="text-gray-700">
                      {improvement}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Likely Interview Questions */}
            {result.likelyInterviewQuestions && result.likelyInterviewQuestions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Likely Interview Questions
                </h3>
                <div className="space-y-4">
                  {result.likelyInterviewQuestions.map((question, idx) => (
                    <div key={idx} className="border-l-4 border-blue-600 pl-4 py-2">
                      <p className="text-gray-700 font-medium">{idx + 1}. {question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role Recommendation */}
            {result.roleRecommendation && (
              <div className="bg-blue-50 rounded-lg shadow-md p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Roles</h3>
                <p className="text-gray-700 text-lg">{result.roleRecommendation}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
