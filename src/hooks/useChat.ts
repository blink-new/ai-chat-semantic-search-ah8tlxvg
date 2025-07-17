import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import type { Chat, Message } from '../types/chat'

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Load user and chats on mount
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadChats()
      }
    })
    return unsubscribe
  }, [loadChats])

  const loadChats = useCallback(async () => {
    if (!user?.id) return
    
    try {
      // For now, use localStorage until database is available
      const savedChats = localStorage.getItem(`chats_${user.id}`)
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats)
        setChats(parsedChats)
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }, [user?.id])

  const saveChats = useCallback((updatedChats: Chat[]) => {
    if (!user?.id) return
    localStorage.setItem(`chats_${user.id}`, JSON.stringify(updatedChats))
    setChats(updatedChats)
  }, [user?.id])

  const createNewChat = useCallback(() => {
    if (!user?.id) return null

    const newChat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    }

    const updatedChats = [newChat, ...chats]
    saveChats(updatedChats)
    setCurrentChatId(newChat.id)
    return newChat.id
  }, [user?.id, chats, saveChats])

  const updateChatTitle = useCallback((chatId: string, title: string) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, title, updatedAt: new Date().toISOString() }
        : chat
    )
    saveChats(updatedChats)
  }, [chats, saveChats])

  const addMessage = useCallback((chatId: string, message: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }

    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, newMessage]
        return {
          ...chat,
          messages: updatedMessages,
          updatedAt: new Date().toISOString(),
          // Auto-generate title from first user message
          title: chat.messages.length === 0 && message.role === 'user' 
            ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
            : chat.title
        }
      }
      return chat
    })

    saveChats(updatedChats)
    return newMessage
  }, [chats, saveChats])

  const updateMessage = useCallback((chatId: string, messageId: string, content: string) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = chat.messages.map(msg =>
          msg.id === messageId ? { ...msg, content } : msg
        )
        return {
          ...chat,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        }
      }
      return chat
    })

    saveChats(updatedChats)
  }, [chats, saveChats])

  const deleteChat = useCallback((chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId)
    saveChats(updatedChats)
    
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
    }
  }, [chats, currentChatId, saveChats])

  const getCurrentChat = useCallback(() => {
    return chats.find(chat => chat.id === currentChatId) || null
  }, [chats, currentChatId])

  const sendMessage = useCallback(async (content: string) => {
    if (!currentChatId || !user?.id) return

    setIsLoading(true)
    
    try {
      // Add user message
      const userMessage = addMessage(currentChatId, {
        chatId: currentChatId,
        role: 'user',
        content
      })

      // Add assistant message placeholder
      const assistantMessage = addMessage(currentChatId, {
        chatId: currentChatId,
        role: 'assistant',
        content: ''
      })

      // Get current chat messages for context
      const currentChat = getCurrentChat()
      const messages = currentChat?.messages || []
      
      // Prepare messages for AI (exclude the empty assistant message we just added)
      const aiMessages = messages
        .filter(msg => msg.id !== assistantMessage.id)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))

      // Stream response from AI
      let fullResponse = ''
      await blink.ai.streamText(
        {
          messages: aiMessages as any,
          model: 'gpt-4o-mini'
        },
        (chunk) => {
          fullResponse += chunk
          updateMessage(currentChatId, assistantMessage.id, fullResponse)
        }
      )

    } catch (error) {
      console.error('Error sending message:', error)
      // Update the assistant message with error
      updateMessage(currentChatId, '', 'Sorry, I encountered an error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [currentChatId, user?.id, addMessage, updateMessage, getCurrentChat])

  return {
    chats,
    currentChatId,
    setCurrentChatId,
    isLoading,
    user,
    createNewChat,
    updateChatTitle,
    deleteChat,
    getCurrentChat,
    sendMessage,
    loadChats
  }
}