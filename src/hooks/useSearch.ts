import { useState, useCallback } from 'react'
import type { Chat, SearchResult } from '../types/chat'

export function useSearch(chats: Chat[]) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Simple text-based search with relevance scoring
  const searchMessages = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    try {
      const results: SearchResult[] = []
      const queryLower = query.toLowerCase()
      const queryWords = queryLower.split(' ').filter(word => word.length > 0)

      // Search through all messages in all chats
      chats.forEach(chat => {
        chat.messages.forEach(message => {
          const contentLower = message.content.toLowerCase()
          const chatTitleLower = chat.title.toLowerCase()
          
          // Calculate relevance score
          let score = 0
          
          // Exact phrase match gets highest score
          if (contentLower.includes(queryLower)) {
            score += 100
          }
          
          // Title match gets high score
          if (chatTitleLower.includes(queryLower)) {
            score += 80
          }
          
          // Word matches
          queryWords.forEach(word => {
            const wordRegex = new RegExp(`\\b${word}\\b`, 'gi')
            const contentMatches = (message.content.match(wordRegex) || []).length
            const titleMatches = (chat.title.match(wordRegex) || []).length
            
            score += contentMatches * 10
            score += titleMatches * 15
          })
          
          // Partial word matches (lower score)
          queryWords.forEach(word => {
            if (contentLower.includes(word)) {
              score += 5
            }
            if (chatTitleLower.includes(word)) {
              score += 8
            }
          })
          
          // Only include results with some relevance
          if (score > 0) {
            results.push({
              messageId: message.id,
              chatId: chat.id,
              chatTitle: chat.title,
              content: message.content,
              role: message.role,
              createdAt: message.createdAt,
              relevanceScore: score
            })
          }
        })
      })

      // Sort by relevance score (highest first) and then by date (newest first)
      results.sort((a, b) => {
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      // Limit to top 50 results
      setSearchResults(results.slice(0, 50))
      
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [chats])

  const clearSearch = useCallback(() => {
    setSearchResults([])
  }, [])

  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text
    
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 0)
    let highlightedText = text
    
    queryWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
    })
    
    return highlightedText
  }, [])

  return {
    searchResults,
    isSearching,
    searchMessages,
    clearSearch,
    highlightText
  }
}