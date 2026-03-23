import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, roadmapAPI } from '../services/api';
import {
  User, Briefcase, Target, DollarSign,
  Clock, Phone, ChevronRight, ChevronLeft,
  Sparkles, CheckCircle, Loader
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Your Background', icon: User },
  { id: 2, title: 'Your Goal', icon: Target },
  { id: 3, title: 'Compensation', icon: DollarSign },
  { id: 4, title: 'Timeline & Contact', icon: Clock },
];

const DOMAINS = [
  'Software Engineering',
  'Data Science / ML',
  'Product Management',
  'System Design / Architecture',
  'DevOps / Cloud',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Mobile Development',
  'Data Engineering',
  'Cybersecurity',
  'Other',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    yearsOfExperience: '',
    domain: '',
    currentSkills: '',
    goal: '',
    currentCTC: '',
    expectedCTC: '',
    timelineMonths: '',
    whatsappNumber: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.yearsOfExperience || form.yearsOfExperience === '') return 'Please enter years of experience.';
      if (parseInt(form.yearsOfExperience) < 0 || parseInt(form.yearsOfExperience) > 40) return 'Years of experience must be between 0 and 40.';
      if (!form.domain) return 'Please select your domain.';
    }
    if (step === 2) {
      if (!form.goal.trim()) return 'Please describe your career goal.';
    }
    if (step === 4) {
      if (!form.timelineMonths || parseInt(form.timelineMonths) < 3 || parseInt(form.timelineMonths) > 24) {
        return 'Timeline must be between 3 and 24 months.';
      }
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    if (step < STEPS.length) setStep(step + 1);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');

    try {
      setGenerating(true);

      // Save profile
      await profileAPI.save({
        yearsOfExperience: parseInt(form.yearsOfExperience),
        domain: form.domain,
        currentSkills: form.currentSkills,
        goal: form.goal,
        currentCTC: form.currentCTC || null,
        expectedCTC: form.expectedCTC || null,
        timelineMonths: parseInt(form.timelineMonths),
        whatsappNumber: form.whatsappNumber || null,
      });

      // Generate roadmap
      await roadmapAPI.generate();

      navigate('/roadmap');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
          <div className="flex items-center space-x-3 mb-1">
            <Sparkles size={24} />
            <h1 className="text-2xl font-bold">Set Up Your Career Roadmap</h1>
          </div>
          <p className="text-blue-100 text-sm">Tell us about yourself so we can craft a personalised AI roadmap</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center px-8 pt-6">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step > s.id
                      ? 'bg-green-500 text-white'
                      : step === s.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.id ? <CheckCircle size={18} /> : s.id}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${step === s.id ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form content */}
        <div className="px-8 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Background */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <User size={20} className="text-blue-600" />
                <span>Your Background</span>
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={form.yearsOfExperience}
                  onChange={handleChange}
                  min="0" max="40"
                  placeholder="e.g. 3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Domain <span className="text-red-500">*</span>
                </label>
                <select
                  name="domain"
                  value={form.domain}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select your domain...</option>
                  {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Current Skills
                </label>
                <textarea
                  name="currentSkills"
                  value={form.currentSkills}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Java, Spring Boot, React, SQL, Docker..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">List your current tech stack and skills</p>
              </div>
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <Target size={20} className="text-blue-600" />
                <span>Your Career Goal</span>
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  What do you want to achieve? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="goal"
                  value={form.goal}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g. Crack a product-based company like Google or Amazon. I want to land a senior SWE role with 30+ LPA."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Be specific — the more detail you give, the better your roadmap will be</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  💡 <strong>Examples:</strong> "Crack a FAANG company as a software engineer",
                  "Switch from service-based to product-based company",
                  "Get promoted to Staff Engineer in 6 months"
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Compensation */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <DollarSign size={20} className="text-blue-600" />
                <span>Compensation</span>
              </h2>
              <p className="text-sm text-gray-500">Optional — helps the AI set realistic expectations for your roadmap</p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Current CTC / Salary
                </label>
                <input
                  type="text"
                  name="currentCTC"
                  value={form.currentCTC}
                  onChange={handleChange}
                  placeholder="e.g. 12 LPA or $80,000/year"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Expected CTC / Target Salary
                </label>
                <input
                  type="text"
                  name="expectedCTC"
                  value={form.expectedCTC}
                  onChange={handleChange}
                  placeholder="e.g. 30 LPA or $150,000/year"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 4: Timeline & WhatsApp */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <Clock size={20} className="text-blue-600" />
                <span>Timeline & Reminders</span>
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  How many months do you want to achieve this in? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    name="timelineMonths"
                    value={form.timelineMonths}
                    onChange={handleChange}
                    min="3" max="24"
                    placeholder="e.g. 6"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500 whitespace-nowrap">months</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Must be between 3 and 24 months for a realistic roadmap</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                  <Phone size={14} />
                  <span>WhatsApp Number (for reminders)</span>
                </label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={form.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Include country code (e.g. +91 for India). Receive daily reminders & weekly check-ins.</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  🎯 You're all set! Click <strong>Generate My Roadmap</strong> and our AI will create a personalised plan based on your inputs.
                </p>
              </div>
            </div>
          )}

          {/* Generating state */}
          {generating && (
            <div className="mt-6 flex flex-col items-center justify-center py-8 space-y-3">
              <Loader size={36} className="text-blue-600 animate-spin" />
              <p className="text-gray-700 font-semibold text-lg">Generating your personalised roadmap...</p>
              <p className="text-gray-400 text-sm">This may take 15–30 seconds. Please wait.</p>
            </div>
          )}
        </div>

        {/* Footer / Navigation */}
        {!generating && (
          <div className="px-8 pb-8 flex items-center justify-between">
            <button
              onClick={() => { setError(''); setStep(step - 1); }}
              disabled={step === 1}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>

            {step < STEPS.length ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-lg"
              >
                <Sparkles size={18} />
                <span>Generate My Roadmap</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
