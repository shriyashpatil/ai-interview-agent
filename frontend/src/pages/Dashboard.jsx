import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  BookOpen,
  FileText,
  BarChart3,
  ArrowRight,
  AlertCircle,
  Map,
  Bot,
  Target,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { interviewAPI, roadmapAPI, profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

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
    fetchRoadmapData();
  }, []);

  const fetchRoadmapData = async () => {
    try {
      const profileRes = await profileAPI.get();
      if (profileRes.data) {
        setHasProfile(true);
        if (profileRes.data.hasRoadmap) {
          const roadmapRes = await roadmapAPI.getActive();
          setRoadmap(roadmapRes.data);
        }
      }
    } catch (err) {
      // No profile or roadmap yet — that's fine
    }
  };

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

        {/* Roadmap Banner */}
        {!hasProfile ? (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1 flex items-center space-x-2">
                <Target size={20} />
                <span>Create Your Career Roadmap</span>
              </h2>
              <p className="text-blue-100 text-sm">Tell us about your goals and get a personalised AI-powered roadmap with milestones and WhatsApp reminders.</p>
            </div>
            <Link
              to="/onboarding"
              className="flex-shrink-0 inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : roadmap ? (
          <div className="mb-8 bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Map size={18} className="text-indigo-600" />
                <span>Your Roadmap</span>
              </h2>
              <Link to="/roadmap" className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <p className="text-gray-700 font-semibold mb-3">{roadmap.title}</p>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span className="font-bold text-blue-600">{roadmap.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${roadmap.progressPercent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <CheckCircle size={14} className="text-green-500" />
                <span>{roadmap.milestones?.filter(m => m.status === 'COMPLETED').length || 0}/{roadmap.milestones?.length || 0} milestones</span>
              </span>
              <span className="flex items-center space-x-1">
                <TrendingUp size={14} className="text-blue-500" />
                <span>Target: {roadmap.targetDate ? new Date(roadmap.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</span>
              </span>
            </div>
          </div>
        ) : null}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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

          <Link
            to="/roadmap"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <Map className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Roadmap</h3>
            <p className="text-gray-600 text-sm mb-4">
              Track your career milestones and progress.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-semibold">
              View <ArrowRight size={16} className="ml-2" />
            </div>
          </Link>

          <Link
            to="/coach"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <Bot className="text-purple-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Coach</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get personalised career coaching and advice.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-semibold">
              Chat <ArrowRight size={16} className="ml-2" />
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
