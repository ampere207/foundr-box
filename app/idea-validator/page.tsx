'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSyncUser } from '@/lib/syncUser'
import { motion, AnimatePresence } from 'framer-motion'

type ValidationResult = {
  overall_score: number
  category_scores: {
    problem_clarity: number
    solution_fit: number
    value_proposition: number
    technical_feasibility: number
    business_model: number
    execution_readiness: number
  }
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  risks: string[]
  recommendations: string[]
  next_steps: string[]
  validation_methods: string[]
  feasibility_assessment: {
    technical_complexity: 'Low' | 'Medium' | 'High'
    resource_intensity: 'Low' | 'Medium' | 'High'
    time_to_prototype: string
  }
  improvement_suggestions: string[]
  success_likelihood: 'Low' | 'Medium' | 'High'
  innovation_level: 'Incremental' | 'Significant' | 'Breakthrough'
}

type IdeaValidation = {
  id: string
  idea_title: string
  idea_description: string
  target_audience: string
  problem_solving: string
  unique_value_proposition: string
  business_model: string
  technical_feasibility: string
  resource_requirements: string
  validation_result: ValidationResult
  overall_score: number
  created_at: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export default function IdeaValidatorPage() {
  const { user } = useUser()
  useSyncUser()

  // Form state
  const [formData, setFormData] = useState({
    idea_title: '',
    idea_description: '',
    target_audience: '',
    problem_solving: '',
    unique_value_proposition: '',
    business_model: '',
    technical_feasibility: '',
    resource_requirements: ''
  })

  // UI state
  const [currentStep, setCurrentStep] = useState(0)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [previousValidations, setPreviousValidations] = useState<IdeaValidation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedValidation, setSelectedValidation] = useState<IdeaValidation | null>(null)

  const steps = [
    {
      title: 'Core Concept',
      description: 'Tell us about your idea',
      icon: '💡',
      fields: ['idea_title', 'idea_description']
    },
    {
      title: 'Problem & Solution',
      description: 'What problem and for whom',
      icon: '🎯',
      fields: ['target_audience', 'problem_solving']
    },
    {
      title: 'Value & Business Model',
      description: 'How you create and capture value',
      icon: '💰',
      fields: ['unique_value_proposition', 'business_model']
    },
    {
      title: 'Feasibility & Resources',
      description: 'Can you build and sustain this',
      icon: '🔧',
      fields: ['technical_feasibility', 'resource_requirements']
    }
  ]

  // Load previous validations
  useEffect(() => {
    const loadValidations = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/idea-validations?user_id=${user.id}`)
        const { validations } = await response.json()
        setPreviousValidations(validations || [])
      } catch (error) {
        console.error('Error loading validations:', error)
      }
    }

    loadValidations()
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

  const handleValidateIdea = async () => {
    if (!user?.id) return

    setIsValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch('/api/validate-idea', {
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
        setValidationResult(data.result)
        // Refresh validations history
        const historyResponse = await fetch(`/api/idea-validations?user_id=${user.id}`)
        const { validations } = await historyResponse.json()
        setPreviousValidations(validations || [])
      } else {
        alert('Failed to validate idea. Please try again.')
      }
    } catch (error) {
      console.error('Validation error:', error)
      alert('An error occurred during validation. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      idea_title: '',
      idea_description: '',
      target_audience: '',
      problem_solving: '',
      unique_value_proposition: '',
      business_model: '',
      technical_feasibility: '',
      resource_requirements: ''
    })
    setCurrentStep(0)
    setValidationResult(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200'
    if (score >= 60) return 'text-blue-600 bg-blue-100 border-blue-200'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    return 'text-red-600 bg-red-100 border-red-200'
  }

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'High': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSuccessLikelihoodColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getInnovationColor = (level: string) => {
    switch (level) {
      case 'Breakthrough': return 'text-purple-600 bg-purple-100'
      case 'Significant': return 'text-blue-600 bg-blue-100'
      case 'Incremental': return 'text-teal-600 bg-teal-100'
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

  const ValidationCard = ({ validation }: { validation: IdeaValidation }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
      onClick={() => setSelectedValidation(validation)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
          {validation.idea_title}
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getScoreColor(validation.overall_score)}`}>
          {validation.overall_score}/100
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{validation.idea_description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{new Date(validation.created_at).toLocaleDateString()}</span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full ${getSuccessLikelihoodColor(validation.validation_result.success_likelihood)}`}>
            {validation.validation_result.success_likelihood} Success
          </span>
          <span className={`px-2 py-1 rounded-full ${getInnovationColor(validation.validation_result.innovation_level)}`}>
            {validation.validation_result.innovation_level}
          </span>
        </div>
      </div>
    </motion.div>
  )

  const DetailedResults = ({ result }: { result: ValidationResult }) => (
    <div className="space-y-8">
      {/* Hero Score Section */}
      <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className={`inline-flex items-center justify-center w-40 h-40 rounded-full text-5xl font-bold border-4 ${getScoreColor(result.overall_score)}`}
        >
          {result.overall_score}/100
        </motion.div>
        <h2 className="text-3xl font-bold mt-6 text-gray-800">Idea Validation Score</h2>
        <div className="flex justify-center gap-4 mt-4">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getSuccessLikelihoodColor(result.success_likelihood)}`}>
            {result.success_likelihood} Success Likelihood
          </span>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getInnovationColor(result.innovation_level)}`}>
            {result.innovation_level} Innovation
          </span>
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(result.category_scores).map(([category, score]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * Object.keys(result.category_scores).indexOf(category) }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <h3 className="text-sm font-semibold text-gray-600 mb-3 capitalize">
              {category.replace('_', ' ')}
            </h3>
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${getScoreColor(score).split(' ')[0]}`}>
                {score}/100
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-3 rounded-full ${
                    score >= 80 ? 'bg-green-500' :
                    score >= 60 ? 'bg-blue-500' :
                    score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feasibility Assessment */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">🔧</span>
          Feasibility Assessment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-lg font-semibold px-4 py-2 rounded-full inline-block ${getComplexityColor(result.feasibility_assessment.technical_complexity)}`}>
              {result.feasibility_assessment.technical_complexity}
            </div>
            <p className="text-gray-600 text-sm mt-2">Technical Complexity</p>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold px-4 py-2 rounded-full inline-block ${getComplexityColor(result.feasibility_assessment.resource_intensity)}`}>
              {result.feasibility_assessment.resource_intensity}
            </div>
            <p className="text-gray-600 text-sm mt-2">Resource Intensity</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600 bg-purple-100 px-4 py-2 rounded-full inline-block">
              {result.feasibility_assessment.time_to_prototype}
            </div>
            <p className="text-gray-600 text-sm mt-2">Time to Prototype</p>
          </div>
        </div>
      </div>

      {/* SWOT Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-green-50 rounded-xl p-6 border border-green-200"
        >
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">💪</span>
            Strengths
          </h3>
          <ul className="space-y-3">
            {result.strengths.map((strength, index) => (
              <li key={index} className="text-green-700 flex items-start gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 rounded-xl p-6 border border-red-200"
        >
          <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">⚠️</span>
            Weaknesses
          </h3>
          <ul className="space-y-3">
            {result.weaknesses.map((weakness, index) => (
              <li key={index} className="text-red-700 flex items-start gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-xl p-6 border border-blue-200"
        >
          <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">🚀</span>
            Opportunities
          </h3>
          <ul className="space-y-3">
            {result.opportunities.map((opportunity, index) => (
              <li key={index} className="text-blue-700 flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>{opportunity}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-orange-50 rounded-xl p-6 border border-orange-200"
        >
          <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">⚡</span>
            Risks
          </h3>
          <ul className="space-y-3">
            {result.risks.map((risk, index) => (
              <li key={index} className="text-orange-700 flex items-start gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Actionable Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">💡</span>
            Recommendations
          </h3>
          <ul className="space-y-4">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm">🎯</span>
            Next Steps
          </h3>
          <ul className="space-y-4">
            {result.next_steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <span className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Validation Methods */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm">🔍</span>
          How to Validate This Idea
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.validation_methods.map((method, index) => (
            <div key={index} className="p-4 bg-teal-50 rounded-lg border border-teal-200">
              <div className="text-teal-700 font-medium">{method}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">⭐</span>
          How to Make Your Idea Even Better
        </h3>
        <ul className="space-y-3">
          {result.improvement_suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
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
          <p className="text-gray-600">Please sign in to validate your startup ideas</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-4">
            💡 Idea Validator
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Get expert AI analysis of your startup idea&apos;s core strengths, potential challenges, and actionable recommendations for success
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
              onClick={() => setShowHistory(false)}
              className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                !showHistory 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span className="text-xl">🚀</span>
              Validate New Idea
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                showHistory 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span className="text-xl">📊</span>
              History ({previousValidations.length})
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {previousValidations.length === 0 ? (
                <div className="text-center py-20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="text-8xl mb-6 text-gray-300"
                  >
                    📋
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-600 mb-4">No validations yet</h3>
                  <p className="text-gray-500 mb-8 text-lg">Start by validating your first startup idea!</p>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    🚀 Validate Your First Idea
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {previousValidations.map((validation, index) => (
                    <motion.div
                      key={validation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ValidationCard validation={validation} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : validationResult ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">🎯 Validation Results</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setValidationResult(null)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all transform hover:scale-105 shadow-md"
                  >
                    ← Back to Form
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
                  >
                    🚀 Validate Another Idea
                  </button>
                </div>
              </div>
              <DetailedResults result={validationResult} />
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
                        What&apos;s your startup idea? *
                      </label>
                      <input
                        type="text"
                        value={formData.idea_title}
                        onChange={(e) => handleInputChange('idea_title', e.target.value)}
                        placeholder="e.g., AI-powered personal fitness coach for busy professionals"
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Describe your idea in detail *
                      </label>
                      <textarea
                        value={formData.idea_description}
                        onChange={(e) => handleInputChange('idea_description', e.target.value)}
                        placeholder="Explain what your idea does, how it works, and what makes it special. Be as detailed as possible - this helps our AI provide better validation."
                        rows={6}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                      />
                    </div>
                  </>
                )}

                {currentStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Who is your target audience? *
                      </label>
                      <textarea
                        value={formData.target_audience}
                        onChange={(e) => handleInputChange('target_audience', e.target.value)}
                        placeholder="Describe your ideal customers. Include demographics, behaviors, pain points, and specific characteristics that make them perfect for your solution."
                        rows={4}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        What specific problem does this solve? *
                      </label>
                      <textarea
                        value={formData.problem_solving}
                        onChange={(e) => handleInputChange('problem_solving', e.target.value)}
                        placeholder="What pain point, frustration, or need does your idea address? How significant is this problem for your target audience? Why do they care?"
                        rows={4}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                      />
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        What&apos;s your unique value proposition? *
                      </label>
                      <textarea
                        value={formData.unique_value_proposition}
                        onChange={(e) => handleInputChange('unique_value_proposition', e.target.value)}
                        placeholder="What makes your solution different and better? Why would customers choose you over existing alternatives or doing nothing at all?"
                        rows={4}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        How will you make money? *
                      </label>
                      <textarea
                        value={formData.business_model}
                        onChange={(e) => handleInputChange('business_model', e.target.value)}
                        placeholder="Describe your revenue model, pricing strategy, and how you'll capture value. Will you charge per use, subscription, commission, etc?"
                        rows={4}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                      />
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        How technically feasible is this? *
                      </label>
                      <textarea
                        value={formData.technical_feasibility}
                        onChange={(e) => handleInputChange('technical_feasibility', e.target.value)}
                        placeholder="What technology, skills, or infrastructure do you need? How complex is the technical implementation? What are the main technical challenges?"
                        rows={4}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        What resources do you need? *
                      </label>
                      <textarea
                        value={formData.resource_requirements}
                        onChange={(e) => handleInputChange('resource_requirements', e.target.value)}
                        placeholder="What team, funding, partnerships, or other resources are required? What do you already have vs. what do you need to acquire?"
                        rows={4}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-lg"
                      />
                    </div>
                  </>
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
                    onClick={handleValidateIdea}
                    disabled={!canProceedToNext() || isValidating}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center gap-3 shadow-lg"
                  >
                    {isValidating ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Validating Your Idea...
                      </>
                    ) : (
                      <>
                        🚀 Validate My Idea
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Validation Modal */}
        <AnimatePresence>
          {selectedValidation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 backdrop-blur-sm"
              onClick={() => setSelectedValidation(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">{selectedValidation.idea_title}</h2>
                  <button
                    onClick={() => setSelectedValidation(null)}
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors text-lg"
                  >
                    ✕
                  </button>
                </div>
                <DetailedResults result={selectedValidation.validation_result} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
