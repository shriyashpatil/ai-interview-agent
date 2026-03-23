import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { progressAPI } from '../services/api';

const CATEGORIES = {
  SOFTWARE_ENGINEERING: 'Software Engineering',
  DATA_SCIENCE: 'Data Science',
  PRODUCT_BUSINESS: 'Product & Business',
  BEHAVIORAL: 'Behavioral',
  SYSTEM_DESIGN: 'System Design',
  GENERAL: 'General Knowledge',
};

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, progressResponse] = await Promise.all([
        progressAPI.getStats(),
        progressAPI.getAll(),
      ]);

      setStats(statsResponse.data);

      // Process progress data for chart
      const chartData = progressResponse.data
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((item, idx) => ({
          date: new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          score: item.score || 0,
          timestamp: new Date(item.createdAt).getTime(),
        }));

      setProgressData(chartData);
    } catch (err) {
      setError('Failed to load progress data. Please try again.');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categoryScores = stats?.categoryScores || {};
  const categoryChartData = Object.entries(categoryScores).map(([category, score]) => ({
    name: CATEGORIES[category] || category,
    score: score || 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-lg text-gray-600">
            Track your improvement and see your interview preparation journey.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Sessions</p>
              <p className="text-4xl font-bold text-blue-600">{stats.totalSessions || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Questions Attempted</p>
              <p className="text-4xl font-bold text-green-600">{stats.totalQuestionsAttempted || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Average Score</p>
              <p className="text-4xl font-bold text-purple-600">
                {stats.averageScore ? stats.averageScore.toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Improvement</p>
              <p className="text-4xl font-bold text-orange-600 flex items-center">
                <TrendingUp className="mr-2" size={28} />
                {progressData.length > 1
                  ? (progressData[progressData.length - 1].score - progressData[0].score).toFixed(1)
                  : 0}
              </p>
            </div>
          </div>
        )}

        {/* Score Trend Chart */}
        {progressData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Score Trend</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Interview Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Performance */}
        {categoryChartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Performance</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="score" fill="#10b981" name="Average Score" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Empty State */}
        {!stats || stats.totalSessions === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Progress Data Yet</h3>
            <p className="text-gray-600 mb-6">
              Start your first interview to see your progress and performance metrics here.
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
