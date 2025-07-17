export interface Message {
  id: string
  chatId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface Chat {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

export interface SearchResult {
  messageId: string
  chatId: string
  chatTitle: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
  relevanceScore: number
}