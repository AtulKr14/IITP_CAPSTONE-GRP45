import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Download, Share, Printer, Home, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Header } from '@/components/header';
import { getUser, getQuizHistory, type QuizResult } from '@/lib/storage';

export default function Report() {
  const [, setLocation] = useLocation();
  const [latestQuiz, setLatestQuiz] = useState<QuizResult | null>(null);

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
    if (!latestQuiz || latestQuiz.completedAt !== latest.completedAt) {
      setLatestQuiz(latest);
    }
  }, [user, setLocation, latestQuiz]);

  if (!user || !latestQuiz) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minutes ${remainingSeconds} seconds`;
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const getDifficulty = (topic: string) => {
    const programmingTopics = ['javascript', 'python', 'java', 'react', 'html', 'css'];
    if (programmingTopics.some(prog => topic.toLowerCase().includes(prog))) {
      return 'Intermediate';
    }
    return 'Beginner';
  };

  const generateQuizId = (topic: string, date: string) => {
    const topicCode = topic.substring(0, 3).toUpperCase();
    const year = new Date(date).getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${topicCode}-${year}-${randomNum}`;
  };

  const handleDownloadPDF = () => {
    // In a real application, this would generate and download a PDF
    // For now, we'll show a toast message
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Quiz Report',
        text: `I scored ${latestQuiz.percentage}% on the ${latestQuiz.topic} quiz!`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(
        `Check out my quiz results! I scored ${latestQuiz.percentage}% on the ${latestQuiz.topic} quiz.`
      );
    }
  };

  // Sample question analysis (in a real app, this would come from stored responses)
  const sampleQuestions = [
    {
      question: `${latestQuiz.topic} Fundamentals`,
      status: 'Correct',
      timeSpent: '32s',
      isCorrect: true,
    },
    {
      question: `Advanced ${latestQuiz.topic} Concepts`,
      status: latestQuiz.incorrectAnswers > 0 ? 'Incorrect' : 'Correct',
      timeSpent: '45s',
      isCorrect: latestQuiz.incorrectAnswers === 0,
    },
    {
      question: `${latestQuiz.topic} Best Practices`,
      status: 'Correct',
      timeSpent: '28s',
      isCorrect: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Card */}
        <Card className="mb-8 print:shadow-none">
          <CardContent className="p-8">
            {/* Report Header */}
            <div className="text-center border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-4">
                  <Brain className="text-white text-2xl" />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-gray-900">QuizMaster</h1>
                  <p className="text-gray-600">Performance Report Card</p>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {user.name}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Date:</span> {new Date(latestQuiz.completedAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Duration:</span> {formatTime(latestQuiz.totalTime)}</p>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Details</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Subject:</span> {latestQuiz.topic}</p>
                  <p><span className="font-medium">Total Questions:</span> {latestQuiz.totalQuestions}</p>
                  <p><span className="font-medium">Difficulty:</span> {getDifficulty(latestQuiz.topic)}</p>
                  <p><span className="font-medium">Quiz ID:</span> {generateQuizId(latestQuiz.topic, latestQuiz.completedAt)}</p>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{latestQuiz.percentage}%</p>
                  <p className="text-sm text-gray-600">Overall Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">{latestQuiz.correctAnswers}</p>
                  <p className="text-sm text-gray-600">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">{latestQuiz.incorrectAnswers}</p>
                  <p className="text-sm text-gray-600">Incorrect</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-500">{latestQuiz.unansweredQuestions}</p>
                  <p className="text-sm text-gray-600">Skipped</p>
                </div>
              </div>
            </div>

            {/* Detailed Question Analysis */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Question Analysis</h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Question</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Time</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sampleQuestions.map((question, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm">Question {index + 1}: {question.question}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            question.isCorrect 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {question.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">{question.timeSpent}</td>
                        <td className="px-4 py-3 text-center text-sm font-medium">
                          {question.isCorrect ? '1/1' : '0/1'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Grade */}
            <div className="text-center bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Final Grade</h2>
              <div className="inline-block bg-primary text-white px-8 py-4 rounded-xl">
                <span className="text-4xl font-bold">{getGrade(latestQuiz.percentage)}</span>
              </div>
              <p className="text-gray-600 mt-2">
                {latestQuiz.percentage >= 80 
                  ? 'Excellent Performance - Outstanding work!' 
                  : latestQuiz.percentage >= 60 
                  ? 'Good Performance - Keep up the good work!' 
                  : 'Keep practicing - You can do better!'}
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 mt-8 text-center text-sm text-gray-600">
              <p>Generated by QuizMaster Platform | {new Date().toLocaleDateString()}</p>
              <p>This report is automatically generated and digitally verified.</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
          <Button onClick={handleDownloadPDF} className="bg-primary hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handleShare} className="bg-green-600 hover:bg-green-700">
            <Share className="mr-2 h-4 w-4" />
            Share Report
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Printer Report
          </Button>
          <Button onClick={() => setLocation('/dashboard')} variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
