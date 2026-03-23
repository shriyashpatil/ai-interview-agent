import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, Lightbulb } from 'lucide-react';
import { questionsAPI } from '../services/api';

const CATEGORIES = {
  SOFTWARE_ENGINEERING: 'Software Engineering',
  DATA_SCIENCE: 'Data Science',
  PRODUCT_BUSINESS: 'Product & Business',
  BEHAVIORAL: 'Behavioral',
  SYSTEM_DESIGN: 'System Design',
  GENERAL: 'General Knowledge',
};

const DIFFICULTIES = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

const DIFFICULTY_COLORS = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
};

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [hints, setHints] = useState({});
  const [loadingHints, setLoadingHints] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await questionsAPI.getAll();
      setQuestions(response.data);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHint = async (questionId) => {
    if (hints[questionId]) return;

    setLoadingHints((prev) => ({ ...prev, [questionId]: true }));
    try {
      const response = await questionsAPI.getHint(questionId);
      setHints((prev) => ({ ...prev, [questionId]: response.data.hint }));
    } catch (err) {
      console.error('Error fetching hint:', err);
    } finally {
      setLoadingHints((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleHintClick = (questionId) => {
    fetchHint(questionId);
  };

  const filteredQuestions = questions.filter((q) => {
    const categoryMatch = !selectedCategory || q.category === selectedCategory;
    const difficultyMatch = !selectedDifficulty || q.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Question Bank</h1>
          <p className="text-lg text-gray-600">
            Practice with thousands of interview questions across all categories.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                {Object.entries(DIFFICULTIES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">
              No questions found matching your filters. Try adjusting your selection.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Showing {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
            </div>
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => toggleQuestion(question.id)}
                  className="w-full text-left px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {question.title}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        DIFFICULTY_COLORS[question.difficulty] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {DIFFICULTIES[question.difficulty]}
                      </span>
                      <span className="text-sm text-gray-600">
                        {CATEGORIES[question.category]}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`text-gray-400 flex-shrink-0 transition-transform ${
                      expandedQuestions.has(question.id) ? 'rotate-180' : ''
                    }`}
                    size={20}
                  />
                </button>

                {expandedQuestions.has(question.id) && (
                  <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700">{question.description}</p>
                    </div>

                    {question.examples && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Examples</h4>
                        <div className="bg-white rounded p-3 font-mono text-sm text-gray-700">
                          {question.examples}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleHintClick(question.id)}
                        disabled={loadingHints[question.id]}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
                      >
                        <Lightbulb size={18} />
                        <span>
                          {loadingHints[question.id] ? 'Loading...' : 'Get Hint'}
                        </span>
                      </button>
                    </div>

                    {hints[question.id] && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h5 className="font-semibold text-gray-900 mb-2">Hint</h5>
                        <p className="text-gray-700">{hints[question.id]}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
