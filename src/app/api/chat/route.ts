import { NextResponse } from 'next/server'
import { createChain, ModelType } from '@/lib/langchain'
import { createClient } from '@supabase/supabase-js'
import { getMemoryManager } from '@/lib/memoryStore'

// Create Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for auth
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)
// Client for database operations with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    // Check authentication using auth client
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the session using auth client
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    const { message, model } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Model selection is required' },
        { status: 400 }
      )
    }

    // Store user message in Supabase using admin client
    const { error: userMsgError } = await supabaseAdmin
      .from('chat_history')
      .insert({
        user_id: user.id,
        role: 'user',
        content: message,
        model: model
      });

    if (userMsgError) {
      console.error('Error storing user message:', userMsgError);
      return NextResponse.json(
        { error: 'Failed to store message' },
        { status: 500 }
      );
    }

    // Use user ID as session ID for memory management
    const sessionId = user.id
    const memoryManager = getMemoryManager(sessionId)
    
    // Add user message to memory
    await memoryManager.addUserMessage(message)

    // Create chain with memory
    const chain = createChain(model as ModelType, sessionId)
    const response = await chain.call({
      input: message
    })

    // Store AI response in Supabase using admin client
    const { error: aiMsgError } = await supabaseAdmin
      .from('chat_history')
      .insert({
        user_id: user.id,
        role: 'assistant',
        content: response.response,
        model: model
      });

    if (aiMsgError) {
      console.error('Error storing AI response:', aiMsgError);
    }

    // Add AI response to memory
    await memoryManager.addAIMessage(response.response)

    return NextResponse.json({
      response: response.response,
      model: model,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 