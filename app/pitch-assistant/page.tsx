'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSyncUser } from '@/lib/syncUser'
import { motion, AnimatePresence } from 'framer-motion'

type ValidatedIdea = {
  id: string
  idea_title: string
  idea_description: string
  overall_score: number
  created_at: string
}

type Slide = {
  slide_number: number
  title: string
  purpose: string
  content_strategy: string
  key_elements: string[]
  visual_recommendations: string
  talking_points: string[]
  duration_seconds: number
  design_tips: string
}

type StorytellingFlow = {
  hook: string
  problem_narrative: string
  solution_reveal: string
  market_opportunity: string
  competitive_advantage: string
  traction_story: string
  financial_projection: string
  call_to_action: string
}

type DesignGuidelines = {
  color_scheme: string
  typography_recommendations: string
  visual_style: 'Minimalist' | 'Corporate' | 'Creative' | 'Tech' | 'Modern'
  image_suggestions: string[]
  chart_types: string[]
  branding_tips: string
}

type PresenterTips = {
  opening_strategy: string
  body_language: string
  transition_techniques: string[]
  handling_questions: string
  closing_strategy: string
}

type CustomizationSuggestion = {
  audience_type: string
  modifications: string
  emphasis_areas: string[]
}

type SuccessMetrics = {
  pitch_effectiveness_score: number
  investor_readiness: 'Not Ready' | 'Getting Ready' | 'Investment Ready' | 'Scale Ready'
  strengths: string[]
  improvement_areas: string[]
}

type ExecutiveSummary = {
  pitch_theme: string
  key_narrative: string
  target_audience: 'Angel Investors' | 'VCs' | 'Seed Investors' | 'Series A+' | 'Strategic Investors'
  presentation_duration: string
  total_slides: number
}

type PitchContent = {
  executive_summary: ExecutiveSummary
  slides: Slide[]
  storytelling_flow: StorytellingFlow
  design_guidelines: DesignGuidelines
  presenter_tips: PresenterTips
  customization_suggestions: CustomizationSuggestion[]
  success_metrics: SuccessMetrics
}

type PitchAssistant = {
  id: string
  idea_source: 'new' | 'existing'
  idea_id?: string
  idea_title: string
  idea_description: string
  pitch_content: PitchContent
  created_at: string
}

