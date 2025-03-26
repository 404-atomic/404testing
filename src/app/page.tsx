'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { ModelType } from '@/lib/langchain'

interface Message {
  role: 'user' | 'assistant'
  content: string
  model?: ModelType
}

interface UserProfile {
  email?: string
  avatar_url?: string
  full_name?: string
}

const models: { id: ModelType; name: string; description: string }[] = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5', description: 'Fast and efficient' },
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable OpenAI model' },
  { id: 'claude-3-opus-latest', name: 'Claude 3 Opus', description: 'Most capable Anthropic model' },
  { id: 'claude-3-7-sonnet-latest', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-3.5-turbo')
  const [showModelSelect, setShowModelSelect] = useState(false)

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          email: session.user.email,
          avatar_url: session.user.user_metadata.avatar_url,
          full_name: session.user.user_metadata.full_name
        })
      }
    }
    
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          avatar_url: session.user.user_metadata.avatar_url,
          full_name: session.user.user_metadata.full_name
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to login. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setShowProfileMenu(false)
      // No need for manual redirect as the auth state change will trigger UI update
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Failed to logout. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      model: selectedModel
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          model: selectedModel
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        model: data.model
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to get response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#1B1B1B] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">AI Chat</h1>
          <div className="relative">
            <button
              onClick={() => setShowModelSelect(!showModelSelect)}
              className="px-3 py-1 text-sm bg-gray-800 rounded-md hover:bg-gray-700 flex items-center space-x-2"
            >
              <span>{models.find(m => m.id === selectedModel)?.name}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showModelSelect && (
              <div className="absolute left-0 mt-2 w-64 bg-[#2D2D2D] rounded-md shadow-lg py-1 z-10">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id)
                      setShowModelSelect(false)
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-700 flex flex-col ${
                      selectedModel === model.id ? 'bg-gray-700' : ''
                    }`}
                  >
                    <span className="font-medium">{model.name}</span>
                    <span className="text-sm text-gray-400">{model.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-700"
            >
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  {user.full_name?.[0] || user.email?.[0] || 'U'}
                </div>
              )}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#2D2D2D] rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        )}
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              <div className="flex flex-col">
                {message.model && (
                  <span className="text-xs text-gray-300 mb-1">
                    {models.find(m => m.id === message.model)?.name}
                  </span>
                )}
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-700">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="p-3 text-red-400 bg-red-900/20 rounded-lg">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${models.find(m => m.id === selectedModel)?.name}...`}
            className="flex-1 p-2 bg-[#2D2D2D] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
} 