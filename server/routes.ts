import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertQuizSchema, insertQuestionResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  // Get user profile
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
      res.status(400).json({ message: "Invalid user ID" });
    }
  });

  // Get user quiz history
  app.get("/api/users/:id/quizzes", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const quizzes = await storage.getUserQuizzes(userId);
      res.json(quizzes);
    } catch (error) {
      res.status(400).json({ message: "Failed to fetch quiz history" });
    }
  });

  // Submit quiz results
  app.post("/api/quizzes", async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.json(quiz);
    } catch (error) {
      res.status(400).json({ message: "Invalid quiz data" });
    }
  });

  // Submit question responses
  app.post("/api/quizzes/:id/responses", async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const responses = z.array(insertQuestionResponseSchema).parse(req.body);
      
      const createdResponses = [];
      for (const responseData of responses) {
        const response = await storage.createQuestionResponse({
          ...responseData,
          quizId,
        });
        createdResponses.push(response);
      }
      
      res.json(createdResponses);
    } catch (error) {
      res.status(400).json({ message: "Invalid response data" });
    }
  });

  // Get quiz details with responses
  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      const responses = await storage.getQuizResponses(quizId);
      res.json({ ...quiz, responses });
    } catch (error) {
      res.status(400).json({ message: "Failed to fetch quiz details" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
