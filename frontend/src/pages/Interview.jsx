import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import { interviewAPI } from '../services/api';

export default function Interview() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [category, setCategory] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await interviewAPI.getMessages(sessionId);
      setMessages(response.data);
      // Try to extract category from first message or session data
      if (response.data.length > 0) {
        const firstMessage = response.data[0];
        if (firstMessage.metadata?.category) {
          setCategory(firstMessage.metadata.category);
        }
      }
    } catch (err) {
      setError('Failed to load interview messages. Please try again.');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setSending(true);
    setError('');

    // Optimistically add user message
    setMessages((prev) => [
      ...prev,
      { role: 'user', message: userMessage, timestamp: new Date().toISOString() },
    ]);

    try {
      const response = await interviewAPI.sendMessage(sessionId, userMessage);
      const aiMessage = response.data;

      // Add AI response
      setMessages((prev) => [
        ...prev,
        { role: aiMessage.role, message: aiMessage.message, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
      // Remove the optimistically added message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleEndInterview = async () => {
    if (!window.confirm('Are you sure you want to end this interview?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await interviewAPI.endInterview(sessionId);
      setSessionResult(response.data);
      setSessionEnded(true);
    } catch (err) {
      setError('Failed to end interview. Please try again.');
      console.error('Error ending interview:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="flex items-center justify-center mb-6">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Interview Completed!
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Great job! Here's your performance summary.
          </p>

          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Score</h3>
              <p className="text-4xl font-bold text-blue-600">{sessionResult?.score || 'N/A'}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Feedback</h3>
              <p className="text-gray-700">{sessionResult?.feedback || 'No feedback available.'}</p>
            </div>

            {sessionResult?.suggestions && (
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas to Improve</h3>
                <ul className="list-disc list-inside space-y-2">
                  {sessionResult.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-gray-700">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="flex-1 bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              View Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Session</h1>
            {category && (
              <p className="text-sm text-gray-600 mt-1">Category: {category}</p>
            )}
          </div>
          <button
            onClick={handleEndInterview}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
          >
            <LogOut size={18} />
            <span>End Interview</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {messages.length === 0 && !error ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Your interview is ready to start. Type your first message below.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-2 ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={sending || sessionEnded}
              placeholder="Type your response..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
            <button
              type="submit"
              disabled={sending || !inputValue.trim() || sessionEnded}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
