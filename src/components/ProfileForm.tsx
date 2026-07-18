import { useState } from 'react';
import { StudentProfile, CourseCategory, CATEGORY_LABELS } from '../types';
import { sampleProfiles } from '../data/profiles';

interface ProfileFormProps {
  profile: StudentProfile | null;
  onProfileChange: (profile: StudentProfile) => void;
  onGenerate: (profile: StudentProfile) => void;
  isLoading: boolean;
}

const categories: { value: CourseCategory | ''; label: string }[] = [
  { value: '', label: '🤷 Auto-detect from goals' },
  { value: 'web-development', label: '🌐 Web Development' },
  { value: 'data-science', label: '📊 Data Science' },
  { value: 'ai-ml', label: '🧠 AI & Machine Learning' },
  { value: 'devops', label: '☁️ DevOps & Cloud' },
  { value: 'programming', label: '💻 Programming' },
  { value: 'foundation', label: '🏗️ Foundation / General' },
];

export default function ProfileForm({ profile, onProfileChange, onGenerate, isLoading }: ProfileFormProps) {
  const [name, setName] = useState(profile?.name || '');
  const [background, setBackground] = useState(profile?.background || '');
  const [goals, setGoals] = useState(profile?.goals || '');
  const [skillsText, setSkillsText] = useState(profile?.knownSkills.join(', ') || '');
  const [preferredCategory, setPreferredCategory] = useState<CourseCategory | ''>(profile?.preferredCategory || '');
  const [selectedSample, setSelectedSample] = useState('');

  const handleSampleSelect = (profileId: string) => {
    setSelectedSample(profileId);
    const sample = sampleProfiles.find(p => p.id === profileId);
    if (sample) {
      setName(sample.name);
      setBackground(sample.background);
      setGoals(sample.goals);
      setSkillsText(sample.knownSkills.join(', '));
      setPreferredCategory(sample.preferredCategory || '');
      onProfileChange(sample);
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !background.trim() || !goals.trim()) return;
    const updatedProfile: StudentProfile = {
      id: profile?.id || `custom-${Date.now()}`,
      name,
      background,
      goals,
      knownSkills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
      preferredCategory: preferredCategory || undefined,
    };
    onProfileChange(updatedProfile);
    onGenerate(updatedProfile);
  };

  const isValid = name.trim() && background.trim() && goals.trim();

  return (
    <div className="space-y-6">
      {/* Sample Profiles */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          📋 Load a Sample Profile
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sampleProfiles.map((sp) => (
            <button
              key={sp.id}
              onClick={() => handleSampleSelect(sp.id)}
              className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                selectedSample === sp.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${
                  sp.id === 'alex' ? 'bg-emerald-500' :
                  sp.id === 'priya' ? 'bg-purple-500' :
                  sp.id === 'marcus' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span className="font-medium text-sm text-slate-800">{sp.name}</span>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                  {CATEGORY_LABELS[sp.preferredCategory!]}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{sp.background.substring(0, 80)}...</p>
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative flex justify-center"><span className="bg-slate-50 px-3 text-xs text-slate-400">OR CREATE YOUR OWN</span></div>
      </div>

      {/* Custom Profile Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            👤 Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            🎓 Background
          </label>
          <textarea
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="Describe your educational and professional background..."
            rows={3}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            🎯 Goals
          </label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="What do you want to achieve? What role or skills are you targeting?"
            rows={3}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            💡 Known Skills
          </label>
          <input
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="e.g., Python, SQL, HTML, Git (comma-separated)"
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <p className="mt-1 text-xs text-slate-400">Separate skills with commas</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            🧭 Focus Area
          </label>
          <select
            value={preferredCategory}
            onChange={(e) => setPreferredCategory(e.target.value as CourseCategory | '')}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">Helps narrow recommendations to your area of interest</p>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
          isValid && !isLoading
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating Learning Path...
          </span>
        ) : (
          '🚀 Generate My Learning Path'
        )}
      </button>
    </div>
  );
}
