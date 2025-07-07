# QuizMaster Application

## Overview

QuizMaster is a full-stack web application that provides an interactive quiz experience. Users can create accounts, take quizzes on various topics, track their performance, and view detailed results. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks and TanStack Query for server state
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Request Handling**: JSON and URL-encoded body parsing
- **Error Handling**: Centralized error middleware
- **Development**: Hot reload with Vite integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL using Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Local Storage**: Browser localStorage for client-side data persistence (user sessions, quiz progress)
- **Memory Storage**: In-memory fallback storage implementation for development

## Key Components

### Authentication System
- User registration and login endpoints
- Password-based authentication (simplified for demo)
- Client-side user session management via localStorage
- Protected routes requiring authentication

### Quiz Management
- Dynamic quiz generation using Open Trivia Database API
- Support for multiple topics (Programming, Science, History, etc.)
- Configurable question count and difficulty levels
- Real-time quiz progress tracking
- Question timer functionality with time tracking per question

### Data Models
- **Users**: Basic user information (id, name, email, password)
- **Quizzes**: Quiz sessions with performance metrics
- **Question Responses**: Individual question answers and timing data

### UI Components
- Responsive design with mobile-first approach
- Interactive quiz interface with radio button selections
- Progress tracking and performance charts
- Results dashboard with detailed analytics
- Navigation header with user authentication state

## Data Flow

1. **User Registration/Login**: Client sends credentials to `/api/auth/register` or `/api/auth/login`
2. **Quiz Creation**: User selects topic, application fetches questions from external API
3. **Quiz Taking**: Questions displayed one by one, answers and timing stored locally
4. **Quiz Submission**: Complete quiz data sent to backend for persistence
5. **Results Display**: Performance metrics calculated and displayed with charts
6. **History Tracking**: Past quiz results stored and displayed in dashboard

## External Dependencies

### Third-Party APIs
- **Open Trivia Database**: External API for quiz questions across multiple categories
- **Replit Services**: Development environment integration

### Key Libraries
- **UI Framework**: React 18 with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL dialect
- **HTTP Client**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with Radix UI primitives
- **Charts**: Custom canvas-based performance visualization

### Development Tools
- **Build System**: Vite with React plugin
- **TypeScript**: Strict type checking with path mapping
- **Code Quality**: ESNext modules with bundler resolution

## Deployment Strategy

### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- Express server with middleware mode integration
- Automatic TypeScript compilation and error handling
- Replit-specific development features (banner, cartographer)

### Production Build
- Vite production build with optimized assets
- esbuild for server-side bundling
- Static file serving from Express
- Environment-based configuration management

### Database Management
- Drizzle migrations for schema versioning
- Environment variable configuration for database URL
- Automatic database connection validation

## Changelog
- July 07, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.