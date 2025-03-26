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
     - Get Supabase credentials from your project settings
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
- Conversation history
- Responsive design

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

## Security Note

Never commit your `.env.local` file or any API keys to version control. The `.env.example` file provides a template for required environment variables.

## Prerequisites

- Node.js and npm installed
- A Supabase account and project
- A Google Cloud project with OAuth credentials

## How it works

1. Users can interact with the chat interface immediately
2. To save their chat history (coming soon), they can log in with Google
3. The login process opens in the same window and redirects back to the chat
4. Once logged in, users can:
   - See their Google profile picture in the header
   - Access their profile information
   - Sign out when needed
5. The chat interface features:
   - Real-time message updates
   - Loading indicators
   - User messages in blue (right side)
   - AI responses in gray (left side)

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Supabase Auth
- Tailwind CSS
- Google OAuth 2.0

## Coming Soon

- Chat history persistence
- AI integration
- Message threading
- File attachments
- Mobile app version 