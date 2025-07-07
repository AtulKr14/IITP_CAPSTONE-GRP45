import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Trophy, Check, X, Clock, Download, RotateCcw, Home, Share, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/header';
import { PerformanceChart } from '@/components/performance-chart';
import { getUser, getQuizHistory, type QuizResult } from '@/lib/storage';

export default function Results() {
  const [, setLocation] = useLocation();
  const [latestQuiz, setLatestQuiz] = useState<QuizResult | null>(null);
  const [previousQuizzes, setPreviousQuizzes] = useState<QuizResult[]>([]);

  const user = getUser();

  useEffect(() => {
    if (!user) {
      setLocation('/');
      return;
    }

    const history = getQuizHistory();
    if (history.length === 0) {
      setLocation('/dashboard');
      return;
    }

    const latest = history[history.length - 1];
    setLatestQuiz(latest);
    setPreviousQuizzes(history.slice(0, -1));
  }, []);

  if (!user || !latestQuiz) {
    return null;
  }

  const getPerformanceFeedback = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', message: 'Outstanding! You have mastered this topic.' };
    if (percentage >= 80) return { grade: 'A', message: 'Excellent work! You have a strong understanding.' };
    if (percentage >= 70) return { grade: 'B+', message: 'Good job! Keep practicing to improve further.' };
    if (percentage >= 60) return { grade: 'B', message: 'Decent performance. Review the missed topics.' };
    if (percentage >= 50) return { grade: 'C', message: 'You passed, but there\'s room for improvement.' };
    return { grade: 'F', message: 'Don\'t give up! Practice more and try again.' };
  };

  const feedback = getPerformanceFeedback(latestQuiz.percentage);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const averageTimePerQuestion = Math.round(latestQuiz.totalTime / latestQuiz.totalQuestions);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
          <p className="text-gray-600">
            Great job on completing the <span className="font-semibold">{latestQuiz.topic}</span> quiz
          </p>
        </div>

        {/* Score Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">{latestQuiz.percentage}%</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="text-white h-5 w-5" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{feedback.message}</h2>
              <p className="text-gray-600">
                You scored <span className="font-semibold">{latestQuiz.correctAnswers} out of {latestQuiz.totalQuestions}</span> questions correctly
              </p>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Check className="text-white h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-green-600">{latestQuiz.correctAnswers}</p>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-xl">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <X className="text-white h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-red-600">{latestQuiz.incorrectAnswers}</p>
                <p className="text-sm text-gray-600">Incorrect Answers</p>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-xl">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="text-white h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">{latestQuiz.unansweredQuestions}</p>
                <p className="text-sm text-gray-600">Unanswered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Performance Chart */}
            <div className="mb-8">
              <PerformanceChart quizResult={latestQuiz} />
            </div>

            {/* Time Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Time Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Time:</span>
                    <span className="font-medium">{formatTime(latestQuiz.totalTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average per Question:</span>
                    <span className="font-medium">{formatTime(averageTimePerQuestion)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion Date:</span>
                    <span className="font-medium">
                      {new Date(latestQuiz.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Grade & Feedback</h3>
                <div className="text-center">
                  <div className="inline-block bg-primary text-white px-8 py-4 rounded-xl mb-3">
                    <span className="text-4xl font-bold">{feedback.grade}</span>
                  </div>
                  <p className="text-gray-600">{feedback.message}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => setLocation(`/quiz?topic=${encodeURIComponent(latestQuiz.topic)}`)}
            className="bg-primary hover:bg-primary/90"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Quiz
          </Button>
          <Button 
            onClick={() => setLocation('/report')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            View Report Card
          </Button>
          <Button 
            onClick={() => setLocation('/dashboard')}
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
