import { useState } from 'react';
import { sampleOutputs } from '../data/sampleOutputs';
import { CATEGORY_LABELS, CATEGORY_DOT_COLORS } from '../types';
import LearningPathDisplay from './LearningPathDisplay';

export default function SampleOutputsList() {
  const [selectedOutput, setSelectedOutput] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Profile Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sampleOutputs.map((output, index) => (
          <button
            key={output.profile.id}
            onClick={() => setSelectedOutput(selectedOutput === index ? null : index)}
            className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedOutput === index
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                output.profile.id === 'alex' ? 'bg-emerald-500' :
                output.profile.id === 'priya' ? 'bg-purple-500' :
                output.profile.id === 'marcus' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="font-bold text-slate-800">{output.profile.name}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${
                output.profile.preferredCategory === 'web-development' ? 'bg-emerald-50 text-emerald-700' :
                output.profile.preferredCategory === 'ai-ml' ? 'bg-rose-50 text-rose-700' :
                output.profile.preferredCategory === 'devops' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT_COLORS[output.profile.preferredCategory!]}`} />
                {CATEGORY_LABELS[output.profile.preferredCategory!]}
              </span>
              <span className="text-[10px] text-slate-400">{output.courses.length} courses • {output.estimatedDuration}</span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">{output.profile.goals.substring(0, 100)}...</p>
          </button>
        ))}
      </div>

      {/* Selected Output */}
      {selectedOutput !== null ? (
        <LearningPathDisplay learningPath={sampleOutputs[selectedOutput]} error={null} />
      ) : (
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-8 border border-slate-200 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-4">
            <span className="text-2xl">👆</span>
          </div>
          <h3 className="text-base font-semibold text-slate-700">Select a profile above</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Click any student profile card to see their pre-generated learning path with full rationale for every recommendation.
          </p>
        </div>
      )}
    </div>
  );
}
