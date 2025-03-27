# AI Chat Application

A Next.js application featuring a chat interface powered by multiple AI models, with Supabase authentication.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your API keys:
     - Get Supabase credentials from your project settings:
       - `NEXT_PUBLIC_SUPABASE_URL`
       - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - OpenAI API key from [OpenAI Platform](https://platform.openai.com)
     - Anthropic API key from [Anthropic Console](https://console.anthropic.com)
     - Google API key from [Google AI Studio](https://makersuite.google.com)

4. Start the development server:
```bash
npm run dev
```

## Features

- Multi-model chat support (GPT-3.5, GPT-4, Claude, Gemini)
- Google authentication via Supabase
- Real-time chat interface
- Model selection for each message
- Responsive design

## Architecture Overview

This project is a web application that allows users to:
- Log in with Google authentication via Supabase
- Chat with multiple AI models (OpenAI's GPT-3.5/GPT-4 and Anthropic's Claude models)

### Technology Stack

- **Frontend**: Next.js 14 (React 18) with TypeScript
- **Authentication**: Supabase Auth with Google OAuth
- **Styling**: Tailwind CSS
- **AI Integration**: LangChain with OpenAI and Anthropic APIs

### Key Components

#### Authentication
- Uses Supabase's authentication system with Google OAuth
- Handles login/logout and session persistence
- Implements callback handling for OAuth redirects

#### Chat Interface
- Real-time chat UI with different styling for user and AI messages
- Model selection dropdown (GPT-3.5, GPT-4, Claude 3 Opus, Claude 3 Sonnet)
- Message loading indicators
- Error handling

#### Backend API Routes
- `/api/chat/route.ts`: Main endpoint for processing chat messages
  - Authenticates the user
  - Processes the message with the selected AI model
  - Returns AI responses

#### AI Integration
- Uses LangChain to create unified interfaces for different AI models
- Supports multiple models:
  - OpenAI: GPT-3.5 and GPT-4
  - Anthropic: Claude 3 Opus and Claude 3 Sonnet

### Key Files
- `src/app/page.tsx`: Main chat interface
- `src/app/auth/login/page.tsx`: Login page
- `src/lib/langchain.ts`: AI model initialization
- `src/lib/supabase.ts`: Supabase client initialization

## Environment Variables

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Model API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
```

## Security Considerations

- API keys are stored as environment variables
- Authorization headers for API requests
- Session validation for all API endpoints

## Prerequisites

- Node.js and npm installed
- A Supabase account and project
- A Google Cloud project with OAuth credentials
- API keys for OpenAI, Anthropic, and Google AI

## Development Workflow

1. Set up environment variables in `.env.local`
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Access the application at http://localhost:3000

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Supabase Auth
- LangChain
- Tailwind CSS
- Google OAuth 2.0

## Coming Soon

- Conversation memory
- Persistent message storage
- Message threading
- File attachments
- Mobile app version
- Multi-user conversations
- Support for Google's Gemini model 