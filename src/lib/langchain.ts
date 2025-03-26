import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ConversationChain } from 'langchain/chains'
import { getMemoryManager } from './memoryStore'

// Check for required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable')
}
if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_API_KEY environment variable')
}

export type ModelType = 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-opus-latest' | 'claude-3-7-sonnet-latest'

const createModel = (modelType: ModelType) => {
  switch (modelType) {
    case 'gpt-3.5-turbo':
    case 'gpt-4':
      return new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: modelType,
        temperature: 0.7,
      })
    case 'claude-3-opus-latest':
    case 'claude-3-7-sonnet-latest':
      return new ChatAnthropic({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        modelName: modelType,
        temperature: 0.7,
      })
    default:
      throw new Error(`Unsupported model type: ${modelType}`)
  }
}

export const createChain = (modelType: ModelType, sessionId: string) => {
  const model = createModel(modelType)
  const memoryManager = getMemoryManager(sessionId)

  return new ConversationChain({
    llm: model,
    memory: memoryManager.getMemory(),
  })
} 