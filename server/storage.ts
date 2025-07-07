import { users, quizzes, questionResponses, type User, type InsertUser, type Quiz, type InsertQuiz, type QuestionResponse, type InsertQuestionResponse } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getUserQuizzes(userId: number): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  
  // Question response operations
  createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;
  getQuizResponses(quizId: number): Promise<QuestionResponse[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizzes: Map<number, Quiz>;
  private questionResponses: Map<number, QuestionResponse>;
  private currentUserId: number;
  private currentQuizId: number;
  private currentResponseId: number;

  constructor() {
    this.users = new Map();
    this.quizzes = new Map();
    this.questionResponses = new Map();
    this.currentUserId = 1;
    this.currentQuizId = 1;
    this.currentResponseId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentQuizId++;
    const quiz: Quiz = { 
      ...insertQuiz, 
      id, 
      completedAt: new Date() 
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async getUserQuizzes(userId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.userId === userId,
    );
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async createQuestionResponse(insertResponse: InsertQuestionResponse): Promise<QuestionResponse> {
    const id = this.currentResponseId++;
    const response: QuestionResponse = { 
      ...insertResponse, 
      id,
      userAnswer: insertResponse.userAnswer || null
    };
    this.questionResponses.set(id, response);
    return response;
  }

  async getQuizResponses(quizId: number): Promise<QuestionResponse[]> {
    return Array.from(this.questionResponses.values()).filter(
      (response) => response.quizId === quizId,
    );
  }
}

export const storage = new MemStorage();
