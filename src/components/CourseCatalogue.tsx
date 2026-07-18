import { useState } from 'react';
import { Course, CourseCategory, CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_DOT_COLORS, DIFFICULTY_LABELS } from '../types';
import { courses, getCoursesByCategory } from '../data/courses';

const categories: CourseCategory[] = ['foundation', 'programming', 'web-development', 'data-science', 'ai-ml', 'devops'];

export default function CourseCatalogue() {
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const filteredCourses = (() => {
    let result = selectedCategory === 'all' ? courses : getCoursesByCategory(selectedCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.skillsTaught.some(s => s.toLowerCase().includes(query)) ||
        c.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    return result;
  })();

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search courses, skills, or topics..."
          className="w-full rounded-xl border-2 border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({courses.length})
        </button>
        {categories.map(cat => {
          const count = getCoursesByCategory(cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT_COLORS[cat]}`} />
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-lg">No courses found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              isExpanded={expandedCourse === course.id}
              onToggle={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
            />
          ))
        )}
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl p-4 border border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">{courses.length}</div>
            <div className="text-xs text-slate-500">Total Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-violet-600">{categories.length}</div>
            <div className="text-xs text-slate-500">Categories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce((sum, c) => sum + parseInt(c.duration) || 4, 0)}
            </div>
            <div className="text-xs text-slate-500">Total Weeks</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, isExpanded, onToggle }: { course: Course; isExpanded: boolean; onToggle: () => void }) {
  const diffInfo = DIFFICULTY_LABELS[course.difficulty];

  return (
    <div
      className={`rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        isExpanded
          ? `${CATEGORY_COLORS[course.category]} shadow-md`
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-500">{course.code}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${diffInfo.color}`}>
                {diffInfo.label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLORS[course.category]} border`}>
                {CATEGORY_LABELS[course.category]}
              </span>
            </div>
            <h3 className="font-semibold text-sm text-slate-800">{course.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{course.duration}</p>
          </div>
          <svg
            className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
            
            {course.prerequisites.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Prerequisites</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {course.prerequisites.map(prereqId => (
                    <span key={prereqId} className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-mono">
                      {prereqId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Skills Taught</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {course.skillsTaught.map(skill => (
                  <span key={skill} className="px-2 py-0.5 rounded-md bg-indigo-50 text-xs text-indigo-600">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
