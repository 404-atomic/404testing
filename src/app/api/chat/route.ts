import { NextResponse } from 'next/server'
import { createChain, ModelType } from '@/lib/langchain'

export async function POST(request: Request) {
  try {
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

    const chain = createChain(model as ModelType)
    const response = await chain.call({
      input: message,
    })

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