import { NextResponse } from 'next/server'
import { generateResponse, ModelType } from '@/lib/langchain'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client for auth only
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)

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

    // Generate response directly from the model without memory
    const response = await generateResponse(model as ModelType, message)

    return NextResponse.json({
      response,
      model,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 