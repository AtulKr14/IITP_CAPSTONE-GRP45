import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, Bookmark, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/header';
import { QuizTimer } from '@/components/quiz-timer';
import { useQuiz } from '@/hooks/use-quiz';
import { getUser } from '@/lib/storage';

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const topic = searchParams.get('topic') || 'General Knowledge';
  
  const user = getUser();
  const quiz = useQuiz();
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) {
      setLocation('/');
      return;
    }

    if (quiz.questions.length === 0 && !quiz.isLoading) {
      quiz.startQuiz(topic);
    }
  }, [user, topic]);

  useEffect(() => {
    // Load saved answer for current question
    const currentAnswer = quiz.answers[quiz.currentQuestionIndex];
    setSelectedAnswer(currentAnswer || '');
  }, [quiz.currentQuestionIndex, quiz.answers]);

  useEffect(() => {
    // Redirect to results when quiz is completed
    if (quiz.isCompleted) {
      setLocation('/results');
    }
  }, [quiz.isCompleted, setLocation]);

  if (!user) {
    return null;
  }

  if (quiz.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (quiz.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{quiz.error}</p>
              <Button onClick={() => setLocation('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  if (!currentQuestion) return null;

  const progress = ((quiz.currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerChange = (answer: string) => {
    setSelectedAnswer(answer);
    quiz.answerQuestion(answer);
  };

  const handleNext = () => {
    quiz.nextQuestion();
  };

  const handlePrevious = () => {
    quiz.previousQuestion();
  };

  const handleTimeUp = () => {
    // Auto-submit and move to next question
    quiz.nextQuestion();
  };

  const handleTimeSpent = (timeSpent: number) => {
    quiz.recordTimeSpent(quiz.currentQuestionIndex, timeSpent);
  };

  const toggleBookmark = () => {
    const newBookmarks = new Set(bookmarkedQuestions);
    if (newBookmarks.has(quiz.currentQuestionIndex)) {
      newBookmarks.delete(quiz.currentQuestionIndex);
    } else {
      newBookmarks.add(quiz.currentQuestionIndex);
    }
    setBookmarkedQuestions(newBookmarks);
  };

  const getQuestionStatus = (index: number) => {
    if (index === quiz.currentQuestionIndex) return 'current';
    if (quiz.answers[index]) return 'answered';
    return 'unanswered';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Header */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{topic} Quiz</h1>
                <p className="text-gray-600">
                  Question {quiz.currentQuestionIndex + 1} of {quiz.questions.length}
                </p>
              </div>
              <QuizTimer
                duration={45}
                onTimeUp={handleTimeUp}
                onTimeSpent={handleTimeSpent}
                isActive={true}
                reset={quiz.currentQuestionIndex}
              />
            </div>

            {/* Progress Bar */}
            <Progress value={progress} className="mb-4" />
          </CardHeader>
        </Card>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex-1 mr-4">
                  {currentQuestion.question}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleBookmark}
                  className={bookmarkedQuestions.has(quiz.currentQuestionIndex) ? 'bg-yellow-50' : ''}
                >
                  <Bookmark className={`h-4 w-4 ${
                    bookmarkedQuestions.has(quiz.currentQuestionIndex) ? 'fill-yellow-500 text-yellow-500' : ''
                  }`} />
                </Button>
              </div>
              
              {/* Question Options */}
              <RadioGroup value={selectedAnswer} onValueChange={handleAnswerChange}>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={quiz.currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                {quiz.currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigation */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigation</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-4">
              {quiz.questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={`h-10 ${
                      status === 'current' ? 'bg-primary text-white border-primary' :
                      status === 'answered' ? 'bg-green-50 border-green-500 text-green-700' :
                      'border-gray-300'
                    }`}
                    onClick={() => quiz.goToQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary rounded mr-2"></div>
                <span className="text-gray-600">Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                <span className="text-gray-600">Not Answered</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
