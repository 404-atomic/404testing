import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/memory";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { supabase } from './supabase';

// Interface for our memory options
interface MemoryOptions {
  sessionId: string;
  returnMessages?: boolean;
  inputKey?: string;
  outputKey?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

export class ChatMemoryManager {
  private memory: BufferMemory;
  protected _sessionId: string;

  constructor(options: MemoryOptions) {
    this._sessionId = options.sessionId;
    
    // Initialize with default in-memory storage
    const chatHistory = new ChatMessageHistory();
    
    this.memory = new BufferMemory({
      chatHistory,
      returnMessages: options.returnMessages ?? true,
      inputKey: "input",
      outputKey: "response",
      memoryKey: "history"
    });
  }

  // Getter for the session ID
  get sessionId(): string {
    return this._sessionId;
  }

  // Getter for the memory instance
  getMemory(): BufferMemory {
    return this.memory;
  }

  // Add a user message to memory and Supabase
  async addUserMessage(content: string, model?: string) {
    const message = new HumanMessage(content);
    await this.memory.chatHistory.addMessage(message);

    // Store in Supabase
    await supabase.from('chat_history').insert({
      user_id: this._sessionId,
      role: 'user',
      content,
      model
    });
  }

  // Add an AI message to memory and Supabase
  async addAIMessage(content: string, model?: string) {
    const message = new AIMessage(content);
    await this.memory.chatHistory.addMessage(message);

    // Store in Supabase
    await supabase.from('chat_history').insert({
      user_id: this._sessionId,
      role: 'assistant',
      content,
      model
    });
  }

  // Get all messages from Supabase
  async getMessages(): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', this._sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    // Convert to ChatMessage format
    return data.map(msg => ({
      role: msg.role,
      content: msg.content,
      model: msg.model
    }));
  }

  // Clear all messages from memory and Supabase
  async clearMemory() {
    await this.memory.clear();
    
    // Clear from Supabase
    await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', this._sessionId);
  }

  // Load messages from Supabase into memory
  async loadMessagesIntoMemory() {
    const messages = await this.getMessages();
    await this.memory.clear();

    for (const msg of messages) {
      if (msg.role === 'user') {
        await this.memory.chatHistory.addMessage(new HumanMessage(msg.content));
      } else {
        await this.memory.chatHistory.addMessage(new AIMessage(msg.content));
      }
    }
  }

  // Get memory variables for the chat
  async getMemoryVariables() {
    return await this.memory.loadMemoryVariables({});
  }
}

// Create a singleton instance for the current session
let memoryManagerInstance: ChatMemoryManager | null = null;

export function getMemoryManager(sessionId: string) {
  if (!memoryManagerInstance || memoryManagerInstance.sessionId !== sessionId) {
    memoryManagerInstance = new ChatMemoryManager({ sessionId });
    // Load existing messages from Supabase
    memoryManagerInstance.loadMessagesIntoMemory();
  }
  return memoryManagerInstance;
} 