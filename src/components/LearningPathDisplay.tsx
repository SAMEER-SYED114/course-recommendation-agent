import { LearningPath, CATEGORY_COLORS, CATEGORY_DOT_COLORS, CATEGORY_LABELS, CATEGORY_ACCENT, DIFFICULTY_LABELS } from '../types';

interface LearningPathDisplayProps {
  learningPath: LearningPath | null;
  error: string | null;
}

const PHASE_ICONS: Record<string, string> = {
  'Foundation': '🏗️',
  'Core Skills': '⚙️',
  'Specialization': '🎯',
  'Advanced/Capstone': '🏆',
};

const PHASE_COLORS: Record<string, string> = {
  'Foundation': 'from-slate-500 to-slate-600',
  'Core Skills': 'from-blue-500 to-indigo-600',
  'Specialization': 'from-violet-500 to-purple-600',
  'Advanced/Capstone': 'from-amber-500 to-orange-600',
};

export default function LearningPathDisplay({ learningPath, error }: LearningPathDisplayProps) {
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-red-800">Recommendation Error</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <p className="text-xs text-red-400 mt-2">
              Try using the rule-based engine (no API key needed) or check your API configuration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 mb-4">
          <span className="text-3xl">🗺️</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Your Learning Path Awaits</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
          Fill in your profile and click "Generate" to get a personalized learning path with AI-powered recommendations.
        </p>
      </div>
    );
  }

  const phases = [...new Set(learningPath.courses.map(c => c.phase))];

  return (
    <div className="space-y-6">
      {/* Overall Summary Card */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                {learningPath.method === 'ai' ? '🤖 AI-Powered' : '📐 Rule-Based'}
              </span>
            </div>
            <h2 className="text-xl font-bold">
              {learningPath.profile.name}'s Learning Path
            </h2>
            <p className="text-sm text-indigo-100 mt-2 leading-relaxed">
              {learningPath.overallRationale}
            </p>
          </div>
        </div>
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold">{learningPath.courses.length}</div>
            <div className="text-xs text-indigo-200">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{phases.length}</div>
            <div className="text-xs text-indigo-200">Phases</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{learningPath.estimatedDuration}</div>
            <div className="text-xs text-indigo-200">Duration</div>
          </div>
        </div>
      </div>

      {/* Phase Groups with Timeline */}
      <div className="space-y-8">
        {phases.map((phase, phaseIndex) => {
          const phaseCourses = learningPath.courses.filter(c => c.phase === phase);
          const phaseIcon = PHASE_ICONS[phase] || '📚';
          const phaseGradient = PHASE_COLORS[phase] || 'from-slate-500 to-slate-600';

          return (
            <div key={phase} className="relative">
              {/* Phase Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${phaseGradient} text-white text-lg shadow-sm`}>
                  {phaseIcon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Phase {phaseIndex + 1}: {phase}</h3>
                  <p className="text-xs text-slate-400">{phaseCourses.length} course{phaseCourses.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Course Cards in Timeline */}
              <div className="ml-5 border-l-2 border-slate-200 pl-6 space-y-4">
                {phaseCourses.map((rec) => {
                  const diffInfo = DIFFICULTY_LABELS[rec.course.difficulty];
                  return (
                    <div key={rec.courseId} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[31px] top-4 w-3 h-3 rounded-full ${CATEGORY_DOT_COLORS[rec.course.category]} ring-4 ring-white`} />
                      
                      {/* Course Card */}
                      <div className={`rounded-xl border-2 ${CATEGORY_ACCENT[rec.course.category]} bg-white p-4 shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-mono font-bold text-slate-400">#{rec.order}</span>
                              <span className="text-xs font-mono text-slate-500">{rec.course.code}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${diffInfo.color}`}>
                                {diffInfo.label}
                              </span>
                            </div>
                            <h4 className="font-semibold text-slate-800 text-sm">{rec.course.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLORS[rec.course.category]} border`}>
                                {CATEGORY_LABELS[rec.course.category]}
                              </span>
                              <span className="text-xs text-slate-400">⏱ {rec.course.duration}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rationale */}
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-start gap-2">
                            <span className="text-sm mt-0.5">💡</span>
                            <p className="text-xs text-slate-600 leading-relaxed">{rec.rationale}</p>
                          </div>
                        </div>

                        {/* Skills Gained */}
                        {rec.skillsGained.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              New Skills
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rec.skillsGained.map(skill => (
                                <span key={skill} className="px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] text-emerald-700 font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Prerequisites */}
                        {rec.course.prerequisites.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Prerequisites
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rec.course.prerequisites.map(prereqId => (
                                <span key={prereqId} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-mono">
                                  {prereqId}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill Progression Summary */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span>📊</span> Skill Progression Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {phases.map((phase, idx) => {
            const phaseCourses = learningPath.courses.filter(c => c.phase === phase);
            const allSkills = phaseCourses.flatMap(c => c.skillsGained);
            const uniqueSkills = [...new Set(allSkills)];
            return (
              <div key={phase} className="bg-white rounded-xl p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${PHASE_COLORS[phase] || 'from-slate-500 to-slate-600'} text-white text-xs`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-xs text-slate-700">{phase}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {uniqueSkills.slice(0, 6).map(skill => (
                    <span key={skill} className="px-1.5 py-0.5 rounded bg-indigo-50 text-[10px] text-indigo-600">
                      {skill}
                    </span>
                  ))}
                  {uniqueSkills.length > 6 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500">
                      +{uniqueSkills.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generation Info */}
      <div className="text-center text-xs text-slate-400 pt-2">
        Generated on {new Date(learningPath.generatedAt).toLocaleString()} using {learningPath.method === 'ai' ? 'AI (LLM)' : 'rule-based algorithm'}
      </div>
    </div>
  );
}
