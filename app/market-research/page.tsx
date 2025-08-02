'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSyncUser } from '@/lib/syncUser'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

type MarketOverview = {
  market_size_usd: number
  growth_rate_percentage: number
  market_maturity: 'Emerging' | 'Growth' | 'Mature' | 'Declining'
  key_drivers: string[]
}

type IndustryTrend = {
  trend_name: string
  description: string
  impact_level: 'High' | 'Medium' | 'Low'
  time_horizon: 'Short-term' | 'Medium-term' | 'Long-term'
  opportunities: string[]
}

type KeyPlayer = {
  company_name: string
  market_share: number
  strengths: string[]
  weaknesses: string[]
  threat_level: 'Low' | 'Medium' | 'High' | 'Critical'
}

type CompetitiveLandscape = {
  competition_intensity: 'Low' | 'Medium' | 'High' | 'Very High'
  key_players: KeyPlayer[]
  market_gaps: string[]
}

type CustomerSegment = {
  segment_name: string
  size_percentage: number
  characteristics: string[]
  pain_points: string[]
  spending_power: 'Low' | 'Medium' | 'High'
}

type CustomerAnalysis = {
  primary_segments: CustomerSegment[]
  buying_behavior: string
  decision_factors: string[]
}

type MarketOpportunity = {
  opportunity_title: string
  description: string
  potential_size_usd: number
  difficulty_level: 'Low' | 'Medium' | 'High'
  time_to_market: string
  required_investment: 'Low' | 'Medium' | 'High'
  success_probability: number
}

type EntryBarrier = {
  barrier_type: string
  severity: 'Low' | 'Medium' | 'High'
  description: string
  mitigation_strategies: string[]
}

type RegulatoryEnvironment = {
  regulatory_complexity: 'Low' | 'Medium' | 'High'
  key_regulations: string[]
  compliance_requirements: string[]
  regulatory_trends: string[]
}

type TechnologyImpact = {
  disruption_level: 'Low' | 'Medium' | 'High'
  emerging_technologies: string[]
  adoption_timeline: string
  impact_on_traditional_players: string
}

type Recommendation = {
  priority: 'High' | 'Medium' | 'Low'
  recommendation: string
  rationale: string
  expected_impact: string
}

type RiskAssessment = {
  overall_risk_level: 'Low' | 'Medium' | 'High'
  key_risks: string[]
  mitigation_strategies: string[]
}

type ResearchResult = {
  market_overview: MarketOverview
  industry_trends: IndustryTrend[]
  competitive_landscape: CompetitiveLandscape
  customer_analysis: CustomerAnalysis
  market_opportunities: MarketOpportunity[]
  entry_barriers: EntryBarrier[]
  regulatory_environment: RegulatoryEnvironment
  technology_impact: TechnologyImpact
  recommendations: Recommendation[]
  risk_assessment: RiskAssessment
}

type MarketResearch = {
  id: string
  project_title: string
  industry_sector: string
  target_market: string
  geographic_focus: string
  research_goals: string
  research_result: ResearchResult
  created_at: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

const INDUSTRY_SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
  'Manufacturing', 'Real Estate', 'Food & Beverage', 'Transportation',
  'Energy', 'Entertainment', 'Fashion', 'Agriculture', 'Construction', 'Other'
]

const GEOGRAPHIC_REGIONS = [
  'Global', 'North America', 'United States', 'Canada', 'Europe',
  'United Kingdom', 'Germany', 'France', 'Asia Pacific', 'China',
  'India', 'Japan', 'Latin America', 'Middle East', 'Africa', 'Other'
]

