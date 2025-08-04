import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_INSTRUCTION = `You are an expert pitch deck strategist and startup advisor with 15+ years of experience helping entrepreneurs craft winning presentations. Your role is to create comprehensive, slide-by-slide pitch deck structures optimized for the specific idea provided.

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanations, no code blocks. Just pure JSON starting with { and ending with }.

RESPONSE FORMAT (JSON ONLY):
{
  "executive_summary": {
    "pitch_theme": "string",
    "key_narrative": "string",
    "target_audience": "Angel Investors",
    "presentation_duration": "10 minutes",
    "total_slides": 12
  },
  "slides": [
    {
      "slide_number": 1,
      "title": "string",
      "purpose": "string",
      "content_strategy": "string",
      "key_elements": ["element1", "element2", "element3"],
      "visual_recommendations": "string",
      "talking_points": ["point1", "point2", "point3"],
      "duration_seconds": 60,
      "design_tips": "string"
    }
  ],
  "storytelling_flow": {
    "hook": "string",
    "problem_narrative": "string", 
    "solution_reveal": "string",
    "market_opportunity": "string",
    "competitive_advantage": "string",
    "traction_story": "string",
    "financial_projection": "string",
    "call_to_action": "string"
  },
  "design_guidelines": {
    "color_scheme": "string",
    "typography_recommendations": "string",
    "visual_style": "Modern",
    "image_suggestions": ["suggestion1", "suggestion2"],
    "chart_types": ["chart1", "chart2"],
    "branding_tips": "string"
  },
  "presenter_tips": {
    "opening_strategy": "string",
    "body_language": "string",
    "transition_techniques": ["technique1", "technique2"],
    "handling_questions": "string",
    "closing_strategy": "string"
  },
  "customization_suggestions": [
    {
      "audience_type": "string",
      "modifications": "string",
      "emphasis_areas": ["area1", "area2"]
    }
  ],
  "success_metrics": {
    "pitch_effectiveness_score": 75,
    "investor_readiness": "Investment Ready",
    "strengths": ["strength1", "strength2", "strength3"],
    "improvement_areas": ["area1", "area2", "area3"]
  }
}

Return ONLY this JSON structure with actual content. No additional text, explanations, or formatting.`

// Fallback pitch content in case of AI failure
const createFallbackPitch = (ideaTitle: string, ideaDescription: string) => ({
  executive_summary: {
    pitch_theme: `Investor presentation for ${ideaTitle}`,
    key_narrative: "A compelling startup opportunity with strong market potential",
    target_audience: "VCs",
    presentation_duration: "10 minutes",
    total_slides: 10
  },
  slides: [
    {
      slide_number: 1,
      title: "Problem",
      purpose: "Establish the pain point your startup solves",
      content_strategy: "Start with a relatable problem that your target audience experiences",
      key_elements: ["Problem statement", "Market pain point", "Current solutions limitations"],
      visual_recommendations: "Use compelling statistics or customer quotes",
      talking_points: ["Describe the problem clearly", "Show market size affected", "Explain why it matters now"],
      duration_seconds: 60,
      design_tips: "Use bold, impactful visuals that resonate emotionally"
    },
    {
      slide_number: 2,
      title: "Solution",
      purpose: "Present your unique solution to the identified problem",
      content_strategy: "Show how your product/service elegantly solves the problem",
      key_elements: ["Core solution", "Key features", "Unique approach"],
      visual_recommendations: "Product screenshots, demos, or mockups",
      talking_points: ["Explain your solution simply", "Highlight key differentiators", "Show ease of use"],
      duration_seconds: 90,
      design_tips: "Make the solution feel tangible and achievable"
    }
  ],
  storytelling_flow: {
    hook: "Start with a compelling problem that everyone can relate to",
    problem_narrative: "Build urgency around the pain point",
    solution_reveal: "Present your solution as the obvious answer",
    market_opportunity: "Show the massive potential",
    competitive_advantage: "Explain why you'll win",
    traction_story: "Prove early success and momentum",
    financial_projection: "Demonstrate clear path to profitability",
    call_to_action: "Make a specific, compelling ask"
  },
  design_guidelines: {
    color_scheme: "Professional blue and white with accent colors",
    typography_recommendations: "Clean, modern fonts like Helvetica or Arial",
    visual_style: "Modern",
    image_suggestions: ["High-quality product shots", "Customer testimonials"],
    chart_types: ["Bar charts", "Line graphs"],
    branding_tips: "Keep consistent colors and fonts throughout"
  },
  presenter_tips: {
    opening_strategy: "Start with a compelling hook or question",
    body_language: "Maintain confident posture and eye contact",
    transition_techniques: ["Use connecting phrases", "Reference previous slides"],
    handling_questions: "Listen carefully and provide concise answers",
    closing_strategy: "End with a clear call to action"
  },
  customization_suggestions: [
    {
      audience_type: "Angel Investors",
      modifications: "Focus more on team and early traction",
      emphasis_areas: ["Team experience", "Early customers"]
    }
  ],
  success_metrics: {
    pitch_effectiveness_score: 70,
    investor_readiness: "Getting Ready",
    strengths: ["Clear problem definition", "Innovative solution", "Strong team"],
    improvement_areas: ["Need more traction data", "Clearer financial projections", "Stronger competitive analysis"]
  }
})

