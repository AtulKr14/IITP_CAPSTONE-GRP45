import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, Play, Trophy, Percent, Clock, Flame, Check, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { getUser, getQuizStats, getQuizHistory, type QuizStats } from '@/lib/storage';

const POPULAR_TOPICS = [
  { name: 'JavaScript', icon: '🟨', category: 'Programming' },
  { name: 'Python', icon: '🐍', category: 'Programming' },
  { name: 'Java', icon: '☕', category: 'Programming' },
  { name: 'React', icon: '⚛️', category: 'Frontend' },
  { name: 'HTML & CSS', icon: '🎨', category: 'Web Design' },
  { name: 'Science', icon: '🔬', category: 'General Knowledge' },
  { name: 'History', icon: '📚', category: 'General Knowledge' },
  { name: 'Geography', icon: '🌍', category: 'General Knowledge' },
  { name: 'Mathematics', icon: '🔢', category: 'Science' },
  { name: 'Sports', icon: '⚽', category: 'General Knowledge' },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [stats, setStats] = useState<QuizStats>({ completed: 0, avgScore: 0, timeSaved: '0m', streak: 0 });
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);

  const user = getUser();

  useEffect(() => {
    if (!user) {
      setLocation('/');
      return;
    }

    // Load user stats and recent quizzes
    const userStats = getQuizStats();
    const history = getQuizHistory();
    
    setStats(userStats);
    setRecentQuizzes(history.slice(-3).reverse()); // Last 3 quizzes
  }, []);

  if (!user) {
    return null;
  }

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setCustomTopic(topic);
  };

  const handleStartQuiz = () => {
    const topic = customTopic.trim() || selectedTopic;
    if (topic) {
      setLocation(`/quiz?topic=${encodeURIComponent(topic)}`);
    }
  };

  const canStartQuiz = customTopic.trim() || selectedTopic;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Hello {user.name}, ready to conquer your next quiz?
              </h1>
              <p className="text-blue-100">Choose a topic and challenge your knowledge!</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <GraduationCap className="text-4xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                  <Trophy className="text-white h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quizzes Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Percent className="text-white h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="text-white h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.timeSaved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                  <Flame className="text-white h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topic Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Choose Your Quiz Topic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custom Topic Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Enter a topic (e.g., Java, Python, JavaScript, History, Science...)"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="pl-12 py-4 text-lg"
              />
            </div>

            {/* Popular Topics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Topics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {POPULAR_TOPICS.map((topic) => (
                  <Button
                    key={topic.name}
                    variant={selectedTopic === topic.name ? "default" : "outline"}
                    className={`p-4 h-auto flex flex-col items-center space-y-2 transition-all group ${
                      selectedTopic === topic.name 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-primary/5 hover:border-primary'
                    }`}
                    onClick={() => handleTopicSelect(topic.name)}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {topic.icon}
                    </span>
                    <span className="text-sm font-medium">{topic.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Start Quiz Button */}
            <div className="text-center pt-4">
              <Button
                onClick={handleStartQuiz}
                disabled={!canStartQuiz}
                className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {recentQuizzes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentQuizzes.map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        quiz.percentage >= 80 ? 'bg-green-500' : 
                        quiz.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        <Check className="text-white h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{quiz.topic} Quiz</p>
                        <p className="text-sm text-gray-600">
                          Completed {new Date(quiz.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        quiz.percentage >= 80 ? 'text-green-500' : 
                        quiz.percentage >= 60 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {quiz.correctAnswers}/{quiz.totalQuestions}
                      </p>
                      <p className="text-sm text-gray-600">{quiz.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
