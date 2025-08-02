import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_INSTRUCTION = `You are an expert startup idea validator with 20+ years of experience. Focus on CORE IDEA VALIDATION, not market research (that's handled separately).

EVALUATION CRITERIA (0-100 each):
1. Problem Clarity & Validation - Is the problem well-defined and real?
2. Solution Fit & Innovation - How well does the solution address the problem?
3. Value Proposition Strength - Is the value clear and compelling?
4. Technical Feasibility - Can this be built with current technology?
5. Business Model Viability - Does the monetization make sense?
6. Execution Readiness - How ready is this for implementation?

RESPONSE FORMAT (JSON ONLY):
{
  "overall_score": number (0-100),
  "category_scores": {
    "problem_clarity": number,
    "solution_fit": number,
    "value_proposition": number,
    "technical_feasibility": number,
    "business_model": number,
    "execution_readiness": number
  },
  "strengths": [
    "Clear strength about the core idea",
    "Another strength about execution",
    "Value proposition strength"
  ],
  "weaknesses": [
    "Specific weakness about the idea",
    "Implementation challenge",
    "Business model concern"
  ],
  "opportunities": [
    "How to improve the core concept",
    "Execution opportunity",
    "Value enhancement opportunity"
  ],
  "risks": [
    "Technical risk",
    "Execution risk",
    "Business model risk"
  ],
  "recommendations": [
    "Specific actionable recommendation",
    "Implementation suggestion",
    "Improvement recommendation"
  ],
  "next_steps": [
    "Immediate validation step",
    "Prototype/MVP step",
    "Testing step"
  ],
  "validation_methods": [
    "How to validate the problem",
    "How to test the solution",
    "How to validate value proposition"
  ],
  "feasibility_assessment": {
    "technical_complexity": "Low" | "Medium" | "High",
    "resource_intensity": "Low" | "Medium" | "High",
    "time_to_prototype": "1-2 weeks" | "1-2 months" | "3-6 months" | "6+ months"
  },
  "improvement_suggestions": [
    "How to make the idea stronger",
    "How to reduce risks",
    "How to improve execution"
  ],
  "success_likelihood": "Low" | "Medium" | "High",
  "innovation_level": "Incremental" | "Significant" | "Breakthrough"
}

Focus on idea quality, not market size. Be constructive and specific.`

export async function POST(request: Request) {
  try {
    const {
      user_id,
      idea_title,
      idea_description,
      target_audience,
      problem_solving,
      unique_value_proposition,
      business_model,
      technical_feasibility,
      resource_requirements
    } = await request.json()

    if (!user_id || !idea_title || !idea_description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create initial record
    const { data: validation, error: insertError } = await supabase
      .from('idea_validations')
      .insert({
        user_id,
        idea_title,
        idea_description,
        target_audience,
        problem_solving,
        unique_value_proposition,
        business_model,
        technical_feasibility,
        resource_requirements,
        validation_result: {},
        overall_score: 0,
        status: 'processing'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json({ error: 'Failed to save idea' }, { status: 500 })
    }

    // Prepare prompt for Gemini
    const prompt = `
STARTUP IDEA VALIDATION REQUEST:

Title: ${idea_title}

Description: ${idea_description}

Target Audience: ${target_audience || 'Not specified'}

Problem it Solves: ${problem_solving || 'Not specified'}

Unique Value Proposition: ${unique_value_proposition || 'Not specified'}

Business Model: ${business_model || 'Not specified'}

Technical Feasibility Thoughts: ${technical_feasibility || 'Not specified'}

Resource Requirements: ${resource_requirements || 'Not specified'}

Please provide a comprehensive IDEA validation analysis focusing on the core concept, solution quality, and execution potential. Avoid deep market analysis.`

    // Call Gemini API
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let validationResult
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      validationResult = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError)
      return NextResponse.json({ error: 'Failed to process AI response' }, { status: 500 })
    }

    // Update the validation record
    const { error: updateError } = await supabase
      .from('idea_validations')
      .update({
        validation_result: validationResult,
        overall_score: validationResult.overall_score || 0,
        status: 'completed'
      })
      .eq('id', validation.id)

    if (updateError) {
      console.error('Failed to update validation:', updateError)
      return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      validation_id: validation.id,
      result: validationResult
    })

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
