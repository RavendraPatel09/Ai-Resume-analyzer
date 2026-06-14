import {
  LayoutDashboard,
  FileSearch,
  ScanLine,
  Target,
  Briefcase,
  Mic,
  Bot,
  Eye,
  Map,
  FileEdit,
  Mail,
  Brain,
  TrendingUp,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  adminOnly?: boolean;
}

/** The 16 product surfaces from the spec, in sidebar order. */
export const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Your career at a glance' },
  { title: 'Resume Analyzer', href: '/resume-analyzer', icon: FileSearch, description: 'Parse & score your resume' },
  { title: 'ATS Scanner', href: '/ats-scanner', icon: ScanLine, description: 'Beat the bots' },
  { title: 'Skill Gap', href: '/skill-gap', icon: Target, description: 'Close the gap to your target role' },
  { title: 'Job Match', href: '/job-match', icon: Briefcase, description: 'Find roles that fit you' },
  { title: 'Mock Interview', href: '/mock-interview', icon: Mic, description: 'Practice with AI' },
  { title: 'Career Chatbot', href: '/chatbot', icon: Bot, description: 'Your 24/7 mentor' },
  { title: 'Recruiter Insights', href: '/recruiter-insights', icon: Eye, description: 'See yourself as recruiters do' },
  { title: 'Career Roadmap', href: '/roadmap', icon: Map, description: '3–24 month plans' },
  { title: 'Resume Builder', href: '/resume-builder', icon: FileEdit, description: 'Drag-and-drop builder' },
  { title: 'Cover Letters', href: '/cover-letter', icon: Mail, description: 'Tailored in seconds' },
  { title: 'AI Memory', href: '/memory', icon: Brain, description: 'What the AI remembers' },
  { title: 'Progress', href: '/progress', icon: TrendingUp, description: 'Track your growth' },
  { title: 'Settings', href: '/settings', icon: Settings, description: 'Account & preferences' },
  { title: 'Admin', href: '/admin', icon: ShieldCheck, description: 'Platform administration', adminOnly: true },
];

export const FEATURE_HIGHLIGHTS = [
  { title: 'Resume Analyzer', icon: FileSearch, blurb: 'Upload a PDF/DOCX and get a 0–100 score with weak-area fixes.' },
  { title: 'ATS Scanner', icon: ScanLine, blurb: 'Match against any job description and surface missing keywords.' },
  { title: 'AI Mock Interview', icon: Mic, blurb: 'Voice + webcam interviews with real-time evaluation reports.' },
  { title: 'Career Chatbot', icon: Bot, blurb: 'A mentor that remembers your goals, skills, and history.' },
  { title: 'Skill Gap', icon: Target, blurb: 'See exactly what to learn and how long it will take.' },
  { title: 'Career Roadmap', icon: Map, blurb: 'Visual 3/6/12/24-month plans with milestones.' },
];
