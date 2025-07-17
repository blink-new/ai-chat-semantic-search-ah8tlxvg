import { useEffect, useRef } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { Button } from './ui/button'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { MessageSquare, Sparkles } from 'lucide-react'
import type { Chat } from '../types/chat'

interface ChatAreaProps {
  currentChat: Chat | null
  isLoading: boolean
  onSendMessage: (message: string) => void
  onNewChat: () => void
}

export function ChatArea({ 
  currentChat, 
  isLoading, 
  onSendMessage, 
  onNewChat 
}: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages])

  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to AI Chat
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Start a conversation with AI. Ask questions, get help with tasks, or just chat about anything you're curious about.
          </p>
          
          <Button onClick={onNewChat} size="lg" className="mb-4">
            <MessageSquare className="w-5 h-5 mr-2" />
            Start New Chat
          </Button>
          
          <div className="grid grid-cols-1 gap-3 text-left">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                💡 Ask for help
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                "Help me write a professional email"
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                🔍 Search conversations
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Use the search button to find past messages
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                ⚡ Real-time responses
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Watch AI responses stream in real-time
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {currentChat.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentChat.messages.length} messages
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                AI Online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="py-4">
          {currentChat.messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                This chat is empty
              </p>
              <p className="text-sm text-gray-400">
                Send a message to start the conversation
              </p>
            </div>
          ) : (
            <>
              {currentChat.messages.map((message, index) => {
                const isLastMessage = index === currentChat.messages.length - 1
                const isStreaming = isLastMessage && message.role === 'assistant' && isLoading
                
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isStreaming={isStreaming}
                  />
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        placeholder="Type your message..."
      />
    </div>
  )
}