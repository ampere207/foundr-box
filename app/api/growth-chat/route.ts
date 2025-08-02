import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_INSTRUCTION = `You are Alex, a world-class Growth Strategist and Business Mentor with 20+ years of experience helping startups scale from zero to millions. You've worked with unicorn startups, coached 500+ founders, and have deep expertise in growth hacking, user acquisition, retention, and scaling strategies.

PERSONALITY:
- Friendly, encouraging, and approachable mentor
- Direct and actionable advice without fluff
- Uses real examples and case studies
- Asks probing questions to understand context
- Celebrates wins and helps overcome challenges
- Speaks like a knowledgeable friend, not a corporate consultant

EXPERTISE AREAS:
1. User Acquisition & Growth Hacking
2. Product-Market Fit Optimization
3. Viral & Referral Mechanics
4. Content Marketing & SEO
5. Paid Acquisition & Performance Marketing
6. Retention & Engagement Strategies
7. Conversion Rate Optimization
8. Growth Team Building
9. Metrics & Analytics
10. Fundraising & Scaling

CONVERSATION STYLE:
- Start conversations warmly and personally
- Ask follow-up questions to understand the founder's situation
- Provide specific, actionable advice
- Share relevant examples from successful companies
- Break down complex strategies into actionable steps
- Always end with a clear next action or question

RESPONSE FORMAT:
- Keep responses conversational and engaging
- Use emojis sparingly but effectively
- Structure longer responses with bullet points or numbers
- Always provide 1-3 specific action items
- Ask a follow-up question to continue the conversation

Remember: You're not just giving advice - you're building a relationship and helping founders grow their businesses systematically.`

export async function POST(request: Request) {
  try {
    const { 
      user_id, 
      conversation_id, 
      message, 
      conversation_title 
    } = await request.json()

    if (!user_id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let currentConversationId = conversation_id

    // Create new conversation if none provided
    if (!conversation_id) {
      const { data: newConversation, error: conversationError } = await supabase
        .from('growth_conversations')
        .insert({
          user_id,
          conversation_title: conversation_title || 'Growth Strategy Chat',
          message_count: 0
        })
        .select()
        .single()

      if (conversationError) {
        console.error('Failed to create conversation:', conversationError)
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }

      currentConversationId = newConversation.id
    }

    // Save user message
    await supabase
      .from('growth_messages')
      .insert({
        conversation_id: currentConversationId,
        user_id,
        role: 'user',
        content: message
      })

    // Get conversation history for context
    const { data: messageHistory } = await supabase
      .from('growth_messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })
      .limit(20) // Last 20 messages for context

    // Build conversation context
    const conversationContext = messageHistory
      ?.map(msg => `${msg.role === 'user' ? 'Founder' : 'Alex'}: ${msg.content}`)
      .join('\n\n') || ''

    // Prepare prompt with context
    const prompt = `Previous conversation:
${conversationContext}

Founder: ${message}

Alex: `

    // Call Gemini API
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()

    // Save AI response
    await supabase
      .from('growth_messages')
      .insert({
        conversation_id: currentConversationId,
        user_id,
        role: 'assistant',
        content: aiResponse
      })

    // Update conversation metadata
    const messageCount = (messageHistory?.length || 0) + 2
    await supabase
      .from('growth_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: messageCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentConversationId)

    // Extract insights from the conversation (simple keyword detection)
    const insights = await extractInsights(aiResponse, user_id, currentConversationId)

    return NextResponse.json({
      success: true,
      conversation_id: currentConversationId,
      response: aiResponse,
      insights: insights
    })

  } catch (error) {
    console.error('Growth chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to extract actionable insights
async function extractInsights(response: string, user_id: string, conversation_id: string) {
  const insights = []
  
  // Simple keyword-based insight extraction
  const strategyKeywords = ['strategy', 'approach', 'framework', 'method']
  const tacticKeywords = ['tactic', 'technique', 'hack', 'tip', 'action']
  const metricKeywords = ['metric', 'KPI', 'measure', 'track', 'analyze']
  
  if (strategyKeywords.some(keyword => response.toLowerCase().includes(keyword))) {
    insights.push({
      type: 'strategy',
      title: 'Growth Strategy Discussed',
      content: response.substring(0, 200) + '...',
      priority: 'high'
    })
  }
  
  if (tacticKeywords.some(keyword => response.toLowerCase().includes(keyword))) {
    insights.push({
      type: 'tactic',
      title: 'Actionable Tactic Shared',
      content: response.substring(0, 200) + '...',
      priority: 'medium'
    })
  }
  
  // Save insights to database
  for (const insight of insights) {
    await supabase
      .from('growth_insights')
      .insert({
        user_id,
        conversation_id,
        insight_type: insight.type,
        title: insight.title,
        content: insight.content,
        priority: insight.priority
      })
  }
  
  return insights
}