export default function PitchAssistantPage() {
  const { user } = useUser()
  useSyncUser()

  // Form state
  const [ideaSource, setIdeaSource] = useState<'new' | 'existing'>('new')
  const [selectedIdea, setSelectedIdea] = useState<ValidatedIdea | null>(null)
  const [customIdea, setCustomIdea] = useState({
    title: '',
    description: ''
  })

  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [pitchResult, setPitchResult] = useState<PitchContent | null>(null)
  const [validatedIdeas, setValidatedIdeas] = useState<ValidatedIdea[]>([])
  const [pitchHistory, setPitchHistory] = useState<PitchAssistant[]>([])
  const [activeTab, setActiveTab] = useState('create-pitch')
  const [selectedPitch, setSelectedPitch] = useState<PitchAssistant | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return

      try {
        // Load validated ideas
        const ideasResponse = await fetch(`/api/validated-ideas?user_id=${user.id}`)
        const { ideas } = await ideasResponse.json()
        setValidatedIdeas(ideas || [])

        // Load pitch history
        const historyResponse = await fetch(`/api/pitch-history?user_id=${user.id}`)
        const { pitches } = await historyResponse.json()
        setPitchHistory(pitches || [])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [user?.id])

  const handleGeneratePitch = async () => {
    if (!user?.id) return

    if (ideaSource === 'new' && (!customIdea.title || !customIdea.description)) {
      alert('Please fill in all required fields for your new idea')
      return
    }

    if (ideaSource === 'existing' && !selectedIdea) {
      alert('Please select an idea from your validated ideas')
      return
    }

    setIsGenerating(true)
    setPitchResult(null)

    try {
      const payload = {
        user_id: user.id,
        idea_source: ideaSource,
        idea_id: ideaSource === 'existing' ? selectedIdea?.id : null,
        idea_title: ideaSource === 'existing' ? selectedIdea?.idea_title : customIdea.title,
        idea_description: ideaSource === 'existing' ? selectedIdea?.idea_description : customIdea.description
      }

      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        setPitchResult(data.pitch_content)
        // Refresh history
        const historyResponse = await fetch(`/api/pitch-history?user_id=${user.id}`)
        const { pitches } = await historyResponse.json()
        setPitchHistory(pitches || [])
      } else {
        alert('Failed to generate pitch deck. Please try again.')
      }
    } catch (error) {
      console.error('Pitch generation error:', error)
      alert('An error occurred while generating the pitch. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const resetForm = () => {
    setIdeaSource('new')
    setSelectedIdea(null)
    setCustomIdea({ title: '', description: '' })
    setPitchResult(null)
    setCurrentSlideIndex(0)
  }

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'Scale Ready': return 'text-purple-600 bg-purple-100'
      case 'Investment Ready': return 'text-green-600 bg-green-100'
      case 'Getting Ready': return 'text-yellow-600 bg-yellow-100'
      case 'Not Ready': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const PitchCard = ({ pitch }: { pitch: PitchAssistant }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
      onClick={() => setSelectedPitch(pitch)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
          {pitch.idea_title}
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getReadinessColor(pitch.pitch_content.success_metrics.investor_readiness)}`}>
          {pitch.pitch_content.success_metrics.investor_readiness}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Slides</p>
          <p className="text-sm font-semibold text-gray-800">{pitch.pitch_content.executive_summary.total_slides}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
          <p className="text-sm font-semibold text-gray-800">{pitch.pitch_content.executive_summary.presentation_duration}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{new Date(pitch.created_at).toLocaleDateString()}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{pitch.pitch_content.executive_summary.target_audience}</span>
          <span className={`px-2 py-1 rounded-full ${getScoreColor(pitch.pitch_content.success_metrics.pitch_effectiveness_score)}`}>
            {pitch.pitch_content.success_metrics.pitch_effectiveness_score}/100
          </span>
        </div>
      </div>
    </motion.div>
  )

  const SlideView = ({ slide, index }: { slide: Slide; index: number }) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Slide {slide.slide_number}: {slide.title}</h3>
        <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
          {slide.duration_seconds}s
        </span>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-purple-600 mb-2">Purpose</h4>
          <p className="text-gray-700">{slide.purpose}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-blue-600 mb-2">Content Strategy</h4>
          <p className="text-gray-700">{slide.content_strategy}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-green-600 mb-2">Key Elements</h4>
          <ul className="space-y-1">
            {slide.key_elements.map((element, idx) => (
              <li key={idx} className="text-gray-700 flex items-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                {element}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-orange-600 mb-2">Talking Points</h4>
          <ul className="space-y-1">
            {slide.talking_points.map((point, idx) => (
              <li key={idx} className="text-gray-700 flex items-start gap-2">
                <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-indigo-600 mb-2">Visual Recommendations</h4>
            <p className="text-sm text-gray-700">{slide.visual_recommendations}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-pink-600 mb-2">Design Tips</h4>
            <p className="text-sm text-gray-700">{slide.design_tips}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const DetailedResults = ({ result }: { result: PitchContent }) => (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">📋</span>
          Executive Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{result.executive_summary.total_slides}</div>
            <p className="text-gray-600">Total Slides</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600 mb-2">{result.executive_summary.presentation_duration}</div>
            <p className="text-gray-600">Duration</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 mb-2">{result.executive_summary.target_audience}</div>
            <p className="text-gray-600">Target Audience</p>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold px-3 py-1 rounded-full ${getScoreColor(result.success_metrics.pitch_effectiveness_score)}`}>
              {result.success_metrics.pitch_effectiveness_score}/100
            </div>
            <p className="text-gray-600">Effectiveness Score</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Pitch Theme</h3>
          <p className="text-gray-700 text-lg">{result.executive_summary.pitch_theme}</p>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Narrative</h3>
          <p className="text-gray-700">{result.executive_summary.key_narrative}</p>
        </div>
      </div>

      {/* Slides Navigation */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Slide-by-Slide Breakdown</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Slide {currentSlideIndex + 1} of {result.slides.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentSlideIndex(Math.min(result.slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === result.slides.length - 1}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {result.slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlideIndex(index)}
                className={`flex-shrink-0 w-12 h-8 rounded text-xs font-bold transition-all ${
                  index === currentSlideIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <SlideView slide={result.slides[currentSlideIndex]} index={currentSlideIndex} />
        </AnimatePresence>
      </div>

      {/* Storytelling Flow */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">📖</span>
          Storytelling Flow
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(result.storytelling_flow).map(([key, value]) => (
            <div key={key} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-2 capitalize">
                {key.replace('_', ' ')}
              </h3>
              <p className="text-gray-700">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Design Guidelines */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm">🎨</span>
          Design Guidelines
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-pink-600 mb-4">Visual Style & Branding</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Visual Style:</span>
                <span className="font-semibold">{result.design_guidelines.visual_style}</span>
              </div>
              <div>
                <span className="text-gray-600">Color Scheme:</span>
                <p className="text-gray-800 mt-1">{result.design_guidelines.color_scheme}</p>
              </div>
              <div>
                <span className="text-gray-600">Typography:</span>
                <p className="text-gray-800 mt-1">{result.design_guidelines.typography_recommendations}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-pink-600 mb-4">Content Recommendations</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Suggested Images:</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  {result.design_guidelines.image_suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="w-1 h-1 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Chart Types:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.design_guidelines.chart_types.map((chart, idx) => (
                    <span key={idx} className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                      {chart}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-pink-50 rounded-lg">
          <h4 className="text-lg font-semibold text-pink-800 mb-2">Branding Tips</h4>
          <p className="text-gray-700">{result.design_guidelines.branding_tips}</p>
        </div>
      </div>

      {/* Presenter Tips */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm">🎤</span>
          Presenter Tips
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-teal-600 mb-2">Opening Strategy</h3>
              <p className="text-gray-700">{result.presenter_tips.opening_strategy}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-teal-600 mb-2">Body Language</h3>
              <p className="text-gray-700">{result.presenter_tips.body_language}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-teal-600 mb-2">Closing Strategy</h3>
              <p className="text-gray-700">{result.presenter_tips.closing_strategy}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-teal-600 mb-2">Transition Techniques</h3>
              <ul className="space-y-1">
                {result.presenter_tips.transition_techniques.map((technique, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                    {technique}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-teal-600 mb-2">Handling Questions</h3>
              <p className="text-gray-700">{result.presenter_tips.handling_questions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Metrics & Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">📊</span>
            Success Metrics
          </h2>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-2xl font-bold px-4 py-2 rounded-full inline-block ${getReadinessColor(result.success_metrics.investor_readiness)}`}>
                {result.success_metrics.investor_readiness}
              </div>
              <p className="text-gray-600 mt-2">Investment Readiness</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">Strengths</h3>
              <ul className="space-y-1">
                {result.success_metrics.strengths.map((strength, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-orange-600 mb-2">Improvement Areas</h3>
              <ul className="space-y-1">
                {result.success_metrics.improvement_areas.map((area, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm">🎯</span>
            Audience Customization
          </h2>
          
          <div className="space-y-4">
            {result.customization_suggestions.map((suggestion, idx) => (
              <div key={idx} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">{suggestion.audience_type}</h3>
                <p className="text-gray-700 mb-3">{suggestion.modifications}</p>
                <div>
                  <h4 className="text-sm font-semibold text-indigo-600 mb-1">Focus Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.emphasis_areas.map((area, areaIdx) => (
                      <span key={areaIdx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          <p className="text-gray-600">Please sign in to access the pitch assistant</p>
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
            🎯 Pitch Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Create winning pitch deck strategies with AI-powered slide-by-slide guidance, storytelling flow, and presentation tips
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
              onClick={() => setActiveTab('create-pitch')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'create-pitch'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span className="text-xl">🚀</span>
              Create Pitch
            </button>
            <button
              onClick={() => setActiveTab('pitch-history')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'pitch-history'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span className="text-xl">📚</span>
              Pitch History ({pitchHistory.length})
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'pitch-history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {pitchHistory.length === 0 ? (
                <div className="text-center py-20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="text-8xl mb-6 text-gray-300"
                  >
                    🎯
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-600 mb-4">No pitch decks yet</h3>
                  <p className="text-gray-500 mb-8 text-lg">Create your first winning pitch deck strategy!</p>
                  <button
                    onClick={() => setActiveTab('create-pitch')}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    🚀 Create First Pitch
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pitchHistory.map((pitch, index) => (
                    <motion.div
                      key={pitch.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PitchCard pitch={pitch} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : pitchResult ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">🎯 Your Pitch Strategy</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPitchResult(null)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all transform hover:scale-105 shadow-md"
                  >
                    ← Back to Form
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
                  >
                    🚀 Create New Pitch
                  </button>
                </div>
              </div>
              <DetailedResults result={pitchResult} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Create Your Winning Pitch Deck</h2>
                <p className="text-gray-600 text-lg">Choose to use one of your validated ideas or enter a new concept</p>
              </div>

              {/* Idea Source Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Idea Source</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setIdeaSource('existing')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      ideaSource === 'existing'
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-semibold mb-2">Use Validated Idea</h4>
                    <p className="text-sm text-gray-600">Choose from your previously validated startup ideas</p>
                    {validatedIdeas.length > 0 && (
                      <div className="text-xs text-blue-600 mt-2">{validatedIdeas.length} ideas available</div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setIdeaSource('new')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      ideaSource === 'new'
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">💡</div>
                    <h4 className="font-semibold mb-2">Enter New Idea</h4>
                    <p className="text-sm text-gray-600">Provide details for a new startup concept</p>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-8 mb-8">
                {ideaSource === 'existing' ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Select a Validated Idea *
                    </label>
                    {validatedIdeas.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No validated ideas found. Please validate an idea first or use the &quot;New Idea&quot; option.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
                        {validatedIdeas.map((idea) => (
                          <button
                            key={idea.id}
                            onClick={() => setSelectedIdea(idea)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              selectedIdea?.id === idea.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-800">{idea.idea_title}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getScoreColor(idea.overall_score)}`}>
                                {idea.overall_score}/100
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{idea.idea_description}</p>
                            <div className="text-xs text-gray-500 mt-2">
                              Validated on {new Date(idea.created_at).toLocaleDateString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Startup Idea Title *
                      </label>
                      <input
                        type="text"
                        value={customIdea.title}
                        onChange={(e) => setCustomIdea(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., AI-powered fitness coaching platform, Sustainable food delivery service"
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Detailed Description *
                      </label>
                      <textarea
                        value={customIdea.description}
                        onChange={(e) => setCustomIdea(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your startup idea in detail. What problem does it solve? Who is your target audience? What makes it unique? Include your business model, key features, and value proposition."
                        rows={6}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGeneratePitch}
                  disabled={
                    isGenerating ||
                    (ideaSource === 'new' && (!customIdea.title || !customIdea.description)) ||
                    (ideaSource === 'existing' && !selectedIdea)
                  }
                  className="px-12 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center gap-3 shadow-lg text-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating Your Pitch Strategy...
                    </>
                  ) : (
                    <>
                      🎯 Generate Pitch Deck Strategy
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Pitch Modal */}
        <AnimatePresence>
          {selectedPitch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 backdrop-blur-sm"
              onClick={() => setSelectedPitch(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">{selectedPitch.idea_title}</h2>
                  <button
                    onClick={() => setSelectedPitch(null)}
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors text-lg"
                  >
                    ✕
                  </button>
                </div>
                <DetailedResults result={selectedPitch.pitch_content} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
