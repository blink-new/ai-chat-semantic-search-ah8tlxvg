import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Search, MessageSquare, User, Bot, Calendar, ArrowRight } from 'lucide-react'
import { cn } from '../lib/utils'
import type { SearchResult } from '../types/chat'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  searchResults: SearchResult[]
  isSearching: boolean
  onSearch: (query: string) => void
  onResultClick: (chatId: string, messageId: string) => void
  highlightText: (text: string, query: string) => string
}

export function SearchModal({
  isOpen,
  onClose,
  searchResults,
  isSearching,
  onSearch,
  onResultClick,
  highlightText
}: SearchModalProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (query.trim()) {
      const debounceTimer = setTimeout(() => {
        onSearch(query)
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      onSearch('')
    }
  }, [query, onSearch])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return 'Today'
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 100) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Conversations
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages and chat titles..."
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        <Separator />

        {/* Search Results */}
        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="p-6 pt-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Searching...</span>
              </div>
            ) : query.trim() === '' ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Search your conversations</p>
                <p className="text-sm">Type to search through all your messages and chat titles</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-sm">Try different keywords or check your spelling</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <div
                      key={`${result.chatId}-${result.messageId}`}
                      className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-colors"
                      onClick={() => {
                        onResultClick(result.chatId, result.messageId)
                        onClose()
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {result.role === 'user' ? (
                              <User className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Bot className="w-4 h-4 text-purple-500" />
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {result.role === 'user' ? 'You' : 'AI'}
                            </span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getRelevanceColor(result.relevanceScore))}
                          >
                            {result.relevanceScore}% match
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(result.createdAt)}
                        </div>
                      </div>

                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {result.chatTitle}
                        </p>
                        <div 
                          className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(truncateContent(result.content), query) 
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="text-xs">
                          Go to message
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}