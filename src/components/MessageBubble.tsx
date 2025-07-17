import { memo } from 'react'
import { Avatar, AvatarFallback } from './ui/avatar'
import { cn } from '../lib/utils'
import type { Message } from '../types/chat'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export const MessageBubble = memo(function MessageBubble({ 
  message, 
  isStreaming = false 
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={cn(
      "flex gap-3 max-w-4xl mx-auto px-4 py-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isUser 
            ? "bg-blue-500 text-white" 
            : "bg-purple-500 text-white"
        )}>
          {isUser ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[70%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser 
            ? "bg-blue-500 text-white rounded-br-md" 
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md",
          isStreaming && "animate-pulse"
        )}>
          {message.content ? (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-500">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className={cn(
          "text-xs text-gray-500 dark:text-gray-400 px-2",
          isUser ? "text-right" : "text-left"
        )}>
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
})