import { useState, useEffect, useCallback } from 'react';
import { fetchQuizQuestions, type QuizQuestion } from '@/lib/quiz-api';
import { saveQuizProgress, getQuizProgress, clearQuizProgress, saveQuizResult, type QuizProgress } from '@/lib/storage';

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: Record<number, string>;
  timeSpent: Record<number, number>;
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  startTime: number;
}

export interface QuizActions {
  startQuiz: (topic: string) => Promise<void>;
  answerQuestion: (answer: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => void;
  recordTimeSpent: (questionIndex: number, timeSpent: number) => void;
}

export function useQuiz(): QuizState & QuizActions {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [topic, setTopic] = useState('');

  // Load quiz progress on mount
  useEffect(() => {
    const savedProgress = getQuizProgress();
    if (savedProgress) {
      loadSavedProgress(savedProgress);
    }
  }, []);

  // Save progress whenever state changes
  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      const progress: QuizProgress = {
        topic,
        currentQuestion: currentQuestionIndex,
        totalQuestions: questions.length,
        answers,
        timeSpent,
        startTime,
      };
      saveQuizProgress(progress);
    }
  }, [questions, currentQuestionIndex, answers, timeSpent, startTime, topic, isCompleted]);

  const loadSavedProgress = (progress: QuizProgress) => {
    setTopic(progress.topic);
    setCurrentQuestionIndex(progress.currentQuestion);
    setAnswers(progress.answers);
    setTimeSpent(progress.timeSpent);
    setStartTime(progress.startTime);
    // Note: We would need to refetch questions or save them in progress
  };

  const startQuiz = useCallback(async (quizTopic: string) => {
    setIsLoading(true);
    setError(null);
    setTopic(quizTopic);
    
    try {
      const quizQuestions = await fetchQuizQuestions(quizTopic, 10);
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeSpent({});
      setIsCompleted(false);
      setStartTime(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz questions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const answerQuestion = useCallback((answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  }, [currentQuestionIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [questions.length]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  }, [currentQuestionIndex, questions.length]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const recordTimeSpent = useCallback((questionIndex: number, time: number) => {
    setTimeSpent(prev => ({
      ...prev,
      [questionIndex]: time,
    }));
  }, []);

  const submitQuiz = useCallback(() => {
    if (questions.length === 0) return;

    // Calculate results
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unansweredQuestions = 0;

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (!userAnswer) {
        unansweredQuestions++;
      } else if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const percentage = Math.round((correctAnswers / questions.length) * 100);

    const result = {
      topic,
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions,
      totalTime,
      percentage,
      completedAt: new Date().toISOString(),
    };

    saveQuizResult(result);
    clearQuizProgress();
    setIsCompleted(true);
  }, [questions, answers, startTime, topic]);

  return {
    questions,
    currentQuestionIndex,
    answers,
    timeSpent,
    isLoading,
    error,
    isCompleted,
    startTime,
    startQuiz,
    answerQuestion,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    recordTimeSpent,
  };
}