export async function POST(request: Request) {
  try {
    const { user_id, idea_source, idea_id, idea_title, idea_description } = await request.json()

    if (!user_id || !idea_title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Prepare prompt for Gemini
    const prompt = `Create a comprehensive pitch deck strategy for this startup:

Title: ${idea_title}
Description: ${idea_description || 'No detailed description provided'}

Respond with ONLY valid JSON following the exact structure specified in the system instruction. No markdown formatting, no code blocks, no explanations - just pure JSON.`

    let pitchContent: Record<string, unknown>;

    try {
      // Call Gemini API
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION
      })

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log('Gemini raw response:', text.substring(0, 500) + '...')

      // Try multiple JSON extraction methods
      let jsonString = ''
      
      // Method 1: Look for complete JSON object
      const fullJsonMatch = text.match(/\{[\s\S]*\}/)
      if (fullJsonMatch) {
        jsonString = fullJsonMatch[0]
      } else {
        // Method 2: Clean the response of markdown formatting
        jsonString = text

          .replace(/```\s*/g, '')
          .replace(/^[^{]*/, '')
          .replace(/[^}]*$/, '')
          .trim()
      }

      // Method 3: If still no valid JSON, try extracting between first { and last }
      if (!jsonString.startsWith('{')) {
        const firstBrace = text.indexOf('{')
        const lastBrace = text.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = text.substring(firstBrace, lastBrace + 1)
        }
      }

      console.log('Extracted JSON string:', jsonString.substring(0, 200) + '...')

      // Parse the JSON
      if (jsonString) {
        pitchContent = JSON.parse(jsonString)
        console.log('Successfully parsed JSON from Gemini')
      } else {
        throw new Error('No valid JSON found in response')
      }

    } catch (aiError) {
      console.error('AI processing failed:', aiError)
      console.log('Using fallback pitch content')
      
      // Use fallback content
      pitchContent = createFallbackPitch(idea_title, idea_description || '')
    }

    // Validate required fields
    if (!pitchContent.executive_summary || !pitchContent.slides) {
      console.log('Invalid pitch content structure, using fallback')
      pitchContent = createFallbackPitch(idea_title, idea_description || '')
    }

    // Save to database
    const { data: pitch, error: insertError } = await supabase
      .from('pitch_assistant')
      .insert({
        user_id,
        idea_source,
        idea_id: idea_id || null,
        idea_title,
        idea_description: idea_description || '',
        pitch_content: pitchContent
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json({ error: 'Failed to save pitch' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pitch_id: pitch.id,
      pitch_content: pitchContent
    })

  } catch (error) {
    console.error('Pitch generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
