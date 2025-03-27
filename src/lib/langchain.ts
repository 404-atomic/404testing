import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

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

// Simple function to generate a response without memory
export const generateResponse = async (modelType: ModelType, message: string) => {
  const model = createModel(modelType)
  const response = await model.invoke(message)
  return response.content
} 