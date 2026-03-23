import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  BookOpen,
  FileText,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: MessageSquare,
      title: 'Mock Interviews',
      description:
        'Practice realistic interview scenarios with an AI interviewer across different domains.',
      color: 'text-blue-600',
    },
    {
      icon: BookOpen,
      title: 'Question Bank',
      description:
        'Access thousands of interview questions organized by category and difficulty level.',
      color: 'text-green-600',
    },
    {
      icon: FileText,
      title: 'Resume Analysis',
      description:
        'Get AI-powered feedback on your resume with suggestions for improvement.',
      color: 'text-purple-600',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description:
        'Monitor your improvement with detailed analytics and performance metrics.',
      color: 'text-orange-600',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Master Your Next Interview
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Practice with AI-powered mock interviews, access curated question banks, and
              analyze your resume to land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose AI Interview?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
                >
                  <Icon className={`${feature.color} mb-4`} size={40} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Interview Questions</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Users Trained</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of successful candidates who've prepared with AI Interview.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Free Today
              <ArrowRight className="ml-2" size={20} />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>
            &copy; 2024 AI Interview Agent. All rights reserved. | Helping you land your
            dream job.
          </p>
        </div>
      </footer>
    </div>
  );
}
