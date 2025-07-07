export interface UserData {
  id: number;
  name: string;
  email: string;
}

export interface QuizProgress {
  topic: string;
  currentQuestion: number;
  totalQuestions: number;
  answers: Record<number, string>;
  timeSpent: Record<number, number>;
  startTime: number;
}

export interface QuizResult {
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  totalTime: number;
  percentage: number;
  completedAt: string;
}

export interface QuizStats {
  completed: number;
  avgScore: number;
  timeSaved: string;
  streak: number;
}

const STORAGE_KEYS = {
  USER: 'quizmaster_user',
  QUIZ_PROGRESS: 'quizmaster_quiz_progress',
  QUIZ_HISTORY: 'quizmaster_quiz_history',
  QUIZ_STATS: 'quizmaster_quiz_stats',
} as const;

export function saveUser(user: UserData): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function getUser(): UserData | null {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  return userData ? JSON.parse(userData) : null;
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function saveQuizProgress(progress: QuizProgress): void {
  localStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify(progress));
}

export function getQuizProgress(): QuizProgress | null {
  const progress = localStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS);
  return progress ? JSON.parse(progress) : null;
}

export function clearQuizProgress(): void {
  localStorage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS);
}

export function saveQuizResult(result: QuizResult): void {
  const history = getQuizHistory();
  history.push(result);
  localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
  
  // Update stats
  updateQuizStats(result);
}

export function getQuizHistory(): QuizResult[] {
  const history = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
  return history ? JSON.parse(history) : [];
}

export function getQuizStats(): QuizStats {
  const stats = localStorage.getItem(STORAGE_KEYS.QUIZ_STATS);
  if (stats) {
    return JSON.parse(stats);
  }
  
  // Calculate stats from history if not cached
  const history = getQuizHistory();
  return calculateStats(history);
}

function updateQuizStats(newResult: QuizResult): void {
  const history = getQuizHistory();
  const stats = calculateStats(history);
  localStorage.setItem(STORAGE_KEYS.QUIZ_STATS, JSON.stringify(stats));
}

function calculateStats(history: QuizResult[]): QuizStats {
  if (history.length === 0) {
    return {
      completed: 0,
      avgScore: 0,
      timeSaved: "0m",
      streak: 0,
    };
  }
  
  const totalScore = history.reduce((sum, quiz) => sum + quiz.percentage, 0);
  const avgScore = Math.round(totalScore / history.length);
  
  const totalTime = history.reduce((sum, quiz) => sum + quiz.totalTime, 0);
  const timeSavedMinutes = Math.round(totalTime / 60);
  const timeSaved = timeSavedMinutes >= 60 
    ? `${Math.floor(timeSavedMinutes / 60)}h ${timeSavedMinutes % 60}m`
    : `${timeSavedMinutes}m`;
  
  // Calculate current streak (consecutive days with quizzes)
  const streak = calculateCurrentStreak(history);
  
  return {
    completed: history.length,
    avgScore,
    timeSaved,
    streak,
  };
}

function calculateCurrentStreak(history: QuizResult[]): number {
  if (history.length === 0) return 0;
  
  // Sort by date (most recent first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const quiz of sortedHistory) {
    const quizDate = new Date(quiz.completedAt);
    quizDate.setHours(0, 0, 0, 0);
    
    if (quizDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (quizDate.getTime() < currentDate.getTime()) {
      break;
    }
  }
  
  return streak;
}
