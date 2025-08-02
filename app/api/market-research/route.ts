import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_INSTRUCTION = `You are an expert market research analyst with 25+ years of experience. Provide comprehensive, data-driven market analysis focusing on actionable insights.

ANALYSIS AREAS:
1. Market Size & Growth Analysis
2. Industry Trends & Dynamics  
3. Competitive Landscape
4. Customer Segments & Behavior
5. Market Opportunities & Gaps
6. Entry Barriers & Challenges
7. Regulatory & Economic Factors
8. Technology Impact & Disruption

RESPONSE FORMAT (JSON ONLY):
{
  "market_overview": {
    "market_size_usd": number,
    "growth_rate_percentage": number,
    "market_maturity": "Emerging" | "Growth" | "Mature" | "Declining",
    "key_drivers": ["driver1", "driver2", "driver3"]
  },
  "industry_trends": [
    {
      "trend_name": "string",
      "description": "detailed description",
      "impact_level": "High" | "Medium" | "Low",
      "time_horizon": "Short-term" | "Medium-term" | "Long-term",
      "opportunities": ["opportunity1", "opportunity2"]
    }
  ],
  "competitive_landscape": {
    "competition_intensity": "Low" | "Medium" | "High" | "Very High",
    "key_players": [
      {
        "company_name": "string",
        "market_share": number,
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "threat_level": "Low" | "Medium" | "High" | "Critical"
      }
    ],
    "market_gaps": ["gap1", "gap2", "gap3"]
  },
  "customer_analysis": {
    "primary_segments": [
      {
        "segment_name": "string",
        "size_percentage": number,
        "characteristics": ["char1", "char2"],
        "pain_points": ["pain1", "pain2"],
        "spending_power": "Low" | "Medium" | "High"
      }
    ],
    "buying_behavior": "string",
    "decision_factors": ["factor1", "factor2", "factor3"]
  },
  "market_opportunities": [
    {
      "opportunity_title": "string",
      "description": "detailed description",
      "potential_size_usd": number,
      "difficulty_level": "Low" | "Medium" | "High",
      "time_to_market": "3-6 months" | "6-12 months" | "12-24 months" | "24+ months",
      "required_investment": "Low" | "Medium" | "High",
      "success_probability": number
    }
  ],
  "entry_barriers": [
    {
      "barrier_type": "string",
      "severity": "Low" | "Medium" | "High",
      "description": "string",
      "mitigation_strategies": ["strategy1", "strategy2"]
    }
  ],
  "regulatory_environment": {
    "regulatory_complexity": "Low" | "Medium" | "High",
    "key_regulations": ["reg1", "reg2"],
    "compliance_requirements": ["req1", "req2"],
    "regulatory_trends": ["trend1", "trend2"]
  },
  "technology_impact": {
    "disruption_level": "Low" | "Medium" | "High",
    "emerging_technologies": ["tech1", "tech2"],
    "adoption_timeline": "string",
    "impact_on_traditional_players": "string"
  },
  "recommendations": [
    {
      "priority": "High" | "Medium" | "Low",
      "recommendation": "string",
      "rationale": "string",
      "expected_impact": "string"
    }
  ],
  "risk_assessment": {
    "overall_risk_level": "Low" | "Medium" | "High",
    "key_risks": ["risk1", "risk2", "risk3"],
    "mitigation_strategies": ["strategy1", "strategy2"]
  }
}

Focus on actionable insights and quantifiable data where possible.`

export async function POST(request: Request) {
  try {
    const {
      user_id,
      project_title,
      industry_sector,
      target_market,
      geographic_focus,
      research_goals
    } = await request.json()

    if (!user_id || !project_title || !industry_sector || !target_market) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create initial record
    const { data: research, error: insertError } = await supabase
      .from('market_research')
      .insert({
        user_id,
        project_title,
        industry_sector,
        target_market,
        geographic_focus,
        research_goals,
        research_result: {},
        status: 'processing'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json({ error: 'Failed to save research project' }, { status: 500 })
    }

    // Prepare prompt for Gemini
    const prompt = `
MARKET RESEARCH REQUEST:

Project: ${project_title}
Industry: ${industry_sector}
Target Market: ${target_market}
Geographic Focus: ${geographic_focus || 'Global'}
Research Goals: ${research_goals || 'Comprehensive market analysis'}

Please provide a comprehensive market research analysis covering all specified areas with actionable insights and data-driven recommendations.`

    // Call Gemini API
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let researchResult
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      researchResult = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError)
      return NextResponse.json({ error: 'Failed to process AI response' }, { status: 500 })
    }

    // Update the research record
    const { error: updateError } = await supabase
      .from('market_research')
      .update({
        research_result: researchResult,
        status: 'completed'
      })
      .eq('id', research.id)

    if (updateError) {
      console.error('Failed to update research:', updateError)
      return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
    }

    // Store trends, competitors, and opportunities in separate tables
    if (researchResult.industry_trends) {
      for (const trend of researchResult.industry_trends) {
        await supabase.from('market_trends').insert({
          user_id,
          research_id: research.id,
          trend_name: trend.trend_name,
          trend_data: trend,
          impact_score: trend.impact_level === 'High' ? 80 : trend.impact_level === 'Medium' ? 60 : 40
        })
      }
    }

    if (researchResult.competitive_landscape?.key_players) {
      for (const competitor of researchResult.competitive_landscape.key_players) {
        await supabase.from('competitor_analysis').insert({
          user_id,
          research_id: research.id,
          competitor_name: competitor.company_name,
          competitor_data: competitor,
          threat_level: competitor.threat_level
        })
      }
    }

    if (researchResult.market_opportunities) {
      for (const opportunity of researchResult.market_opportunities) {
        await supabase.from('market_opportunities').insert({
          user_id,
          research_id: research.id,
          opportunity_title: opportunity.opportunity_title,
          opportunity_data: opportunity,
          potential_score: opportunity.success_probability || 50
        })
      }
    }

    return NextResponse.json({
      success: true,
      research_id: research.id,
      result: researchResult
    })

  } catch (error) {
    console.error('Market research error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('market_research')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ research_projects: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
