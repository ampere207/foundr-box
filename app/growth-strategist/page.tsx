'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSyncUser } from '@/lib/syncUser'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  message_type?: string
}

type Conversation = {
  id: string
  conversation_title: string
  created_at: string
  updated_at: string
  last_message_at: string
  message_count: number
  conversation_summary?: string
  tags?: string[]
}

type ValidatedIdea = {
  id: string
  idea_title: string
  idea_description: string
  target_audience: string
  problem_solving: string
  unique_value_proposition: string
  business_model: string
  technical_feasibility: string
  resource_requirements: string
  overall_score: number
  created_at: string
  updated_at: string
}

const STARTER_PROMPTS = [
  {
    emoji: '📈',
    title: 'Growth Strategy',
    description: 'Get personalized growth tactics',
    message: "Hi Alex! I need help developing a comprehensive growth strategy for my startup. Can you guide me through the key areas I should focus on to accelerate growth?"
  },
  {
    emoji: '🎯',
    title: 'User Acquisition',
    description: 'Learn effective user acquisition',
    message: "Hey Alex! I'm struggling with user acquisition. What are the most effective and cost-efficient ways to acquire new users for my startup?"
  },
  {
    emoji: '💰',
    title: 'Monetization Strategy',
    description: 'Optimize revenue streams',
    message: "Hi Alex! I need advice on monetization strategies. How can I optimize my revenue streams and improve my business model to generate more income?"
  },
  {
    emoji: '🚀',
    title: 'Scaling Advice',
    description: 'Navigate scaling challenges',
    message: "Hello Alex! My startup is growing and I need guidance on scaling. What are the key challenges I should prepare for and how can I scale effectively?"
  }
]

// Keywords that indicate Alex is asking about startup details
const STARTUP_DETAIL_KEYWORDS = [
  'startup', 'business', 'company', 'product', 'service', 'idea',
  'what does', 'tell me about', 'describe', 'explain', 'details about',
  'what kind of', 'what type of', 'industry', 'market', 'target audience',
  'business model', 'revenue model', 'customers', 'users'
]

