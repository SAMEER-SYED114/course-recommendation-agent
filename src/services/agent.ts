import { AgentConfig, Course, LearningPath, RecommendedCourse, StudentProfile } from '../types';
import { courses, getCourseById } from '../data/courses';

// ============================================================
// LLM-BASED RECOMMENDATION ENGINE
// ============================================================

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMRecommendation {
  courseId: string;
  rationale: string;
  phase: string;
}

function buildSystemPrompt(): string {
  return `You are an expert academic advisor and career counselor AI agent specializing in personalized course recommendations.

Your job is to analyze a student's profile (background, goals, and existing skills) and recommend an optimal, ordered learning path from the provided course catalogue.

## Rules:
1. Only recommend courses from the provided catalogue.
2. Always respect prerequisite chains — if a course has prerequisites, those must appear earlier in the path.
3. Skip courses whose skills the student already possesses (based on their known skills).
4. Each recommendation must include a clear, specific rationale explaining WHY this course is valuable for THIS student.
5. Group courses into phases: "Foundation", "Core Skills", "Specialization", and "Advanced/Capstone".
6. Consider the student's background — leverage their existing knowledge.
7. Be practical — recommend a focused path, not every course.
8. If the student's goals are broad, prioritize the most impactful courses first.

## Output Format:
Respond with ONLY a JSON object (no markdown, no explanation outside the JSON):
{
  "overallRationale": "A 2-3 sentence summary of why this path was chosen for this student",
  "estimatedDuration": "Estimated total duration like '24-30 weeks'",
  "recommendations": [
    {
      "courseId": "COURSE_ID",
      "rationale": "Specific reason this course was chosen for this student",
      "phase": "Foundation|Core Skills|Specialization|Advanced/Capstone"
    }
  ]
}`;
}

function buildCourseCatalogueText(): string {
  return courses.map(c => {
    const prereqs = c.prerequisites.length > 0 ? c.prerequisites.join(', ') : 'None';
    return `[${c.id}] ${c.name}
  Category: ${c.category} | Difficulty: ${c.difficulty} | Duration: ${c.duration}
  Prerequisites: ${prereqs}
  Skills Taught: ${c.skillsTaught.join(', ')}
  Description: ${c.description}`;
  }).join('\n\n');
}

function buildUserPrompt(profile: StudentProfile): string {
  return `## Student Profile

**Name:** ${profile.name}
**Background:** ${profile.background}
**Goals:** ${profile.goals}
**Known Skills:** ${profile.knownSkills.join(', ')}
**Preferred Focus Area:** ${profile.preferredCategory || 'Not specified'}

## Course Catalogue

${buildCourseCatalogueText()}

---

Based on this student's profile and the available courses, recommend a personalized learning path. Remember to respect prerequisites, skip redundant courses, and provide specific rationale for each recommendation.`;
}

async function callLLM(messages: LLMMessage[], config: AgentConfig): Promise<string> {
  const baseUrl = config.provider === 'groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.4,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function parseLLMResponse(raw: string): { overallRationale: string; estimatedDuration: string; recommendations: LLMRecommendation[] } {
  // Try to extract JSON from the response (handle markdown code blocks)
  let jsonStr = raw.trim();
  
  // Remove markdown code blocks if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to find JSON object
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    jsonStr = objectMatch[0];
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error('Failed to parse LLM response as JSON. Raw response: ' + raw.substring(0, 200));
  }
}

export async function getAIRecommendations(
  profile: StudentProfile,
  config: AgentConfig
): Promise<LearningPath> {
  const messages: LLMMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: buildUserPrompt(profile) },
  ];

  const rawResponse = await callLLM(messages, config);
  const parsed = parseLLMResponse(rawResponse);

  const recommendedCourses: RecommendedCourse[] = parsed.recommendations
    .map((rec, index) => {
      const course = getCourseById(rec.courseId);
      if (!course) {
        console.warn(`Course not found: ${rec.courseId}`);
        return null;
      }
      return {
        courseId: rec.courseId,
        course,
        rationale: rec.rationale,
        order: index + 1,
        phase: rec.phase,
        skillsGained: course.skillsTaught,
      };
    })
    .filter((r): r is RecommendedCourse => r !== null);

  return {
    profile,
    courses: recommendedCourses,
    overallRationale: parsed.overallRationale,
    estimatedDuration: parsed.estimatedDuration,
    generatedAt: new Date().toISOString(),
    method: 'ai',
  };
}