export default function MarketResearchPage() {
  const { user } = useUser()
  useSyncUser()

  // Form state
  const [formData, setFormData] = useState({
    project_title: '',
    industry_sector: '',
    target_market: '',
    geographic_focus: 'Global',
    research_goals: ''
  })

  // UI state
  const [currentStep, setCurrentStep] = useState(0)
  const [isResearching, setIsResearching] = useState(false)
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null)
  const [previousResearch, setPreviousResearch] = useState<MarketResearch[]>([])
  const [activeTab, setActiveTab] = useState('new-research')
  const [selectedResearch, setSelectedResearch] = useState<MarketResearch | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'trends' | 'competitors' | 'opportunities' | 'customers'>('overview')

  const steps = [
    {
      title: 'Project Setup',
      description: 'Define your research project',
      icon: '🎯',
      fields: ['project_title', 'industry_sector']
    },
    {
      title: 'Market Definition',
      description: 'Specify your target market',
      icon: '🌍',
      fields: ['target_market', 'geographic_focus']
    },
    {
      title: 'Research Goals',
      description: 'What insights do you need',
      icon: '📊',
      fields: ['research_goals']
    }
  ]

  // Load previous research
  useEffect(() => {
    const loadResearch = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/market-research?user_id=${user.id}`)
        const { research_projects } = await response.json()
        setPreviousResearch(research_projects || [])
      } catch (error) {
        console.error('Error loading research:', error)
      }
    }

    loadResearch()
  }, [user?.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isStepComplete = (stepIndex: number) => {
    const step = steps[stepIndex]
    return step.fields.every(field => formData[field as keyof typeof formData].trim() !== '')
  }

  const canProceedToNext = () => {
    return isStepComplete(currentStep)
  }

  const handleNext = () => {
    if (canProceedToNext() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleStartResearch = async () => {
    if (!user?.id) return

    setIsResearching(true)
    setResearchResult(null)

    try {
      const response = await fetch('/api/market-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        setResearchResult(data.result)
        // Refresh research history
        const historyResponse = await fetch(`/api/market-research?user_id=${user.id}`)
        const { research_projects } = await historyResponse.json()
        setPreviousResearch(research_projects || [])
      } else {
        alert('Failed to conduct market research. Please try again.')
      }
    } catch (error) {
      console.error('Research error:', error)
      alert('An error occurred during research. Please try again.')
    } finally {
      setIsResearching(false)
    }
  }

  const resetForm = () => {
    setFormData({
      project_title: '',
      industry_sector: '',
      target_market: '',
      geographic_focus: 'Global',
      research_goals: ''
    })
    setCurrentStep(0)
    setResearchResult(null)
  }

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case 'Emerging': return 'text-blue-600 bg-blue-100'
      case 'Growth': return 'text-green-600 bg-green-100'
      case 'Mature': return 'text-yellow-600 bg-yellow-100'
      case 'Declining': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'High': return 'text-orange-600 bg-orange-100'
      case 'Very High': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'High': return 'text-orange-600 bg-orange-100'
      case 'Critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const ProgressIndicator = () => (
    <div className="flex items-center justify-between mb-12">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold text-sm transition-all duration-300 ${
            index < currentStep 
              ? 'bg-green-500 text-white shadow-lg' 
              : index === currentStep 
              ? 'bg-blue-500 text-white scale-110 shadow-xl' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            <div className="text-xl mb-1">{index < currentStep ? '✓' : step.icon}</div>
            <div className="text-xs font-semibold">{index + 1}</div>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-20 h-2 mx-4 rounded-full transition-all duration-300 ${
              index < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const ResearchCard = ({ research }: { research: MarketResearch }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
      onClick={() => setSelectedResearch(research)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
          {research.project_title}
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMaturityColor(research.research_result?.market_overview?.market_maturity || 'Emerging')}`}>
          {research.research_result?.market_overview?.market_maturity || 'Emerging'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Industry</p>
          <p className="text-sm font-semibold text-gray-800">{research.industry_sector}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Market Size</p>
          <p className="text-sm font-semibold text-gray-800">
            ${research.research_result?.market_overview?.market_size_usd?.toLocaleString() || 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{new Date(research.created_at).toLocaleDateString()}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{research.geographic_focus}</span>
          <span className={`px-2 py-1 rounded-full ${getIntensityColor(research.research_result?.competitive_landscape?.competition_intensity || 'Medium')}`}>
            {research.research_result?.competitive_landscape?.competition_intensity || 'Medium'} Competition
          </span>
        </div>
      </div>
    </motion.div>
  )

  const MarketOverviewSection = ({ result }: { result: ResearchResult }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Market Size & Growth */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">💰</span>
          Market Size & Growth
        </h3>
        <div className="space-y-4">
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ${result.market_overview.market_size_usd.toLocaleString()}
            </div>
            <p className="text-gray-600">Total Market Size</p>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Growth Rate</span>
            <span className="text-2xl font-bold text-green-600">
              {result.market_overview.growth_rate_percentage}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Market Maturity</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMaturityColor(result.market_overview.market_maturity)}`}>
              {result.market_overview.market_maturity}
            </span>
          </div>
        </div>
      </div>

      {/* Key Market Drivers */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">🚀</span>
          Key Market Drivers
        </h3>
        <ul className="space-y-3">
          {result.market_overview.key_drivers.map((driver, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-700">{driver}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Competition Intensity */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">⚔️</span>
          Competitive Environment
        </h3>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-lg font-bold border-4 ${getIntensityColor(result.competitive_landscape.competition_intensity).replace('text-', 'border-').replace('bg-', 'text-')}`}>
            {result.competitive_landscape.competition_intensity}
          </div>
          <p className="text-gray-600 mt-2">Competition Intensity</p>
          <div className="mt-4 text-sm text-gray-600">
            {result.competitive_landscape.key_players.length} Key Players Identified
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">⚠️</span>
          Risk Assessment
        </h3>
        <div className="text-center mb-4">
          <div className={`px-4 py-2 rounded-full text-lg font-semibold inline-block ${getImpactColor(result.risk_assessment.overall_risk_level)}`}>
            {result.risk_assessment.overall_risk_level} Risk
          </div>
        </div>
        <ul className="space-y-2">
          {result.risk_assessment.key_risks.slice(0, 3).map((risk, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
              {risk}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  const TrendsSection = ({ result }: { result: ResearchResult }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.industry_trends.map((trend, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800">{trend.trend_name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getImpactColor(trend.impact_level)}`}>
                {trend.impact_level}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{trend.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time Horizon:</span>
                <span className="font-semibold">{trend.time_horizon}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Opportunities:</p>
                <ul className="space-y-1">
                  {trend.opportunities.slice(0, 2).map((opp, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const CompetitorsSection = ({ result }: { result: ResearchResult }) => (
    <div className="space-y-6">
      {/* Market Share Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Market Share Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={result.competitive_landscape.key_players}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="market_share"
                label={({ company_name, market_share }) => `${company_name}: ${market_share}%`}
              >
                {result.competitive_landscape.key_players.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Competitor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {result.competitive_landscape.key_players.map((player, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800">{player.company_name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-600">{player.market_share}%</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getThreatColor(player.threat_level)}`}>
                  {player.threat_level}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-semibold text-green-600 mb-2">Strengths</h5>
                <ul className="space-y-1">
                  {player.strengths.map((strength, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-red-600 mb-2">Weaknesses</h5>
                <ul className="space-y-1">
                  {player.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Gaps */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">🎯</span>
          Market Gaps & Opportunities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.competitive_landscape.market_gaps.map((gap, index) => (
            <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-purple-700 font-medium">{gap}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const OpportunitiesSection = ({ result }: { result: ResearchResult }) => (
    <div className="space-y-6">
      {/* Opportunity Matrix */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Opportunity Matrix</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.market_opportunities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="opportunity_title" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'success_probability' ? `${value}%` : `$${value?.toLocaleString()}`,
                  name === 'success_probability' ? 'Success Probability' : 'Market Size'
                ]}
              />
              <Bar dataKey="potential_size_usd" fill="#3b82f6" name="Market Size" />
              <Bar dataKey="success_probability" fill="#10b981" name="Success Probability" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {result.market_opportunities.map((opportunity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800">{opportunity.opportunity_title}</h4>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">
                  ${opportunity.potential_size_usd.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Market Size</div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{opportunity.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Success Probability</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${opportunity.success_probability}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{opportunity.success_probability}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Time to Market</p>
                <p className="text-sm font-semibold text-gray-800">{opportunity.time_to_market}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className={`px-2 py-1 rounded-full ${getImpactColor(opportunity.difficulty_level)}`}>
                {opportunity.difficulty_level} Difficulty
              </span>
              <span className={`px-2 py-1 rounded-full ${getImpactColor(opportunity.required_investment)}`}>
                {opportunity.required_investment} Investment
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const CustomersSection = ({ result }: { result: ResearchResult }) => (
    <div className="space-y-6">
      {/* Customer Segments */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Customer Segments</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={result.customer_analysis.primary_segments}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="size_percentage"
                label={({ segment_name, size_percentage }) => `${segment_name}: ${size_percentage}%`}
              >
                {result.customer_analysis.primary_segments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {result.customer_analysis.primary_segments.map((segment, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800">{segment.segment_name}</h4>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">{segment.size_percentage}%</div>
                <div className="text-xs text-gray-500">Market Share</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold text-blue-600 mb-2">Characteristics</h5>
                <ul className="space-y-1">
                  {segment.characteristics.map((char, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-red-600 mb-2">Pain Points</h5>
                <ul className="space-y-1">
                  {segment.pain_points.map((pain, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Spending Power:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  segment.spending_power === 'High' ? 'bg-green-100 text-green-600' :
                  segment.spending_power === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {segment.spending_power}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buying Behavior */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm">🛒</span>
          Buying Behavior & Decision Factors
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Buying Behavior</h4>
            <p className="text-gray-600">{result.customer_analysis.buying_behavior}</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Key Decision Factors</h4>
            <ul className="space-y-2">
              {result.customer_analysis.decision_factors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const DetailedResults = ({ result }: { result: ResearchResult }) => (
    <div className="space-y-8">
      {/* View Mode Navigation */}
      <div className="flex justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'trends', label: 'Trends', icon: '📈' },
            { id: 'competitors', label: 'Competitors', icon: '⚔️' },
            { id: 'opportunities', label: 'Opportunities', icon: '🎯' },
            { id: 'customers', label: 'Customers', icon: '👥' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                viewMode === mode.id
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span>{mode.icon}</span>
              <span className="hidden md:inline">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content based on view mode */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'overview' && <MarketOverviewSection result={result} />}
          {viewMode === 'trends' && <TrendsSection result={result} />}
          {viewMode === 'competitors' && <CompetitorsSection result={result} />}
          {viewMode === 'opportunities' && <OpportunitiesSection result={result} />}
          {viewMode === 'customers' && <CustomersSection result={result} />}
        </motion.div>
      </AnimatePresence>

      {/* Recommendations Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">💡</span>
          Strategic Recommendations
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {result.recommendations.map((rec, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  rec.priority === 'High' ? 'bg-red-200 text-red-800' :
                  rec.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {rec.priority} Priority
                </span>
              </div>
              <h4 className="text-lg font-bold mb-2">{rec.recommendation}</h4>
              <p className="text-sm opacity-90 mb-3">{rec.rationale}</p>
              <div className="text-xs opacity-80">
                <strong>Expected Impact:</strong> {rec.expected_impact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access market research tools</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-4">
            📊 Market Research
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Get comprehensive market insights, competitive analysis, and strategic opportunities with AI-powered research
          </p>
        </motion.header>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/20">
            <button
              onClick={() => setActiveTab('new-research')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'new-research'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span className="text-xl">🔬</span>
              New Research
            </button>
            <button
              onClick={() => setActiveTab('research-history')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'research-history'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span className="text-xl">📚</span>
              Research History ({previousResearch.length})
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'research-history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {previousResearch.length === 0 ? (
                <div className="text-center py-20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="text-8xl mb-6 text-gray-300"
                  >
                    📊
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-600 mb-4">No research projects yet</h3>
                  <p className="text-gray-500 mb-8 text-lg">Start your first market research project!</p>
                  <button
                    onClick={() => setActiveTab('new-research')}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    🔬 Start First Research
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {previousResearch.map((research, index) => (
                    <motion.div
                      key={research.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ResearchCard research={research} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : researchResult ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">📊 Research Results</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setResearchResult(null)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all transform hover:scale-105 shadow-md"
                  >
                    ← Back to Form
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
                  >
                    🔬 New Research
                  </button>
                </div>
              </div>
              <DetailedResults result={researchResult} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
            >
              <ProgressIndicator />

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  {steps[currentStep].icon}
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 text-lg">{steps[currentStep].description}</p>
              </div>

              <div className="space-y-8 mb-8">
                {currentStep === 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        value={formData.project_title}
                        onChange={(e) => handleInputChange('project_title', e.target.value)}
                        placeholder="e.g., SaaS Platform Market Analysis, E-commerce Trend Research"
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Industry Sector *
                      </label>
                      <select
                        value={formData.industry_sector}
                        onChange={(e) => handleInputChange('industry_sector', e.target.value)}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                      >
                        <option value="">Select an industry...</option>
                        {INDUSTRY_SECTORS.map((sector) => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {currentStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Target Market *
                      </label>
                      <textarea
                        value={formData.target_market}
                        onChange={(e) => handleInputChange('target_market', e.target.value)}
                        placeholder="Describe your target market in detail. Who are your ideal customers? What segments are you focusing on? Include demographics, behaviors, and specific characteristics."
                        rows={4}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Geographic Focus
                      </label>
                      <select
                        value={formData.geographic_focus}
                        onChange={(e) => handleInputChange('geographic_focus', e.target.value)}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                      >
                        {GEOGRAPHIC_REGIONS.map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Research Goals & Objectives *
                    </label>
                    <textarea
                      value={formData.research_goals}
                      onChange={(e) => handleInputChange('research_goals', e.target.value)}
                      placeholder="What specific insights are you looking for? Are you entering a new market, launching a product, analyzing competitors, or exploring opportunities? The more specific you are, the better insights you'll receive."
                      rows={6}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-8 py-4 bg-gray-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all shadow-md"
                >
                  ← Previous
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceedToNext()}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    onClick={handleStartResearch}
                    disabled={!canProceedToNext() || isResearching}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center gap-3 shadow-lg"
                  >
                    {isResearching ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Researching Market...
                      </>
                    ) : (
                      <>
                        🔬 Start Market Research
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Research Modal */}
        <AnimatePresence>
          {selectedResearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 backdrop-blur-sm"
              onClick={() => setSelectedResearch(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">{selectedResearch.project_title}</h2>
                  <button
                    onClick={() => setSelectedResearch(null)}
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors text-lg"
                  >
                    ✕
                  </button>
                </div>
                <DetailedResults result={selectedResearch.research_result} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
