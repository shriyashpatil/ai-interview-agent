import React, { useState, useEffect } from 'react';
import { linkedInAPI } from '../services/linkedinApi';
import {
  Linkedin, User, MessageSquare, Briefcase, Bell,
  Sparkles, Copy, Check, Loader, AlertCircle, Trash2,
  ExternalLink, ChevronDown, ChevronUp, Plus, RefreshCw,
  TrendingUp, Send, Reply, Clock, XCircle, FileText,
  Star, ArrowRight, Edit3
} from 'lucide-react';

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
    >
      {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

const STATUS_COLORS = {
  DRAFT:           { bg: 'bg-gray-100',   text: 'text-gray-600'  },
  SENT:            { bg: 'bg-blue-100',   text: 'text-blue-700'  },
  REPLIED:         { bg: 'bg-green-100',  text: 'text-green-700' },
  NO_REPLY:        { bg: 'bg-red-100',    text: 'text-red-600'   },
  FOLLOW_UP_SENT:  { bg: 'bg-yellow-100', text: 'text-yellow-700'},
  WISHLIST:        { bg: 'bg-gray-100',   text: 'text-gray-600'  },
  APPLIED:         { bg: 'bg-blue-100',   text: 'text-blue-700'  },
  SCREENING:       { bg: 'bg-purple-100', text: 'text-purple-700'},
  INTERVIEW:       { bg: 'bg-indigo-100', text: 'text-indigo-700'},
  OFFER:           { bg: 'bg-green-100',  text: 'text-green-700' },
  REJECTED:        { bg: 'bg-red-100',    text: 'text-red-600'   },
  WITHDRAWN:       { bg: 'bg-gray-100',   text: 'text-gray-500'  },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

// ─── Tab 1: Profile Optimizer ─────────────────────────────────────────────────

function ProfileTab() {
  const [profileText, setProfileText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    linkedInAPI.getProfile()
      .then(r => setResult(r.data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleOptimize = async () => {
    if (!profileText.trim()) { setError('Please paste your LinkedIn profile text.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await linkedInAPI.optimizeProfile({ rawProfileText: profileText, targetRole, targetCompany });
      setResult(res.data);
      setProfileText('');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to analyze profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const sections = result ? [
    { key: 'headlineSuggestion', label: '✍️ Optimised Headline', content: result.headlineSuggestion },
    { key: 'summarySuggestion',  label: '📝 Rewritten About Section', content: result.summarySuggestion },
    { key: 'skillsSuggestion',   label: '🛠️ Skills to Add', content: result.skillsSuggestion },
    { key: 'experienceSuggestion', label: '💼 Experience Bullet Rewrites', content: result.experienceSuggestion },
    { key: 'keyImprovements',    label: '🎯 Top 5 Actions (Do These Today)', content: result.keyImprovements },
  ] : [];

  if (fetching) return <div className="flex justify-center py-12"><Loader size={32} className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      {/* Input form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-1 flex items-center space-x-2">
          <Sparkles size={18} className="text-blue-600" />
          <span>{result ? 'Re-analyze Your Profile' : 'Analyze Your LinkedIn Profile'}</span>
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Copy your entire LinkedIn profile (headline + about + experience) and paste it below.
          Claude will give you specific rewrites, not just generic tips.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)}
            placeholder="Target role (e.g. Senior SWE at Google)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text" value={targetCompany} onChange={e => setTargetCompany(e.target.value)}
            placeholder="Target company (optional)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <textarea
          value={profileText}
          onChange={e => setProfileText(e.target.value)}
          rows={8}
          placeholder="Paste your LinkedIn profile text here (headline, about, experience bullets)..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        {error && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><AlertCircle size={14} /><span>{error}</span></p>}

        <button
          onClick={handleOptimize}
          disabled={loading}
          className="mt-3 flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:opacity-50"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
          <span>{loading ? 'Analyzing (30–60s)...' : 'Analyze & Optimize'}</span>
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Score banner */}
          {result.overallScore && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
              <div className="flex items-center space-x-2 mb-1">
                <Star size={20} className="text-yellow-300" />
                <span className="font-bold text-lg">Profile Score</span>
              </div>
              <p className="text-blue-100">{result.overallScore}</p>
              {result.lastAnalyzedAt && (
                <p className="text-blue-200 text-xs mt-2">
                  Last analyzed: {new Date(result.lastAnalyzedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Section cards */}
          {sections.map(s => s.content && (
            <div key={s.key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggle(s.key)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 font-semibold text-gray-900 text-sm"
              >
                <span>{s.label}</span>
                <div className="flex items-center space-x-2">
                  <CopyButton text={s.content} />
                  {expanded[s.key] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>
              {expanded[s.key] && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed mt-3">
                    {s.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Cold Messages ─────────────────────────────────────────────────────

function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    targetName: '', targetRole: '', targetCompany: '',
    targetLinkedInUrl: '', jobTitle: '', additionalContext: ''
  });

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      const res = await linkedInAPI.getMessages();
      setMessages(res.data);
    } catch (e) { setError('Failed to load messages.'); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!form.targetName || !form.targetCompany) {
      setError('Target name and company are required.'); return;
    }
    setGenerating(true); setError('');
    try {
      const res = await linkedInAPI.generateMessage(form);
      setMessages(prev => [res.data, ...prev]);
      setShowForm(false);
      setForm({ targetName: '', targetRole: '', targetCompany: '', targetLinkedInUrl: '', jobTitle: '', additionalContext: '' });
      setExpandedId(res.data.id);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to generate message.');
    } finally { setGenerating(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const sentAt = status === 'SENT' ? new Date().toISOString().split('T')[0] : undefined;
      const res = await linkedInAPI.updateMessageStatus(id, { status, ...(sentAt && { sentAt }) });
      setMessages(prev => prev.map(m => m.id === id ? res.data : m));
    } catch (e) { setError('Failed to update status.'); }
  };

  const handleFollowUp = async (id) => {
    try {
      const res = await linkedInAPI.generateFollowUp(id);
      setMessages(prev => [res.data, ...prev]);
      setExpandedId(res.data.id);
    } catch (e) { setError('Failed to generate follow-up.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await linkedInAPI.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (e) { setError('Failed to delete.'); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader size={32} className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle size={14} /><span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">✕</button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
        >
          <Plus size={16} /><span>Generate New Message</span>
        </button>
      </div>

      {/* Generate form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
            <Sparkles size={16} className="text-blue-600" /><span>Generate Personalised Message</span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            {[
              { name: 'targetName', label: 'Recruiter / Manager Name *', placeholder: 'e.g. Priya Sharma' },
              { name: 'targetRole', label: 'Their Role', placeholder: 'e.g. Engineering Manager' },
              { name: 'targetCompany', label: 'Company *', placeholder: 'e.g. Google' },
              { name: 'jobTitle', label: 'Role You\'re Targeting', placeholder: 'e.g. Senior Software Engineer' },
              { name: 'targetLinkedInUrl', label: 'Their LinkedIn URL (optional)', placeholder: 'https://linkedin.com/in/...' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                <input
                  type="text" value={form[f.name]}
                  onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Extra context (mutual connection, specific interest, why this company?)
            </label>
            <textarea
              value={form.additionalContext}
              onChange={e => setForm(prev => ({ ...prev, additionalContext: e.target.value }))}
              rows={2}
              placeholder="e.g. We both went to IIT Bombay. I saw their recent blog post on scalable systems..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50"
            >
              {generating ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{generating ? 'Generating...' : 'Generate Message'}</span>
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Messages list */}
      {messages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No messages yet</p>
          <p className="text-gray-400 text-sm mt-1">Generate your first personalised outreach message</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {msg.targetName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{msg.targetName}</p>
                    <p className="text-xs text-gray-500">{msg.targetRole && `${msg.targetRole} · `}{msg.targetCompany}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={msg.status} />
                  {expandedId === msg.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {expandedId === msg.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  {/* Message text */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                      {msg.messageText}
                    </pre>
                  </div>

                  {/* Follow-up info */}
                  {msg.followUpScheduledAt && (
                    <p className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 flex items-center space-x-1">
                      <Clock size={12} /><span>Follow-up scheduled: {msg.followUpScheduledAt}</span>
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <CopyButton text={msg.messageText} />

                    {msg.targetLinkedInUrl && (
                      <a href={msg.targetLinkedInUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                        <ExternalLink size={12} /><span>Open LinkedIn</span>
                      </a>
                    )}

                    {msg.status === 'DRAFT' && (
                      <button
                        onClick={() => handleStatusChange(msg.id, 'SENT')}
                        className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Send size={12} /><span>Mark as Sent</span>
                      </button>
                    )}

                    {msg.status === 'SENT' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(msg.id, 'REPLIED')}
                          className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Reply size={12} /><span>Got Reply ✓</span>
                        </button>
                        <button
                          onClick={() => handleFollowUp(msg.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                          <RefreshCw size={12} /><span>Generate Follow-Up</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={12} /><span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Job Tracker ───────────────────────────────────────────────────────

function JobsTab() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // jobId being processed
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    jobTitle: '', company: '', jobUrl: '', source: 'LINKEDIN',
    location: '', salary: '', jobDescription: '', notes: ''
  });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await linkedInAPI.getJobs();
      setJobs(res.data);
    } catch (e) { setError('Failed to load jobs.'); }
    finally { setLoading(false); }
  };

  const handleAddJob = async () => {
    if (!form.jobTitle || !form.company) { setError('Job title and company are required.'); return; }
    setError('');
    try {
      const res = await linkedInAPI.addJob(form);
      setJobs(prev => [res.data, ...prev]);
      setShowForm(false);
      setForm({ jobTitle: '', company: '', jobUrl: '', source: 'LINKEDIN', location: '', salary: '', jobDescription: '', notes: '' });
    } catch (e) { setError('Failed to add job.'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const extra = {};
      if (status === 'APPLIED') extra.appliedAt = new Date().toISOString().split('T')[0];
      const res = await linkedInAPI.updateJob(id, { status, ...extra });
      setJobs(prev => prev.map(j => j.id === id ? res.data : j));
    } catch (e) { setError('Failed to update status.'); }
  };

  const handleGenerateCoverLetter = async (id) => {
    setGenerating(id);
    try {
      const res = await linkedInAPI.generateCoverLetter(id);
      setJobs(prev => prev.map(j => j.id === id ? res.data : j));
    } catch (e) { setError('Failed to generate cover letter.'); }
    finally { setGenerating(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this job?')) return;
    try {
      await linkedInAPI.deleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (e) { setError('Failed to delete.'); }
  };

  const statusFlow = ['WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'];

  if (loading) return <div className="flex justify-center py-12"><Loader size={32} className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle size={14} /><span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">✕</button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
        >
          <Plus size={16} /><span>Track a Job</span>
        </button>
      </div>

      {/* Add job form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
            <Briefcase size={16} className="text-blue-600" /><span>Add Job to Track</span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            {[
              { name: 'jobTitle', label: 'Job Title *', placeholder: 'e.g. Senior Software Engineer' },
              { name: 'company', label: 'Company *', placeholder: 'e.g. Google' },
              { name: 'location', label: 'Location', placeholder: 'e.g. Bangalore / Remote' },
              { name: 'salary', label: 'Salary / CTC', placeholder: 'e.g. 40–50 LPA' },
              { name: 'jobUrl', label: 'Job URL', placeholder: 'https://linkedin.com/jobs/...' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                <input
                  type="text" value={form[f.name]}
                  onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Source</label>
              <select
                value={form.source}
                onChange={e => setForm(prev => ({ ...prev, source: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {['LINKEDIN', 'COMPANY_SITE', 'REFERRAL', 'OTHER'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Job Description (paste for AI cover letter generation)
            </label>
            <textarea
              value={form.jobDescription}
              onChange={e => setForm(prev => ({ ...prev, jobDescription: e.target.value }))}
              rows={4}
              placeholder="Paste the full job description here — Claude will use it to write a tailored cover letter..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex space-x-2">
            <button onClick={handleAddJob}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
              <Plus size={14} /><span>Add Job</span>
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Jobs list */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No jobs tracked yet</p>
          <p className="text-gray-400 text-sm mt-1">Add jobs you're interested in to track your pipeline</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                    {job.company?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{job.jobTitle}</p>
                    <p className="text-xs text-gray-500">
                      {job.company}{job.location && ` · ${job.location}`}
                      {job.salary && ` · ${job.salary}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={job.status} />
                  {expandedId === job.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {expandedId === job.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
                  {/* Status pipeline */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {statusFlow.map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(job.id, s)}
                          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                            job.status === s
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                      <button
                        onClick={() => handleStatusChange(job.id, 'REJECTED')}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                          job.status === 'REJECTED' ? 'bg-red-600 text-white' : 'border border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                      >
                        Rejected
                      </button>
                    </div>
                  </div>

                  {/* Dates */}
                  {(job.appliedAt || job.followUpDate || job.interviewDate) && (
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      {job.appliedAt && <div><span className="font-semibold">Applied:</span> {job.appliedAt}</div>}
                      {job.followUpDate && <div><span className="font-semibold">Follow-up:</span> {job.followUpDate}</div>}
                      {job.interviewDate && <div><span className="font-semibold">Interview:</span> {job.interviewDate}</div>}
                    </div>
                  )}

                  {/* Cover Letter */}
                  {job.coverLetter ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-gray-700 uppercase">Cover Letter</p>
                        <CopyButton text={job.coverLetter} />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                          {job.coverLetter}
                        </pre>
                      </div>
                      {job.resumeTips && (
                        <details className="mt-2">
                          <summary className="text-xs font-bold text-gray-600 cursor-pointer hover:text-gray-800">
                            📋 Resume Tailoring Tips
                          </summary>
                          <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700 font-sans bg-gray-50 rounded p-2">
                            {job.resumeTips}
                          </pre>
                        </details>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateCoverLetter(job.id)}
                      disabled={generating === job.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold disabled:opacity-50"
                    >
                      {generating === job.id ? <Loader size={14} className="animate-spin" /> : <FileText size={14} />}
                      <span>{generating === job.id ? 'Generating Cover Letter...' : 'Generate Cover Letter + Resume Tips'}</span>
                    </button>
                  )}

                  {/* Job URL & Delete */}
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {job.jobUrl && (
                      <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                        <ExternalLink size={12} /><span>View Job</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={12} /><span>Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab 4: Follow-Up Tracker ─────────────────────────────────────────────────

function FollowUpsTab() {
  const [messages, setMessages] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      linkedInAPI.getMessages('SENT'),
      linkedInAPI.getJobs('APPLIED'),
    ]).then(([msgRes, jobRes]) => {
      // Messages sent 7+ days ago with no reply
      const overdueMessages = msgRes.data.filter(m => {
        if (!m.sentAt) return false;
        const daysSince = Math.floor((new Date() - new Date(m.sentAt)) / 86400000);
        return daysSince >= 7;
      });
      setMessages(overdueMessages);

      // Jobs applied 5+ days ago with no update
      const overdueJobs = jobRes.data.filter(j => {
        if (!j.appliedAt) return false;
        const daysSince = Math.floor((new Date() - new Date(j.appliedAt)) / 86400000);
        return daysSince >= 5;
      });
      setJobs(overdueJobs);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader size={32} className="animate-spin text-blue-600" /></div>;

  const nothing = messages.length === 0 && jobs.length === 0;

  return (
    <div className="space-y-5">
      {nothing ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Bell size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">All caught up! 🎉</p>
          <p className="text-gray-400 text-sm mt-1">No follow-ups needed right now. Come back after sending more messages.</p>
        </div>
      ) : (
        <>
          {messages.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <Clock size={16} className="text-yellow-500" />
                <span>Messages Awaiting Reply ({messages.length})</span>
              </h3>
              <div className="space-y-2">
                {messages.map(m => (
                  <div key={m.id} className="bg-white rounded-xl border border-yellow-200 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{m.targetName} · {m.targetCompany}</p>
                      <p className="text-xs text-gray-500">
                        Sent {m.sentAt} · {Math.floor((new Date() - new Date(m.sentAt)) / 86400000)} days ago
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                        Follow-up due
                      </span>
                      {m.targetLinkedInUrl && (
                        <a href={m.targetLinkedInUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {jobs.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <Briefcase size={16} className="text-orange-500" />
                <span>Applications to Follow Up ({jobs.length})</span>
              </h3>
              <div className="space-y-2">
                {jobs.map(j => (
                  <div key={j.id} className="bg-white rounded-xl border border-orange-200 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{j.jobTitle} · {j.company}</p>
                      <p className="text-xs text-gray-500">
                        Applied {j.appliedAt} · {Math.floor((new Date() - new Date(j.appliedAt)) / 86400000)} days ago · No update
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Check status</span>
                      {j.jobUrl && (
                        <a href={j.jobUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main LinkedIn Page ────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile',  label: 'Profile Optimizer', icon: User },
  { id: 'messages', label: 'Cold Outreach',      icon: MessageSquare },
  { id: 'jobs',     label: 'Job Tracker',         icon: Briefcase },
  { id: 'followups',label: 'Follow-Ups',          icon: Bell },
];

export default function LinkedIn() {
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    linkedInAPI.getStats()
      .then(r => setStats(r.data))
      .catch(() => {});
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-1">
            <Linkedin size={28} />
            <h1 className="text-2xl font-bold">LinkedIn Agent</h1>
          </div>
          <p className="text-blue-200 text-sm">AI-powered profile optimization, outreach, and job tracking</p>

          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Messages', value: stats.totalMessages },
                { label: 'Replies', value: stats.replies },
                { label: 'Jobs Tracked', value: stats.totalJobs },
                { label: 'Follow-Ups Due', value: stats.followUpsDue, highlight: stats.followUpsDue > 0 },
              ].map(s => (
                <div key={s.label} className={`rounded-lg p-3 text-center ${s.highlight ? 'bg-yellow-400 bg-opacity-20 border border-yellow-400' : 'bg-white bg-opacity-10'}`}>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-blue-200">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex space-x-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.id === 'followups' && stats?.followUpsDue > 0 && (
                  <span className="w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {stats.followUpsDue}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'profile'   && <ProfileTab />}
        {activeTab === 'messages'  && <MessagesTab />}
        {activeTab === 'jobs'      && <JobsTab />}
        {activeTab === 'followups' && <FollowUpsTab />}
      </div>
    </div>
  );
}