// ============================================================
// RULE-BASED RECOMMENDATION ENGINE (FALLBACK)
// ============================================================

function skillOverlap(studentSkills: string[], courseSkills: string[]): number {
  const studentLower = studentSkills.map(s => s.toLowerCase());
  let overlap = 0;
  for (const cs of courseSkills) {
    const csLower = cs.toLowerCase();
    if (studentLower.some(ss => ss.includes(csLower) || csLower.includes(ss))) {
      overlap++;
    }
  }
  return overlap;
}

function hasRequiredSkills(profile: StudentProfile, course: Course): boolean {
  // Check if the student already knows most skills taught by this course
  const overlap = skillOverlap(profile.knownSkills, course.skillsTaught);
  return overlap >= course.skillsTaught.length * 0.6; // If 60%+ skills known, skip
}

function topologicalSort(courseIds: string[]): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  const visiting = new Set<string>();

  function visit(id: string) {
    if (visited.has(id)) return;
    if (visiting.has(id)) return; // Cycle detection
    visiting.add(id);

    const course = getCourseById(id);
    if (course) {
      for (const prereq of course.prerequisites) {
        visit(prereq);
      }
    }

    visiting.delete(id);
    visited.add(id);
    result.push(id);
  }

  for (const id of courseIds) {
    visit(id);
  }

  return result;
}

function determinePhase(course: Course, index: number, total: number): string {
  const ratio = index / total;
  if (course.difficulty === 'beginner' || ratio < 0.25) return 'Foundation';
  if (ratio < 0.5) return 'Core Skills';
  if (ratio < 0.75) return 'Specialization';
  return 'Advanced/Capstone';
}

function generateRationale(profile: StudentProfile, course: Course, index: number, total: number): string {
  const reasons: string[] = [];

  // Goal alignment
  if (profile.goals.toLowerCase().includes(course.category) ||
      profile.goals.toLowerCase().includes(course.tags[0]) ||
      (profile.preferredCategory && course.category === profile.preferredCategory)) {
    reasons.push(`Directly aligned with your goal to ${profile.goals.split('.')[0].toLowerCase()}`);
  }

  // Background leverage
  if (course.prerequisites.length === 0) {
    reasons.push('A foundational course that will build your base knowledge');
  }

  // Skill gap filling
  const newSkills = course.skillsTaught.filter(
    skill => !profile.knownSkills.some(ks =>
      ks.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(ks.toLowerCase())
    )
  );
  if (newSkills.length > 0) {
    reasons.push(`Will teach you ${newSkills.slice(0, 2).join(' and ')}${newSkills.length > 2 ? ` and ${newSkills.length - 2} more skills` : ''}`);
  }

  // Prerequisite reasoning
  if (course.prerequisites.length > 0) {
    const prereqNames = course.prerequisites.map(id => getCourseById(id)?.name || id);
    reasons.push(`Builds upon ${prereqNames.join(' and ')}`);
  }

  // Difficulty progression
  if (index === 0) {
    reasons.push('The recommended starting point for your learning journey');
  } else if (index === total - 1) {
    reasons.push('A capstone course to solidify and apply everything you\'ve learned');
  }

  if (reasons.length === 0) {
    reasons.push(`Essential for developing expertise in ${course.category.replace('-', ' ')}`);
  }

  return reasons.slice(0, 2).join('. ') + '.';
}

