import { StudentProfile } from '../types';

export const sampleProfiles: StudentProfile[] = [
  {
    id: 'alex',
    name: 'Alex Rivera',
    background: 'Marketing professional with 5 years of experience in digital marketing. BA in Communications. Comfortable with social media tools and basic spreadsheet usage. No prior programming experience but tech-curious and motivated to switch careers.',
    goals: 'Transition into a full-stack web developer role within 12 months. Want to build and deploy my own web applications and eventually work at a tech startup.',
    knownSkills: ['Social Media Management', 'Google Analytics', 'Excel', 'Content Strategy', 'Basic HTML (MySpace days)'],
    preferredCategory: 'web-development',
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    background: 'Third-year Computer Science student at a university. Strong math background (calculus, linear algebra). Have completed introductory programming courses in Java and Python. Looking to specialize in AI/ML for a research career.',
    goals: 'Become an AI/ML researcher or engineer. Want to understand deep learning, NLP, and be able to build and train my own models. Considering a Master\'s in AI.',
    knownSkills: ['Java', 'Python Basics', 'Calculus', 'Linear Algebra', 'Git', 'OOP Concepts'],
    preferredCategory: 'ai-ml',
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    background: 'Self-taught front-end developer with 2 years of freelance experience. Built several websites using HTML, CSS, and JavaScript. Familiar with React basics but no formal CS education. Want to level up into cloud and DevOps.',
    goals: 'Move into a DevOps or Cloud Engineering role. Want to understand infrastructure, containers, CI/CD pipelines, and cloud services to deploy and manage applications at scale.',
    knownSkills: ['HTML', 'CSS', 'JavaScript', 'React Basics', 'Git', 'Responsive Design', 'VS Code'],
    preferredCategory: 'devops',
  },
  {
    id: 'lin',
    name: 'Lin Chen',
    background: 'Data analyst at a retail company with 3 years of experience. BS in Statistics. Proficient in SQL, Excel, and basic Python for data manipulation. Want to transition into data science and machine learning.',
    goals: 'Transition to a Data Scientist or ML Engineer role. Want to build predictive models, understand ML algorithms deeply, and eventually work on AI-powered products.',
    knownSkills: ['SQL', 'Excel', 'Python Basics', 'Statistics', 'Tableau', 'Pandas Basics', 'A/B Testing'],
    preferredCategory: 'data-science',
  },
];

export function getProfileById(id: string): StudentProfile | undefined {
  return sampleProfiles.find(p => p.id === id);
}