export default function GrowthStrategistPage() {
  const { user } = useUser()
  useSyncUser()

  // Chat state
  const [currentMessage, setCurrentMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  
  // Idea selection state
  const [validatedIdeas, setValidatedIdeas] = useState<ValidatedIdea[]>([])
  const [showIdeaHelper, setShowIdeaHelper] = useState(false)
  const [showIdeaPanel, setShowIdeaPanel] = useState(false)
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations and validated ideas on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return

      try {
        // Load conversations
        const conversationsResponse = await fetch(`/api/growth-conversations?user_id=${user.id}`)
        const { conversations: convos } = await conversationsResponse.json()
        setConversations(convos || [])

        // Load validated ideas with proper error handling
        const ideasResponse = await fetch(`/api/validated-ideas?user_id=${user.id}`)
        const ideasData = await ideasResponse.json()
        
        if (ideasResponse.ok && ideasData.ideas) {
          console.log('Loaded validated ideas:', ideasData.ideas) // Debug log
          setValidatedIdeas(ideasData.ideas)
        } else {
          console.error('Failed to load validated ideas:', ideasData.error)
          setValidatedIdeas([])
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setValidatedIdeas([])
      }
    }

    loadData()
  }, [user?.id])

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id || !currentConversation) return

      try {
        const response = await fetch(
          `/api/growth-messages?user_id=${user.id}&conversation_id=${currentConversation}`
        )
        const { messages: msgs } = await response.json()
        setMessages(msgs || [])
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
  }, [user?.id, currentConversation])

  // Check if AI response contains startup detail questions
  const containsStartupDetailRequest = (text: string): boolean => {
    const lowercaseText = text.toLowerCase()
    return STARTUP_DETAIL_KEYWORDS.some(keyword => lowercaseText.includes(keyword)) &&
           (lowercaseText.includes('?') || lowercaseText.includes('tell me') || lowercaseText.includes('describe'))
  }

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || currentMessage.trim()
    if (!user?.id || !messageToSend) return

    setCurrentMessage('')
    setIsTyping(true)
    setShowIdeaHelper(false)
    setShowIdeaPanel(false)

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: 'temp-user',
      role: 'user',
      content: messageToSend,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      const response = await fetch('/api/growth-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          conversation_id: currentConversation,
          message: messageToSend,
          conversation_title: conversations.find(c => c.id === currentConversation)?.conversation_title || 
                               `Growth Chat - ${new Date().toLocaleDateString()}`
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update current conversation ID if it was a new chat
        if (!currentConversation) {
          setCurrentConversation(data.conversation_id)
        }

        // Remove temp message and add real messages
        setMessages(prev => prev.filter(m => m.id !== 'temp-user'))
        
        // Reload messages to get the real ones from database
        const messagesResponse = await fetch(
          `/api/growth-messages?user_id=${user.id}&conversation_id=${data.conversation_id}`
        )
        const { messages: newMessages } = await messagesResponse.json()
        setMessages(newMessages || [])

        // Check if AI's response contains startup detail request
        const aiResponse = data.response
        if (containsStartupDetailRequest(aiResponse) && validatedIdeas.length > 0) {
          setShowIdeaHelper(true)
        }

        // Refresh conversations list
        const convoResponse = await fetch(`/api/growth-conversations?user_id=${user.id}`)
        const { conversations: updatedConvos } = await convoResponse.json()
        setConversations(updatedConvos || [])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.filter(m => m.id !== 'temp-user'))
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStarterClick = (starterMessage: string) => {
    handleSendMessage(starterMessage)
  }

  const handleIdeaSelect = (idea: ValidatedIdea) => {
    console.log('Selected idea:', idea) // Debug log
    
    const ideaDetails = `Here are the comprehensive details about my startup:

**💡 Startup Idea:** ${idea.idea_title}

**📝 Detailed Description:** ${idea.idea_description || 'Not specified'}

**🎯 Target Audience:** ${idea.target_audience || 'Not specified'}

**❓ Problem We're Solving:** ${idea.problem_solving || 'Not specified'}

**⭐ Unique Value Proposition:** ${idea.unique_value_proposition || 'Not specified'}

**💼 Business Model:** ${idea.business_model || 'Not specified'}

**🔧 Technical Feasibility:** ${idea.technical_feasibility || 'Not specified'}

**📋 Resource Requirements:** ${idea.resource_requirements || 'Not specified'}

**📊 Validation Score:** ${idea.overall_score}/100

**📅 Validated On:** ${new Date(idea.created_at).toLocaleDateString()}

Based on these comprehensive details about my startup, please provide your expert growth strategy advice and recommendations.`

    setShowIdeaHelper(false)
    setShowIdeaPanel(false)
    handleSendMessage(ideaDetails)
  }

  const startNewConversation = () => {
    setCurrentConversation(null)
    setMessages([])
    setSidebarOpen(false)
    setShowIdeaHelper(false)
    setShowIdeaPanel(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation.id)
    setSidebarOpen(false)
    setShowIdeaHelper(false)
    setShowIdeaPanel(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const MessageBubble = ({ message }: { message: Message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start gap-3 max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
          message.role === 'user' 
            ? 'bg-blue-500' 
            : 'bg-gradient-to-br from-purple-500 to-indigo-600'
        }`}>
          {message.role === 'user' ? user?.firstName?.charAt(0) || 'U' : '🚀'}
        </div>
        
        {/* Message Content */}
        <div className={`rounded-xl px-4 py-3 shadow-sm ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-800 border border-gray-100'
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          <div className={`text-xs mt-1 opacity-70 ${
            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const ConversationCard = ({ conversation }: { conversation: Conversation }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => selectConversation(conversation)}
      className={`p-3 rounded-lg cursor-pointer transition-all border ${
        currentConversation === conversation.id
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <h3 className="font-medium text-gray-800 mb-1 text-sm truncate">
        {conversation.conversation_title}
      </h3>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{conversation.message_count} messages</span>
        <span>{new Date(conversation.updated_at).toLocaleDateString()}</span>
      </div>
    </motion.div>
  )

  const IdeaHelperButton = () => (
    <AnimatePresence>
      {showIdeaHelper && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute bottom-full right-0 mb-2"
        >
          <button
            onClick={() => setShowIdeaPanel(true)}
            className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-110 flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <span className="text-lg">💡</span>
            Use validated idea
          </button>
          <button
            onClick={() => setShowIdeaHelper(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 text-white rounded-full text-xs hover:bg-gray-500 transition-colors"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const IdeaPanel = () => (
    <AnimatePresence>
      {showIdeaPanel && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowIdeaPanel(false)}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 border-l border-gray-200"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      💡
                    </div>
                    <h3 className="font-semibold text-gray-800">Select Validated Idea</h3>
                  </div>
                  <button
                    onClick={() => setShowIdeaPanel(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Choose from your {validatedIdeas.length} validated startup ideas
                </p>
              </div>

              {/* Ideas List */}
              <div className="flex-1 overflow-y-auto p-4">
                {validatedIdeas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-3">💡</div>
                    <p className="text-sm">No validated ideas found</p>
                    <p className="text-xs mt-1">Validate some ideas first!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {validatedIdeas.map((idea) => (
                      <motion.button
                        key={idea.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleIdeaSelect(idea)}
                        className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 text-left hover:border-blue-200 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors text-sm">
                            {idea.idea_title}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getScoreColor(idea.overall_score)}`}>
                            {idea.overall_score}/100
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {idea.idea_description}
                        </p>
                        
                        {/* Preview of key details */}
                        <div className="space-y-1 mb-2">
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Target:</span> {idea.target_audience ? idea.target_audience.substring(0, 40) + '...' : 'Not specified'}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Business Model:</span> {idea.business_model ? idea.business_model.substring(0, 40) + '...' : 'Not specified'}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Validated on {new Date(idea.created_at).toLocaleDateString()}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowIdeaPanel(false)}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  I'll type manually instead
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  if (!user) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to chat with your growth strategist</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm">
                🚀
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Growth Strategist</h1>
                <p className="text-xs text-gray-600">Your AI mentor Alex</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4 flex-shrink-0">
          <button
            onClick={startNewConversation}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <span>✨</span>
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Recent Conversations
          </h3>
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <div className="text-2xl mb-2">💭</div>
                <p className="text-xs">No conversations yet</p>
                <p className="text-xs opacity-75">Start chatting to begin!</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationCard key={conversation.id} conversation={conversation} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Chat Header - Fixed */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                ☰
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm">
                🚀
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Alex, Growth Strategist</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600">Online and ready to help</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl mb-6 mx-auto">
                  🚀
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Hey {user?.firstName}! I'm Alex 👋
                </h2>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                  I'm your personal growth strategist. Let's chat about scaling your startup, user acquisition, or any growth challenges you're facing!
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {STARTER_PROMPTS.map((starter, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleStarterClick(starter.message)}
                      className="p-4 bg-white/80 rounded-xl shadow-sm border border-gray-200 text-left hover:shadow-md hover:border-purple-200 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl group-hover:scale-110 transition-transform">
                          {starter.emoji}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                            {starter.title}
                          </h3>
                          <p className="text-sm text-gray-600">{starter.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="flex items-start gap-3 max-w-[75%]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                        🚀
                      </div>
                      <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          <span className="text-gray-500 text-xs">Alex is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto relative">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about growing your startup..."
                  className="w-full p-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none bg-white text-sm"
                  rows={1}
                  style={{ 
                    minHeight: '44px',
                    maxHeight: '100px'
                  }}
                  disabled={isTyping}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 100) + 'px';
                  }}
                />
                <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                  Press Enter
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!currentMessage.trim() || isTyping}
                  className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-sm text-sm"
                  style={{ minHeight: '44px' }}
                >
                  {isTyping ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Send
                      <span className="text-sm">🚀</span>
                    </>
                  )}
                </button>
                
                {/* Idea Helper Button */}
                <IdeaHelperButton />
              </div>
            </div>
          </div>
        </div>

        {/* Idea Selection Panel */}
        <IdeaPanel />
      </div>
    </div>
  )
}
