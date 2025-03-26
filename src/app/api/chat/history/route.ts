import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for auth
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)
// Client for database operations with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
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

    // Get chat history from Supabase using admin client
    const { data: messages, error: dbError } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (dbError) {
      console.error('Error fetching chat history:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      )
    }

    // Format messages for the frontend
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      model: msg.model
    }));

    return NextResponse.json({
      messages: formattedMessages
    })
  } catch (error) {
    console.error('Error in chat history API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 