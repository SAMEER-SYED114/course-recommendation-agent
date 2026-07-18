import { useState, useCallback } from 'react';
import { StudentProfile, LearningPath, AgentConfig } from './types';
import { getAIRecommendations, getRuleBasedRecommendations } from './services/agent';
import ProfileForm from './components/ProfileForm';
import CourseCatalogue from './components/CourseCatalogue';
import LearningPathDisplay from './components/LearningPathDisplay';
import SampleOutputsList from './components/SampleOutputsList';

type Tab = 'profile' | 'catalogue' | 'samples' | 'path';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profile', label: 'My Profile', icon: '👤' },
  { id: 'catalogue', label: 'Course Catalogue', icon: '📚' },
  { id: 'samples', label: 'Sample Outputs', icon: '📋' },
  { id: 'path', label: 'My Path', icon: '🗺️' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API Config
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [provider, setProvider] = useState<'openai' | 'groq'>('groq');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('llama-3.3-70b-versatile');

  const handleProviderChange = (p: 'openai' | 'groq') => {
    setProvider(p);
    if (p === 'openai') {
      setModel('gpt-4o-mini');
    } else {
      setModel('llama-3.3-70b-versatile');
    }
  };

  const handleGenerate = useCallback(async (overrideProfile?: StudentProfile) => {
    const activeProfile = overrideProfile || profile;
    if (!activeProfile) return;
    setIsLoading(true);
    setError(null);
    setActiveTab('path');

    try {
      if (apiKey.trim()) {
        const config: AgentConfig = { provider, apiKey, model };
        const result = await getAIRecommendations(activeProfile, config);
        setLearningPath(result);
      } else {
        const result = getRuleBasedRecommendations(activeProfile);
        setLearningPath(result);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      // Fallback to rule-based
      try {
        const result = getRuleBasedRecommendations(activeProfile);
        setLearningPath(result);
        setError(`AI recommendation failed (${message.substring(0, 80)}...). Showing rule-based results instead.`);
      } catch {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [profile, apiKey, provider, model]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-xl">
                  🎓
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Course Recommendation Agent</h1>
              </div>
              <p className="text-indigo-200 text-xs sm:text-sm ml-[52px]">
                Personalized learning paths powered by AI
              </p>
            </div>
            <button
              onClick={() => setShowApiConfig(!showApiConfig)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                apiKey
                  ? 'bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <span>{apiKey ? '🟢' : '⚪'}</span>
              <span className="hidden sm:inline">API Config</span>
              <span className="sm:hidden">API</span>
            </button>
          </div>

          {/* API Config Dropdown */}
          {showApiConfig && (
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <h3 className="text-sm font-semibold text-white mb-3">🤖 AI Model Configuration</h3>
              <p className="text-xs text-indigo-200 mb-3">
                Configure an LLM API for AI-powered recommendations. Leave empty to use the built-in rule-based engine.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-indigo-200 mb-1">Provider</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProviderChange('groq')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                        provider === 'groq'
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      🚀 Groq (Free)
                    </button>
                    <button
                      onClick={() => handleProviderChange('openai')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                        provider === 'openai'
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      🧠 OpenAI
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-200 mb-1">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={provider === 'groq' ? 'gsk_...' : 'sk-...'}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-200 mb-1">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    {provider === 'groq' ? (
                      <>
                        <option value="llama-3.3-70b-versatile" className="text-slate-800">Llama 3.3 70B (Recommended)</option>
                        <option value="llama-3.1-8b-instant" className="text-slate-800">Llama 3.1 8B (Fast)</option>
                        <option value="mixtral-8x7b-32768" className="text-slate-800">Mixtral 8x7B</option>
                        <option value="gemma2-9b-it" className="text-slate-800">Gemma 2 9B</option>
                      </>
                    ) : (
                      <>
                        <option value="gpt-4o-mini" className="text-slate-800">GPT-4o Mini (Fast & Cheap)</option>
                        <option value="gpt-4o" className="text-slate-800">GPT-4o (Best)</option>
                        <option value="gpt-4-turbo" className="text-slate-800">GPT-4 Turbo</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-indigo-300 mt-3">
                {provider === 'groq'
                  ? 'Get a free API key at console.groq.com — no credit card required.'
                  : 'Requires an OpenAI API key with billing enabled.'}
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <nav className="flex gap-1 -mb-px">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-white text-white bg-white/10'
                      : 'border-transparent text-indigo-200 hover:text-white hover:bg-white/5'
                  } rounded-t-lg`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Tell Us About Yourself</h2>
              <p className="text-sm text-slate-500 mt-1">
                Your background, goals, and current skills help us craft the perfect learning path for you.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <ProfileForm
                profile={profile}
                onProfileChange={setProfile}
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            </div>

            {/* Quick Info */}
            {!apiKey && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-sm">💡</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Want AI-powered recommendations?</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Click "API Config" in the header to add a free Groq API key. Without it, we'll use our built-in rule-based engine.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'catalogue' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Course Catalogue</h2>
              <p className="text-sm text-slate-500 mt-1">
                Browse all 24 courses across 6 categories. Click any course to see details and prerequisites.
              </p>
            </div>
            <CourseCatalogue />
          </div>
        )}

        {activeTab === 'samples' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">📋 Pre-Generated Sample Outputs</h2>
              <p className="text-sm text-slate-500 mt-1">
                See the agent's output for all 4 sample student profiles — no setup or API key needed. These demonstrate the rule-based engine's recommendations.
              </p>
            </div>
            <SampleOutputsList />
          </div>
        )}

        {activeTab === 'path' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Your Learning Path</h2>
              <p className="text-sm text-slate-500 mt-1">
                A personalized, step-by-step course sequence tailored to your profile and goals.
              </p>
            </div>
            {isLoading ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-4">
                  <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">
                  {apiKey ? '🤖 AI is analyzing your profile...' : '📐 Building your learning path...'}
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  {apiKey ? 'The AI agent is considering your background, goals, and the course catalogue.' : 'Our algorithm is matching courses to your profile and resolving prerequisites.'}
                </p>
              </div>
            ) : (
              <LearningPathDisplay learningPath={learningPath} error={error} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 text-center">
          <p className="text-xs text-slate-400">
            Rooman AI Challenge — Course Recommendation Agent • Built with React + Tailwind CSS
          </p>
          <p className="text-[10px] text-slate-300 mt-1">
            Dual-engine: AI (OpenAI/Groq) + Rule-based fallback • 24 courses • 6 categories
          </p>
        </div>
      </footer>
    </div>
  );
}
