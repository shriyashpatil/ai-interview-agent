import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  BookOpen,
  FileText,
  BarChart3,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { interviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);

  const categories = [
    'SOFTWARE_ENGINEERING',
    'DATA_SCIENCE',
    'PRODUCT_BUSINESS',
    'BEHAVIORAL',
    'SYSTEM_DESIGN',
    'GENERAL',
  ];

  const categoryLabels = {
    SOFTWARE_ENGINEERING: 'Software Engineering',
    DATA_SCIENCE: 'Data Science',
    PRODUCT_BUSINESS: 'Product & Business',
    BEHAVIORAL: 'Behavioral',
    SYSTEM_DESIGN: 'System Design',
    GENERAL: 'General Knowledge',
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await interviewAPI.getSessions();
      setSessions(response.data.slice(0, 5)); // Show last 5 sessions
    } catch (err) {
      setError('Failed to load sessions. Please try again.');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = (interviewType) => {
    setSelectedInterviewType(interviewType);
    setShowCategoryModal(true);
  };

  const startInterview = async (category) => {
    try {
      const response = await interviewAPI.startInterview({
        interviewType: selectedInterviewType,
        category,
      });
      const sessionId = response.data.sessionId;
      // Navigate to interview page - would typically use navigate hook
      window.location.href = `/interview/${sessionId}`;
    } catch (err) {
      setError('Failed to start interview. Please try again.');
      console.error('Error starting interview:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.username}!
          </h1>
          <p className="text-lg text-gray-600">
            Ready to ace your next interview? Let's get started.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <button
            onClick={() => handleStartInterview('MOCK_INTERVIEW')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <MessageSquare className="text-blue-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mock Interview</h3>
            <p className="text-gray-600 text-sm mb-4">
              Practice realistic interview scenarios with AI.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-semibold">
              Start Now <ArrowRight size={16} className="ml-2" />
            </div>
          </button>

          <Link
            to="/questions"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <BookOpen className="text-green-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Question Bank</h3>
            <p className="text-gray-600 text-sm mb-4">
              Explore thousands of interview questions.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-semibold">
              Browse <ArrowRight size={16} className="ml-2" />
            </div>
          </Link>

          <button
            onClick={() => handleStartInterview('QUESTION_PRACTICE')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <FileText className="text-purple-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Question Practice</h3>
            <p className="text-gray-600 text-sm mb-4">
              Practice specific interview questions one by one.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-semibold">
              Start Now <ArrowRight size={16} className="ml-2" />
            </div>
          </button>

          <Link
            to="/resume"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <FileText className="text-orange-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Analysis</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get AI feedback on your resume.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-semibold">
              Analyze <ArrowRight size={16} className="ml-2" />
            </div>
          </Link>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Sessions</h2>
            <Link to="/progress" className="text-blue-600 hover:text-blue-700 font-semibold">
              View All Stats
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto text-gray-400 mb-4" size={40} />
              <p className="text-gray-600">
                No sessions yet. Start your first interview to see your progress here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{session.interviewType}</td>
                      <td className="py-3 px-4 text-gray-700">{session.category}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">{session.score || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            session.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Interview Category</h2>
            <div className="space-y-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    startInterview(category);
                    setShowCategoryModal(false);
                  }}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-600 transition-colors"
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCategoryModal(false)}
              className="w-full mt-6 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