export function getRuleBasedRecommendations(profile: StudentProfile): LearningPath {
  // Step 1: Find goal-relevant courses
  const goalKeywords = profile.goals.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  let relevantCourses = courses.filter(course => {
    // Check if course aligns with preferred category
    if (profile.preferredCategory && course.category === profile.preferredCategory) return true;
    
    // Check if course tags or description match goals
    const courseText = `${course.name} ${course.description} ${course.tags.join(' ')} ${course.skillsTaught.join(' ')}`.toLowerCase();
    
    const keywordMatch = goalKeywords.some(kw => courseText.includes(kw));
    const goalPhrases = profile.goals.toLowerCase().split(/[.,!]/);
    const phraseMatch = goalPhrases.some(phrase => {
      const words = phrase.trim().split(/\s+/).filter(w => w.length > 3);
      if (words.length < 2) return false;
      return words.some(w => courseText.includes(w));
    });
    
    return keywordMatch || phraseMatch;
  });

  // Step 2: Add prerequisite chains
  const courseIdsToAdd = new Set(relevantCourses.map(c => c.id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(courseIdsToAdd)) {
      const course = getCourseById(id);
      if (course) {
        for (const prereq of course.prerequisites) {
          if (!courseIdsToAdd.has(prereq)) {
            courseIdsToAdd.add(prereq);
            changed = true;
          }
        }
      }
    }
  }

  // Step 3: Remove courses the student already has skills for
  const filteredIds = Array.from(courseIdsToAdd).filter(id => {
    const course = getCourseById(id);
    if (!course) return false;
    return !hasRequiredSkills(profile, course);
  });

  // Step 4: Topologically sort
  const sortedIds = topologicalSort(filteredIds);

  // Step 5: Build recommendations
  const recommendedCourses: RecommendedCourse[] = sortedIds.map((id, index) => {
    const course = getCourseById(id)!;
    return {
      courseId: id,
      course,
      rationale: generateRationale(profile, course, index, sortedIds.length),
      order: index + 1,
      phase: determinePhase(course, index, sortedIds.length),
      skillsGained: course.skillsTaught.filter(
        skill => !profile.knownSkills.some(ks =>
          ks.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(ks.toLowerCase())
        )
      ),
    };
  });

  // Calculate estimated duration
  const totalWeeks = recommendedCourses.reduce((sum, rc) => {
    const weeks = parseInt(rc.course.duration) || 4;
    return sum + weeks;
  }, 0);

  return {
    profile,
    courses: recommendedCourses,
    overallRationale: generateOverallRationale(profile, recommendedCourses),
    estimatedDuration: `${totalWeeks}-${totalWeeks + 4} weeks`,
    generatedAt: new Date().toISOString(),
    method: 'rule-based',
  };
}

function generateOverallRationale(profile: StudentProfile, recommendations: RecommendedCourse[]): string {
  const categories = [...new Set(recommendations.map(r => r.course.category))];
  const startCourse = recommendations[0]?.course.name || 'foundation courses';
  const endCourse = recommendations[recommendations.length - 1]?.course.name || 'advanced courses';
  
  return `Based on your background in ${profile.background.split('.')[0].toLowerCase()}, this learning path takes you from ${startCourse} through to ${endCourse}. ` +
    `The path focuses on ${categories.join(', ').replace(/-/g, ' ')} to align with your goal to ${profile.goals.split('.')[0].toLowerCase()}. ` +
    `Each course builds on the previous one, filling your skill gaps while leveraging your existing knowledge.`;
}

// ============================================================
// MAIN RECOMMENDATION FUNCTION
// ============================================================

export async function getRecommendations(
  profile: StudentProfile,
  config?: AgentConfig
): Promise<LearningPath> {
  if (config?.apiKey) {
    try {
      return await getAIRecommendations(profile, config);
    } catch (error) {
      console.error('AI recommendation failed, falling back to rule-based:', error);
      throw error; // Let the caller handle the error
    }
  }
  
  return getRuleBasedRecommendations(profile);
}
