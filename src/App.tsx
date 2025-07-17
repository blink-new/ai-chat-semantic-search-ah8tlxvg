import { useState } from 'react'
import { ChatSidebar } from './components/ChatSidebar'
import { ChatArea } from './components/ChatArea'
import { SearchModal } from './components/SearchModal'
import { useChat } from './hooks/useChat'
import { useSearch } from './hooks/useSearch'
import { Toaster } from './components/ui/toaster'

function App() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  
  const {
    chats,
    currentChatId,
    setCurrentChatId,
    isLoading,
    user,
    createNewChat,
    updateChatTitle,
    deleteChat,
    getCurrentChat,
    sendMessage
  } = useChat()

  const {
    searchResults,
    isSearching,
    searchMessages,
    clearSearch,
    highlightText
  } = useSearch(chats)

  const handleNewChat = () => {
    const newChatId = createNewChat()
    if (newChatId) {
      setCurrentChatId(newChatId)
    }
  }

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleDeleteChat = (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId)
    }
  }

  const handleSearchOpen = () => {
    setIsSearchModalOpen(true)
  }

  const handleSearchClose = () => {
    setIsSearchModalOpen(false)
    clearSearch()
  }

  const handleSearchResultClick = (chatId: string, messageId: string) => {
    setCurrentChatId(chatId)
    // TODO: Scroll to specific message when database is available
    console.log('Navigate to message:', messageId, 'in chat:', chatId)
  }

  const currentChat = getCurrentChat()

  // Show loading state while auth is initializing
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onUpdateChatTitle={updateChatTitle}
        onSearchOpen={handleSearchOpen}
      />

      {/* Main Chat Area */}
      <ChatArea
        currentChat={currentChat}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        onNewChat={handleNewChat}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={handleSearchClose}
        searchResults={searchResults}
        isSearching={isSearching}
        onSearch={searchMessages}
        onResultClick={handleSearchResultClick}
        highlightText={highlightText}
      />

      <Toaster />
    </div>
  )
}

export default App