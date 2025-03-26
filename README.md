# AI Chat Application

A Next.js application featuring a chat interface powered by multiple AI models, with Supabase authentication and persistent chat history.

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
       - `SUPABASE_SERVICE_ROLE_KEY` (from Project Settings > API > service_role key)
     - OpenAI API key from [OpenAI Platform](https://platform.openai.com)
     - Anthropic API key from [Anthropic Console](https://console.anthropic.com)
     - Google API key from [Google AI Studio](https://makersuite.google.com)

4. Set up Supabase database:
   - Go to your Supabase project SQL editor
   - Run the following SQL to create the chat history table:
```sql
-- Create chat history table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own messages
CREATE POLICY "Users can read their own messages"
    ON chat_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own messages
CREATE POLICY "Users can insert their own messages"
    ON chat_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

5. Start the development server:
```bash
npm run dev
```

## Features

- Multi-model chat support (GPT-3.5, GPT-4, Claude, Gemini)
- Google authentication via Supabase
- Real-time chat interface
- Model selection for each message
- Persistent conversation history in Supabase
- Memory management for context-aware responses
- Responsive design

## Environment Variables

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Model API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
```

## Security Note

Never commit your `.env.local` file or any API keys to version control. The `.env.example` file provides a template for required environment variables. The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges, so keep it secure and only use it in server-side API routes.

## Prerequisites

- Node.js and npm installed
- A Supabase account and project
- A Google Cloud project with OAuth credentials
- API keys for OpenAI, Anthropic, and Google AI

## How it works

1. Users can interact with the chat interface after logging in
2. Chat history is automatically saved to Supabase
3. The login process uses Google authentication via Supabase
4. Once logged in, users can:
   - See their Google profile picture in the header
   - Access their profile information
   - View their chat history
   - Select different AI models
   - Sign out when needed
5. The chat interface features:
   - Real-time message updates
   - Loading indicators
   - User messages in blue (right side)
   - AI responses in gray (left side)
   - Model selection dropdown
   - Persistent chat history

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Supabase Auth & Database
- LangChain
- Tailwind CSS
- Google OAuth 2.0

## Coming Soon

- Message threading
- File attachments
- Mobile app version
- Enhanced memory management
- Multi-user conversations 