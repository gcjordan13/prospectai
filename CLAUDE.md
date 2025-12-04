# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prospector AI is a Next.js 15 application that helps users identify and prospect potential business leads using AI. The app uses Firebase for authentication and data storage, and Google's Genkit AI framework with Gemini 2.5 Flash for conversational prospecting workflows.

## Development Commands

```bash
# Development server (runs on port 9002)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Genkit AI development server
npm run genkit:dev

# Genkit AI development with watch mode
npm run genkit:watch
```

## Core Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and React 19
- **AI Framework**: Google Genkit with Gemini 2.5 Flash model
- **Backend**: Firebase (Authentication, Firestore)
- **UI**: Radix UI primitives with Tailwind CSS
- **Forms**: React Hook Form with Zod validation

### Application Flow

The application implements a multi-stage prospecting wizard:

1. **Chat Stage** (`chat-interface.tsx`): Conversational AI gathers user's prospecting requirements (industry, location, company size)
2. **Scope Confirmation**: AI flow (`confirm-prospecting-scope.ts`) validates and confirms the prospecting criteria
3. **Company Identification** (`identifying`): AI flow (`identify-relevant-companies.ts`) generates relevant companies
4. **Contact Scraping** (`scraping`): Simulated ethical contact gathering (currently using mock data)
5. **Results Display** (`results-display.tsx`): Shows identified companies and contacts

### Key Directories

- `src/app/` - Next.js App Router pages and server actions
  - `actions.ts` - Server actions that call AI flows (`getAiResponse`, `findCompanies`)
  - `page.tsx` - Main landing page with authentication guard
  - `history/` - View past prospecting goals
  - `login/`, `signup/` - Authentication pages

- `src/ai/` - Genkit AI configuration and flows
  - `genkit.ts` - Genkit initialization with Google AI plugin
  - `flows/confirm-prospecting-scope.ts` - Conversational flow for gathering requirements
  - `flows/identify-relevant-companies.ts` - Flow for generating company lists
  - `dev.ts` - Development server entry point for Genkit

- `src/components/`
  - `prospector/` - Core wizard components (chat, results, wizard orchestration)
  - `auth/` - Authentication UI components
  - `ui/` - Reusable shadcn/ui components

- `src/firebase/` - Firebase integration
  - `config.ts` - Firebase configuration
  - `provider.tsx`, `client-provider.tsx` - React context providers for Firebase SDKs
  - `firestore/use-collection.tsx`, `use-doc.tsx` - Firestore React hooks
  - `actions.ts` - Firebase utility functions
  - `error-emitter.ts` - Centralized error handling

### Data Model (Firestore)

The app uses a user-centric hierarchical data structure with path-based ownership:

```
/users/{userId}
  └─ /prospectingGoals/{goalId}
      ├─ goalDescription: string
      ├─ createdAt: timestamp
      ├─ userId: string (denormalized for security rules)
      └─ /prospects/{prospectId}
          ├─ companyName: string
          ├─ websiteUrl: string
          └─ prospectingGoalId: string (denormalized for security rules)
```

Security rules enforce strict user ownership - users can only access data under their own `/users/{userId}` path. See `firestore.rules` for detailed authorization logic.

### AI Flows Architecture

Genkit flows are defined as server-side functions with typed schemas:

1. **Input/Output Schemas**: All flows use Zod schemas for type safety
2. **Prompt Definitions**: Use Genkit's `ai.definePrompt()` with Handlebars templates
3. **Flow Execution**: `ai.defineFlow()` orchestrates the AI interaction
4. **Server Actions**: Flows are wrapped in Next.js server actions in `src/app/actions.ts`

Example pattern from `confirm-prospecting-scope.ts`:
- Takes user input + conversation history
- AI asks clarifying questions OR confirms scope
- Returns `assistantResponse` (always) and `confirmedScope` (when ready)

### State Management

The main wizard (`prospecting-wizard.tsx`) uses React state and transitions:
- `stage`: Controls UI flow (chat → identifying → scraping → results)
- `conversation`: Array of messages with roles (user/assistant)
- `confirmedScope`: Stores validated prospecting criteria
- `useTransition`: Manages async AI calls without blocking UI

### Firebase Integration Patterns

- **Auto-initialization**: Attempts Firebase App Hosting environment variables first, falls back to config object
- **Context Providers**: `FirebaseProvider` wraps the app, provides `{ firebaseApp, auth, firestore, user }`
- **Custom Hooks**: `useUser()`, `useCollection()`, `useDoc()` for reactive Firebase data
- **Error Handling**: `FirebaseErrorListener` component shows toast notifications for Firebase errors

## Important Configuration Notes

### Next.js Config
- TypeScript and ESLint errors are ignored during builds (`ignoreBuildErrors: true`)
- Remote image patterns allowed: placehold.co, images.unsplash.com, picsum.photos
- Turbopack enabled for development

### Firebase Security
- Firestore rules enforce user-owned data trees
- No public data access - all operations require authentication
- Denormalized `userId` fields ensure path-based authorization works correctly
- Never modify the `id` field on User documents or foreign key fields (userId, prospectingGoalId)

### AI Model Configuration
- Model: `googleai/gemini-2.5-flash` (configured in `src/ai/genkit.ts`)
- Change the model by modifying the `model` parameter in the Genkit initialization
- API key should be set via environment variable for Google AI

## Development Workflows

### Adding New AI Flows
1. Create flow file in `src/ai/flows/`
2. Define Zod input/output schemas
3. Create prompt with `ai.definePrompt()`
4. Define flow with `ai.defineFlow()`
5. Export server action wrapper
6. Import and call from `src/app/actions.ts`

### Working with Firestore
- Always verify security rules match your data structure
- Use subcollections under `/users/{userId}` for user-owned data
- Denormalize foreign keys for rule validation (e.g., `userId` in goals, `prospectingGoalId` in prospects)
- Test rules with authenticated contexts

### Component Development
- UI components are in `src/components/ui/` (shadcn/ui pattern)
- Use `cn()` utility from `src/lib/utils.ts` for conditional classNames
- Follow Radix UI composition patterns for complex components
