import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roadmapAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle, Circle, Clock, ChevronDown, ChevronUp,
  RefreshCw, MessageSquare, AlertCircle, Loader,
  Target, Calendar, TrendingUp, BookOpen, List
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     color: 'gray',  icon: Circle },
  IN_PROGRESS: { label: 'In Progress', color: 'blue',  icon: Clock },
  COMPLETED:   { label: 'Completed',   color: 'green', icon: CheckCircle },
};

const STATUS_COLORS = {
  gray:  { bg: 'bg-gray-100',  text: 'text-gray-600',  border: 'border-gray-300',  dot: 'bg-gray-400'  },
  blue:  { bg: 'bg-blue-100',  text: 'text-blue-600',  border: 'border-blue-400',  dot: 'bg-blue-500'  },
  green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400', dot: 'bg-green-500' },
};

function MilestoneCard({ milestone, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const config = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.PENDING;
  const colors = STATUS_COLORS[config.color];
  const StatusIcon = config.icon;

  const nextStatus = {
    PENDING: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
    COMPLETED: null,
  }[milestone.status];

  const nextLabel = {
    PENDING: 'Mark In Progress',
    IN_PROGRESS: 'Mark Complete ✓',
    COMPLETED: null,
  }[milestone.status];

  const handleStatusChange = async () => {
    if (!nextStatus) return;
    try {
      setUpdating(true);
      await onStatusChange(milestone.id, nextStatus);
    } finally {
      setUpdating(false);
    }
  };

  const isOverdue = milestone.status !== 'COMPLETED' &&
    milestone.dueDate && new Date(milestone.dueDate) < new Date();

  return (
    <div className={`border-l-4 ${colors.border} bg-white rounded-r-lg shadow-sm mb-3 overflow-hidden transition-all`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <StatusIcon size={20} className={colors.text} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400">Week {milestone.weekNumber}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                {config.label}
              </span>
              {isOverdue && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                  Overdue
                </span>
              )}
            </div>
            <p className="font-semibold text-gray-900 truncate mt-0.5">{milestone.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
          {milestone.dueDate && (
            <span className="text-xs text-gray-400 hidden sm:block">
              {new Date(milestone.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          {milestone.description && (
            <p className="text-gray-600 text-sm mb-3">{milestone.description}</p>
          )}

          {milestone.tasks && milestone.tasks.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-1.5">
                <List size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tasks</span>
              </div>
              <ul className="space-y-1">
                {milestone.tasks.map((task, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {milestone.resources && milestone.resources.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-1.5">
                <BookOpen size={14} className="text-green-600" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Resources</span>
              </div>
              <ul className="space-y-1">
                {milestone.resources.map((res, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">→</span>
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nextStatus && (
            <button
              onClick={handleStatusChange}
              disabled={updating}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                nextStatus === 'COMPLETED'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {updating ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              <span>{updating ? 'Updating...' : nextLabel}</span>
            </button>
          )}

          {milestone.completedAt && (
            <p className="text-xs text-green-600 mt-2">
              Completed on {new Date(milestone.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Roadmap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await roadmapAPI.getActive();
      setRoadmap(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setRoadmap(null);
      } else {
        setError('Failed to load roadmap. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (milestoneId, newStatus) => {
    try {
      await roadmapAPI.updateMilestone(milestoneId, newStatus);
      await fetchRoadmap(); // Refresh
    } catch (err) {
      setError('Failed to update milestone.');
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerate your roadmap? This will pause the current one.')) return;
    try {
      setRegenerating(true);
      await roadmapAPI.generate();
      await fetchRoadmap();
    } catch (err) {
      setError('Failed to regenerate roadmap.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Target size={60} className="mx-auto text-blue-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Roadmap Yet</h2>
          <p className="text-gray-600 mb-6">
            Set up your profile and let our AI create a personalised career roadmap for you.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            <Target size={18} />
            <span>Create My Roadmap</span>
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = roadmap.milestones?.filter(m => m.status === 'COMPLETED').length || 0;
  const totalCount = roadmap.milestones?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  roadmap.status === 'ACTIVE' ? 'bg-green-400 text-green-900' :
                  roadmap.status === 'COMPLETED' ? 'bg-yellow-300 text-yellow-900' :
                  'bg-gray-300 text-gray-800'
                }`}>
                  {roadmap.status}
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-1">{roadmap.title}</h1>
              {roadmap.description && (
                <p className="text-blue-100 text-sm">{roadmap.description}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-semibold">Overall Progress</span>
              <span className="font-bold">{roadmap.progressPercent}%</span>
            </div>
            <div className="w-full bg-blue-400 bg-opacity-50 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${roadmap.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <CheckCircle size={16} />
                <span className="font-bold">{completedCount}/{totalCount}</span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">Milestones</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Calendar size={16} />
                <span className="font-bold">{roadmap.totalWeeks}w</span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">Total Duration</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp size={16} />
                <span className="font-bold">
                  {roadmap.targetDate ? new Date(roadmap.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">Target Date</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3 mb-6 flex-wrap gap-2">
          <Link
            to="/coach"
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"
          >
            <MessageSquare size={16} />
            <span>Ask Your Coach</span>
          </Link>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm disabled:opacity-50"
          >
            {regenerating ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            <span>{regenerating ? 'Regenerating...' : 'Regenerate Roadmap'}</span>
          </button>

          <Link
            to="/onboarding"
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
          >
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Milestones */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Your Milestones ({totalCount} total)
          </h2>

          {roadmap.milestones && roadmap.milestones.length > 0 ? (
            <div className="space-y-1">
              {roadmap.milestones.map(milestone => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No milestones found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
