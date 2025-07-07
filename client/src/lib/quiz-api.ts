export interface TriviaQuestion {
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface TriviaResponse {
  response_code: number;
  results: TriviaQuestion[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: string;
}

// Map topic names to Open Trivia DB category IDs
const TOPIC_CATEGORIES: Record<string, number> = {
  'general': 9,
  'science': 17,
  'computer': 18,
  'mathematics': 19,
  'sports': 21,
  'geography': 22,
  'history': 23,
  'politics': 24,
  'art': 25,
  'celebrities': 26,
  'animals': 27,
  'vehicles': 28,
  'comics': 29,
  'gadgets': 30,
  'anime': 31,
  'cartoon': 32,
};

export async function fetchQuizQuestions(topic: string, amount: number = 10): Promise<QuizQuestion[]> {
  try {
    // Try to find a specific category for the topic
    let categoryId = TOPIC_CATEGORIES[topic.toLowerCase()];
    
    // If it's a programming topic, use computer science category
    const programmingTopics = ['javascript', 'python', 'java', 'react', 'html', 'css', 'programming', 'coding'];
    if (!categoryId && programmingTopics.some(prog => topic.toLowerCase().includes(prog))) {
      categoryId = 18; // Computer Science
    }
    
    // Build the API URL
    let apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
    if (categoryId) {
      apiUrl += `&category=${categoryId}`;
    }
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: TriviaResponse = await response.json();
    
    if (data.response_code !== 0) {
      throw new Error(`API error! response_code: ${data.response_code}`);
    }
    
    // Transform the data to our quiz format
    return data.results.map((item, index) => {
      const options = [...item.incorrect_answers, item.correct_answer];
      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      
      return {
        id: index + 1,
        question: decodeHTMLEntities(item.question),
        options: options.map(decodeHTMLEntities),
        correctAnswer: decodeHTMLEntities(item.correct_answer),
        category: item.category,
        difficulty: item.difficulty,
      };
    });
  } catch (error) {
    console.error('Failed to fetch quiz questions:', error);
    
    // Fallback: Return general knowledge questions if API fails
    return generateFallbackQuestions(topic, amount);
  }
}

function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function generateFallbackQuestions(topic: string, amount: number): QuizQuestion[] {
  const fallbackQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: `What is the primary characteristic of ${topic}?`,
      options: ["Dynamic typing", "Static typing", "No typing", "Strong typing"],
      correctAnswer: "Dynamic typing",
      category: "General Knowledge",
      difficulty: "medium"
    },
    {
      id: 2,
      question: `Which of these is commonly used in ${topic}?`,
      options: ["Variables", "Constants", "Functions", "All of the above"],
      correctAnswer: "All of the above",
      category: "General Knowledge", 
      difficulty: "easy"
    },
    {
      id: 3,
      question: `${topic} is primarily used for?`,
      options: ["Web development", "Mobile apps", "Desktop apps", "All platforms"],
      correctAnswer: "All platforms",
      category: "General Knowledge",
      difficulty: "medium"
    }
  ];
  
  return fallbackQuestions.slice(0, amount);
}

export async function getTopicSuggestions(): Promise<string[]> {
  return [
    'JavaScript',
    'Python', 
    'Java',
    'React',
    'HTML & CSS',
    'Science',
    'History',
    'Geography',
    'Sports',
    'Mathematics'
  ];
}
