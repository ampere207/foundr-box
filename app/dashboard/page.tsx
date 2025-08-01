'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@clerk/nextjs'
import { useSyncUser } from '@/lib/syncUser'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

type MvpStage = {
  id: string
  title: string
  description: string
  completed: boolean
  deadline?: string
}

type TaskPriority = 'High' | 'Medium' | 'Low'
type Task = {
  id: string
  title: string
  assignedTo: string
  completed: boolean
  priority: TaskPriority
  category: 'Development' | 'Marketing' | 'Operations' | 'Finance'
}

type TeamMember = {
  id: string
  name: string
  role: string
  isOnline?: boolean
  skills: string[]
}

type ActivityType = 'MVP' | 'Task' | 'Note' | 'Team' | 'Funding' | 'Market' | 'Metrics'
type Activity = {
  id: string
  text: string
  timestamp: Date
  type: ActivityType
}

type Metric = {
  name: string
  value: number
  change: number
  color: string
}

type MonthlyData = {
  month: string
  users: number
  revenue: number
}

type CompetitorData = {
  name: string
  value: number
  color: string
}

const initialMvpStages = [
  { title: 'Problem Validation', description: 'Validated real pain points with early users' },
  { title: 'Solution Ideation', description: 'Ideated MVP features and unique value' },
  { title: 'Prototype Development', description: 'Built and shipped first usable MVP' },
  { title: 'User Testing', description: 'Tested MVP in the market; gathered feedback' },
  { title: 'Iteration & Release', description: 'Refined and launched MVP to early adopters' },
]

// Sample data for empty states
const sampleMonthlyData = [
  { month: 'Jan', users: 0, revenue: 0 },
  { month: 'Feb', users: 0, revenue: 0 },
  { month: 'Mar', users: 0, revenue: 0 },
  { month: 'Apr', users: 0, revenue: 0 },
  { month: 'May', users: 0, revenue: 0 },
  { month: 'Jun', users: 0, revenue: 0 },
]

const emptyCompetitorData = [
  { name: 'No Data', value: 100, color: '#e5e7eb' }
]

// Generate a unique ID function
const generateId = () => Math.random().toString(36).substr(2, 9)

export default function FoundrBoxDashboard() {
  const { user } = useUser()
  const supabase = createClientComponentClient()
  useSyncUser()

  const [mvpStages, setMvpStages] = useState<MvpStage[]>([])
  const [onboardingIndex, setOnboardingIndex] = useState(0)
  const [deadlineInput, setDeadlineInput] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({ title: '', assignedTo: '', priority: 'Medium' as TaskPriority, category: 'Development' as Task['category'] })

  const [team, setTeam] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState({ name: '', role: '', skills: '' })

  const [notes, setNotes] = useState('')
  const [savedNote, setSavedNote] = useState('')
  const [noteUpdated, setNoteUpdated] = useState(false)

  const [activities, setActivities] = useState<Activity[]>([])

  const [fundingGoal, setFundingGoal] = useState(0)
  const [currentFunding, setCurrentFunding] = useState(0)

  // Dynamic metrics
  const [metrics, setMetrics] = useState<Metric[]>([
    { name: 'Monthly Users', value: 0, change: 0, color: '#3b82f6' },
    { name: 'Revenue', value: 0, change: 0, color: '#10b981' },
    { name: 'Conversion Rate', value: 0, change: 0, color: '#f59e0b' },
    { name: 'Team Velocity', value: 0, change: 0, color: '#8b5cf6' },
  ])

  // Monthly data for charts
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [newMonthlyData, setNewMonthlyData] = useState({ month: '', users: 0, revenue: 0 })

  // Competitor data
  const [competitorData, setCompetitorData] = useState<CompetitorData[]>([
    { name: 'Direct Competitors', value: 0, color: '#ef4444' },
    { name: 'Indirect Competitors', value: 0, color: '#f97316' },
    { name: 'Market Gap', value: 0, color: '#10b981' },
  ])

  // Market intelligence data
  const [marketIntelligence, setMarketIntelligence] = useState({
    totalAddressableMarket: 0,
    serviceableAvailableMarket: 0,
    serviceableObtainableMarket: 0
  })

  const [dataLoaded, setDataLoaded] = useState(false)

  // Supabase helper functions
  const saveDashboardData = async (dataType: string, data: any) => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/save-dashboard-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          data_type: dataType,
          data: data
        }),
      })

      if (!response.ok) {
        console.error('Error saving dashboard data')
      }
    } catch (error) {
      console.error('Error saving dashboard data:', error)
    }
  }

  const loadDashboardData = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/load-dashboard-data?user_id=${user.id}`)
      
      if (!response.ok) {
        console.error('Error loading dashboard data')
        setDataLoaded(true)
        return
      }

      const { data } = await response.json()

      // Process loaded data
      data?.forEach((item: any) => {
        switch (item.data_type) {
          case 'mvp_stages':
            if (item.data && Array.isArray(item.data)) {
              setMvpStages(item.data)
              setShowOnboarding(item.data.length === 0)
            }
            break
          case 'tasks':
            if (item.data && Array.isArray(item.data)) {
              setTasks(item.data)
            }
            break
          case 'team_members':
            if (item.data && Array.isArray(item.data)) {
              setTeam(item.data)
            }
            break
          case 'notes':
            if (item.data && typeof item.data === 'string') {
              setSavedNote(item.data)
            }
            break
          case 'activities':
            if (item.data && Array.isArray(item.data)) {
              const processedActivities = item.data.map((activity: any) => ({
                ...activity,
                timestamp: new Date(activity.timestamp)
              }))
              setActivities(processedActivities)
            }
            break
          case 'metrics':
            if (item.data && Array.isArray(item.data)) {
              setMetrics(item.data)
            }
            break
          case 'monthly_data':
            if (item.data && Array.isArray(item.data)) {
              setMonthlyData(item.data)
            }
            break
          case 'competitor_data':
            if (item.data && Array.isArray(item.data)) {
              setCompetitorData(item.data)
            }
            break
          case 'market_intelligence':
            if (item.data && typeof item.data === 'object') {
              setMarketIntelligence(item.data)
            }
            break
          case 'funding':
            if (item.data && typeof item.data === 'object') {
              setFundingGoal(item.data.fundingGoal || 0)
              setCurrentFunding(item.data.currentFunding || 0)
            }
            break
        }
      })

      setDataLoaded(true)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setDataLoaded(true)
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (user?.id && !dataLoaded) {
      loadDashboardData()
    }
  }, [user?.id])

  // Activity helper with Supabase save
  const addActivity = async (text: string, type: ActivityType = 'MVP') => {
    const newActivity = { id: generateId(), text, timestamp: new Date(), type }
    const updatedActivities = [newActivity, ...activities.slice(0, 15)]
    
    setActivities(updatedActivities)
    await saveDashboardData('activities', updatedActivities)
  }

  // MVP onboarding answer handler with Supabase save
  const handleMvpAnswer = async (completed: boolean) => {
    const cur = initialMvpStages[onboardingIndex]
    const newStage = { 
      id: generateId(), 
      title: cur.title, 
      description: cur.description, 
      completed, 
      deadline: completed ? undefined : deadlineInput || undefined 
    }
    
    const updatedStages = [...mvpStages, newStage]
    setMvpStages(updatedStages)
    await saveDashboardData('mvp_stages', updatedStages)
    
    await addActivity(`MVP Stage "${cur.title}" marked as ${completed ? 'COMPLETED' : 'PENDING'}`, 'MVP')
    
    setDeadlineInput('')
    if (onboardingIndex >= initialMvpStages.length - 1) {
      setShowOnboarding(false)
    } else {
      setOnboardingIndex((idx) => idx + 1)
    }
  }

  // Task handlers with Supabase save
  const handleAddTask = async () => {
    if (!newTask.title || !newTask.assignedTo) return
    
    const newTaskObj = { id: generateId(), ...newTask, completed: false }
    const updatedTasks = [newTaskObj, ...tasks]
    
    setTasks(updatedTasks)
    await saveDashboardData('tasks', updatedTasks)
    await addActivity(`New ${newTask.category.toLowerCase()} task: "${newTask.title}"`, 'Task')
    
    setNewTask({ title: '', assignedTo: '', priority: 'Medium', category: 'Development' })
  }

  const toggleTaskComplete = async (id: string) => {
    const updatedTasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    setTasks(updatedTasks)
    await saveDashboardData('tasks', updatedTasks)
    
    const task = tasks.find((t) => t.id === id)
    if (task) {
      await addActivity(`Task "${task.title}" ${task.completed ? 'reopened' : 'completed'}`, 'Task')
    }
  }

  // Team handlers with Supabase save
  const handleAddTeam = async () => {
    if (!newMember.name || !newMember.role) return
    
    const skillsArray = newMember.skills.split(',').map(s => s.trim()).filter(s => s)
    const newTeamMember = { 
      id: generateId(), 
      name: newMember.name, 
      role: newMember.role, 
      skills: skillsArray,
      isOnline: false 
    }
    
    const updatedTeam = [...team, newTeamMember]
    setTeam(updatedTeam)
    await saveDashboardData('team_members', updatedTeam)
    await addActivity(`${newMember.name} joined as ${newMember.role}`, 'Team')
    
    setNewMember({ name: '', role: '', skills: '' })
  }

  // Notes save with Supabase
  const handleSaveNote = async () => {
    setSavedNote(notes)
    setNoteUpdated(true)
    await saveDashboardData('notes', notes)
    await addActivity('Strategic note saved', 'Note')
    setTimeout(() => setNoteUpdated(false), 2000)
  }

  // Metrics handlers with Supabase save
  const handleUpdateMetric = async (index: number, field: 'value' | 'change', newValue: number) => {
    const updatedMetrics = metrics.map((metric, idx) => 
      idx === index ? { ...metric, [field]: newValue } : metric
    )
    setMetrics(updatedMetrics)
    await saveDashboardData('metrics', updatedMetrics)
    await addActivity(`Updated ${metrics[index].name}: ${field} = ${newValue}`, 'Metrics')
  }

  // Monthly data handlers with Supabase save
  const handleAddMonthlyData = async () => {
    if (!newMonthlyData.month) return
    
    const updatedMonthlyData = [...monthlyData, { ...newMonthlyData }]
    setMonthlyData(updatedMonthlyData)
    await saveDashboardData('monthly_data', updatedMonthlyData)
    await addActivity(`Added monthly data for ${newMonthlyData.month}`, 'Market')
    
    setNewMonthlyData({ month: '', users: 0, revenue: 0 })
  }

  // Competitor data handlers with Supabase save
  const handleUpdateCompetitorData = async (index: number, value: number) => {
    const updatedCompetitorData = competitorData.map((comp, idx) => 
      idx === index ? { ...comp, value } : comp
    )
    setCompetitorData(updatedCompetitorData)
    await saveDashboardData('competitor_data', updatedCompetitorData)
    await addActivity(`Updated ${competitorData[index].name}: ${value}%`, 'Market')
  }

  // Market intelligence handlers with Supabase save
  const handleUpdateMarketIntelligence = async (field: keyof typeof marketIntelligence, value: number) => {
    const updatedMarketIntelligence = { ...marketIntelligence, [field]: value }
    setMarketIntelligence(updatedMarketIntelligence)
    await saveDashboardData('market_intelligence', updatedMarketIntelligence)
    await addActivity(`Updated ${field}: ${value.toLocaleString()}`, 'Market')
  }

  // Funding handlers with Supabase save
  const updateFundingData = async (goal: number, current: number) => {
    await saveDashboardData('funding', { fundingGoal: goal, currentFunding: current })
  }

  useEffect(() => {
    if (dataLoaded) {
      updateFundingData(fundingGoal, currentFunding)
    }
  }, [fundingGoal, currentFunding, dataLoaded])

  // Update team online status with Supabase save
  const updateTeamOnlineStatus = async (memberId: string) => {
    const updatedTeam = team.map(m => 
      m.id === memberId ? { ...m, isOnline: !m.isOnline } : m
    )
    setTeam(updatedTeam)
    await saveDashboardData('team_members', updatedTeam)
  }

  // MVP Chart Data
  const completedCount = mvpStages.filter((s) => s.completed).length
  const overallPct = mvpStages.length ? Math.round((completedCount / mvpStages.length) * 100) : 0

  // Helper functions to determine if we should show sample data
  const hasMonthlyData = monthlyData.length > 0 && monthlyData.some(d => d.users > 0 || d.revenue > 0)
  const hasCompetitorData = competitorData.some(c => c.value > 0)
  const displayMonthlyData = hasMonthlyData ? monthlyData : sampleMonthlyData
  const displayCompetitorData = hasCompetitorData ? competitorData : emptyCompetitorData

  // Show loading state while data loads
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Metric Card Component
  function MetricCard({ metric, index }: { metric: Metric; index: number }) {
    const isPositive = metric.change >= 0
    const [isEditing, setIsEditing] = useState(false)
    const [tempValue, setTempValue] = useState(metric.value)
    const [tempChange, setTempChange] = useState(metric.change)

    const handleSave = async () => {
      await handleUpdateMetric(index, 'value', tempValue)
      await handleUpdateMetric(index, 'change', tempChange)
      setIsEditing(false)
    }

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: metric.color }}
            />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(Number(e.target.value))}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Value"
            />
            <input
              type="number"
              step="0.1"
              value={tempChange}
              onChange={(e) => setTempChange(Number(e.target.value))}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Change %"
            />
            <button
              onClick={handleSave}
              className="w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {metric.name.includes('Revenue') ? `$${metric.value.toLocaleString()}` : 
               metric.name.includes('Rate') ? `${metric.value}%` :
               metric.value.toLocaleString()}
            </span>
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{metric.change}%
            </span>
          </div>
        )}
      </div>
    )
  }

  // Tab Navigation
  function TabNavigation() {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: '📊' },
      { id: 'mvp', label: 'MVP Progress', icon: '🚀' },
      { id: 'team', label: 'Team', icon: '👥' },
      { id: 'market', label: 'Market Intelligence', icon: '📈' },
      { id: 'funding', label: 'Funding Tracker', icon: '💰' },
    ]

    return (
      <nav className="flex justify-between bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/50 hover:text-blue-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>
    )
  }

  // Onboarding UI
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Welcome to FoundrBox
            </h1>
            <p className="text-xl text-gray-600">Let's set up your startup journey</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              {initialMvpStages.map((_, idx) => (
                <div key={idx} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    idx < onboardingIndex ? 'bg-green-500 text-white' :
                    idx === onboardingIndex ? 'bg-blue-500 text-white scale-110' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {idx < onboardingIndex ? '✓' : idx + 1}
                  </div>
                  {idx < initialMvpStages.length - 1 && (
                    <div className={`w-16 h-1 mx-2 rounded-full ${
                      idx < onboardingIndex ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {initialMvpStages[onboardingIndex].title}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {initialMvpStages[onboardingIndex].description}
            </p>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Deadline (if not completed)
              </label>
              <input
                type="date"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => handleMvpAnswer(true)}
                className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
              >
                ✓ Completed
              </button>
              <button
                onClick={() => {
                  if (!deadlineInput && onboardingIndex < initialMvpStages.length - 1) {
                    alert('Please set a deadline for incomplete stages.')
                    return
                  }
                  handleMvpAnswer(false)
                }}
                className="px-12 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
              >
                ⏳ In Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                FoundrBox Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Your startup command center</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">All Systems Operational</span>
              </div>
            </div>
          </div>
          <TabNavigation />
        </header>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Metrics Row */}
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {metrics.map((metric, idx) => (
                <MetricCard key={idx} metric={metric} index={idx} />
              ))}
            </div>

            {/* Charts Row */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Growth Trajectory</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={displayMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Improved Add Monthly Data Form */}
              <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h4 className="text-sm font-semibold text-blue-800">Add Growth Data</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Period</label>
                    <input
                      type="text"
                      placeholder="e.g., Jan 2024, Q1, Week 1"
                      value={newMonthlyData.month}
                      onChange={(e) => setNewMonthlyData(prev => ({ ...prev, month: e.target.value }))}
                      className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Active Users</label>
                    <input
                      type="number"
                      placeholder="e.g., 1,250 monthly users"
                      value={newMonthlyData.users || ''}
                      onChange={(e) => setNewMonthlyData(prev => ({ ...prev, users: Number(e.target.value) }))}
                      className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Revenue ($)</label>
                    <input
                      type="number"
                      placeholder="e.g., 5,000 monthly revenue"
                      value={newMonthlyData.revenue || ''}
                      onChange={(e) => setNewMonthlyData(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                      className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddMonthlyData}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-md"
                >
                  📊 Add Growth Data
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Market Position</h3>
              
              {hasCompetitorData ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={competitorData.filter(c => c.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {competitorData.filter(c => c.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-4xl mb-3 text-gray-300">📊</div>
                  <p className="text-gray-500 text-center mb-2">No market data yet</p>
                  <p className="text-xs text-gray-400 text-center max-w-xs">
                    Add competitor market share data below to visualize your market position
                  </p>
                </div>
              )}
              
              {/* Edit Competitor Data */}
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Market Share Distribution</h4>
                {competitorData.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: comp.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{comp.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={comp.value}
                        onChange={(e) => handleUpdateCompetitorData(idx, Number(e.target.value))}
                        className="w-16 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="lg:col-span-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Real-time Activity
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3 text-gray-300">📱</div>
                    <p className="text-gray-500 italic">No activity yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start using the dashboard and activities will appear here</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        activity.type === 'MVP' ? 'bg-blue-500' :
                        activity.type === 'Task' ? 'bg-green-500' :
                        activity.type === 'Team' ? 'bg-purple-500' :
                        activity.type === 'Funding' ? 'bg-yellow-500' :
                        activity.type === 'Market' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{activity.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp.toLocaleTimeString()} • {activity.type}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mvp' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MVP Progress Overview */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">MVP Journey Progress</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{overallPct}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${overallPct}%` }}
                  ></div>
                </div>
              </div>

              {/* MVP Stages List */}
              <div className="space-y-4">
                {mvpStages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-lg border-2 ${
                      stage.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        stage.completed ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {stage.completed ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{stage.title}</h4>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                        {stage.deadline && !stage.completed && (
                          <p className="text-xs text-orange-600 mt-1">
                            Deadline: {new Date(stage.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MVP Insights */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h4 className="font-semibold text-gray-800 mb-4">Next Steps</h4>
                {mvpStages.length > 0 ? (
                  <div className="space-y-3">
                    {mvpStages
                      .filter(stage => !stage.completed)
                      .slice(0, 3)
                      .map((stage, idx) => (
                        <div key={stage.id} className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-800">{stage.title}</div>
                          <div className="text-sm text-blue-600">{stage.description}</div>
                          {stage.deadline && (
                            <div className="text-xs text-blue-500 mt-1">
                              Due: {new Date(stage.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Complete the onboarding to see next steps</p>
                )}
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h4 className="font-semibold text-gray-800 mb-4">Success Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stages Completed</span>
                    <span className="font-bold text-green-600">{completedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Stages</span>
                    <span className="font-bold">{mvpStages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold text-blue-600">{overallPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time to Complete</span>
                    <span className="font-bold text-purple-600">
                      {mvpStages.filter(s => !s.completed && s.deadline).length > 0 
                        ? 'See deadlines above' 
                        : 'On track'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Members */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Team Members</h3>
                <div className="text-sm text-gray-600">
                  {team.filter(m => m.isOnline).length} / {team.length} online
                </div>
              </div>

              {/* Add New Member Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Add Team Member</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Skills (comma separated)"
                    value={newMember.skills}
                    onChange={(e) => setNewMember(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddTeam}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Member
                  </button>
                </div>
              </div>

              {/* Team List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {team.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {member.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => updateTeamOnlineStatus(member.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.isOnline 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.isOnline ? 'Online' : 'Offline'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Tasks */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Team Tasks</h3>

              {/* Add Task Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Create New Task</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Assign to...</option>
                      {team.map(member => (
                        <option key={member.id} value={member.name}>{member.name}</option>
                      ))}
                    </select>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                      className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Development">Development</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                  <button
                    onClick={handleAddTask}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create Task
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks yet. Create your first task above!</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        task.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleTaskComplete(task.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}>
                          {task.completed && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">{task.assignedTo}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              task.priority === 'High' ? 'bg-red-100 text-red-800' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {task.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Size Analysis */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Market Size Analysis</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Addressable Market (TAM)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">$</span>
                    <input
                      type="number"
                      value={marketIntelligence.totalAddressableMarket}
                      onChange={(e) => handleUpdateMarketIntelligence('totalAddressableMarket', Number(e.target.value))}
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500">million</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serviceable Available Market (SAM)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">$</span>
                    <input
                      type="number"
                      value={marketIntelligence.serviceableAvailableMarket}
                      onChange={(e) => handleUpdateMarketIntelligence('serviceableAvailableMarket', Number(e.target.value))}
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500">million</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serviceable Obtainable Market (SOM)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">$</span>
                    <input
                      type="number"
                      value={marketIntelligence.serviceableObtainableMarket}
                      onChange={(e) => handleUpdateMarketIntelligence('serviceableObtainableMarket', Number(e.target.value))}
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500">million</span>
                  </div>
                </div>

                {/* Visual representation */}
                <div className="mt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">TAM</span>
                      <span className="text-sm text-gray-600">
                        ${marketIntelligence.totalAddressableMarket.toLocaleString()}M
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-4">
                      <div className="bg-blue-600 h-4 rounded-full w-full"></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">SAM</span>
                      <span className="text-sm text-gray-600">
                        ${marketIntelligence.serviceableAvailableMarket.toLocaleString()}M
                      </span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-4">
                      <div 
                        className="bg-green-600 h-4 rounded-full transition-all duration-500"
                        style={{ 
                          width: marketIntelligence.totalAddressableMarket > 0 
                            ? `${Math.min((marketIntelligence.serviceableAvailableMarket / marketIntelligence.totalAddressableMarket) * 100, 100)}%`
                            : '0%'
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">SOM</span>
                      <span className="text-sm text-gray-600">
                        ${marketIntelligence.serviceableObtainableMarket.toLocaleString()}M
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-4">
                      <div 
                        className="bg-purple-600 h-4 rounded-full transition-all duration-500"
                        style={{ 
                          width: marketIntelligence.serviceableAvailableMarket > 0 
                            ? `${Math.min((marketIntelligence.serviceableObtainableMarket / marketIntelligence.serviceableAvailableMarket) * 100, 100)}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitive Analysis - Improved */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Competitive Landscape</h3>
              
              <div className="mb-6">
                {hasCompetitorData ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart 
                      data={competitorData.filter(c => c.value > 0)} 
                      margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        fontSize={12}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        fontSize={12}
                        stroke="#6b7280"
                        domain={[0, 'dataMax + 10']}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Market Share']}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ 
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]}
                        fill="#3b82f6"
                      >
                        {competitorData.filter(c => c.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-5xl mb-4 text-gray-300">📊</div>
                    <p className="text-gray-500 text-center font-medium mb-2">No competitive data yet</p>
                    <p className="text-xs text-gray-400 text-center max-w-sm leading-relaxed">
                      Set market share percentages below to visualize your competitive landscape and position in the market
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Market Share Distribution
                </h4>
                {competitorData.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 rounded-lg shadow-sm"
                        style={{ backgroundColor: comp.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{comp.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={comp.value}
                        onChange={(e) => handleUpdateCompetitorData(idx, Number(e.target.value))}
                        className="w-20 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-gray-500 font-medium">%</span>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> Total percentages don't need to equal 100%. Focus on relative market positions and opportunities.
                  </p>
                </div>
              </div>
            </div>

            {/* Strategic Notes */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Strategic Notes & Insights</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Market Research Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Document your market research findings, customer interviews, trend analysis..."
                  />
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={handleSaveNote}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Notes
                    </button>
                    {noteUpdated && (
                      <span className="text-sm text-green-600">✓ Saved successfully</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saved Research
                  </label>
                  <div className="w-full h-32 p-3 border rounded-lg bg-gray-50 overflow-y-auto">
                    {savedNote ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{savedNote}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No saved notes yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'funding' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funding Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Funding Progress</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Goal
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">$</span>
                    <input
                      type="number"
                      value={fundingGoal}
                      onChange={(e) => setFundingGoal(Number(e.target.value))}
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Funding
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">$</span>
                    <input
                      type="number"
                      value={currentFunding}
                      onChange={(e) => setCurrentFunding(Number(e.target.value))}
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">
                      {fundingGoal > 0 ? Math.round((currentFunding / fundingGoal) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
                      style={{ 
                        width: fundingGoal > 0 ? `${Math.min((currentFunding / fundingGoal) * 100, 100)}%` : '0%'
                      }}
                    >
                      {fundingGoal > 0 && currentFunding > 0 && (
                        <span className="text-white text-xs font-semibold">
                          ${currentFunding.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$0</span>
                    <span>${fundingGoal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Funding Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${currentFunding.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Raised</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${Math.max(0, fundingGoal - currentFunding).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {fundingGoal > 0 ? Math.round((currentFunding / fundingGoal) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Insights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Funding Insights</h3>
              
              <div className="space-y-6">
                {/* Funding Status */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Current Status</h4>
                  <p className="text-blue-700 text-sm">
                    {currentFunding === 0 && fundingGoal === 0 
                      ? "Set your funding goals to track progress"
                      : currentFunding >= fundingGoal 
                      ? "🎉 Congratulations! You've reached your funding goal!"
                      : `You need $${(fundingGoal - currentFunding).toLocaleString()} more to reach your goal`
                    }
                  </p>
                </div>

                {/* Funding Milestones */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Funding Milestones</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Pre-Seed", amount: fundingGoal * 0.25, color: "bg-yellow-100 text-yellow-800" },
                      { label: "Seed Round", amount: fundingGoal * 0.5, color: "bg-orange-100 text-orange-800" },
                      { label: "Series A", amount: fundingGoal * 0.75, color: "bg-red-100 text-red-800" },
                      { label: "Target Goal", amount: fundingGoal, color: "bg-green-100 text-green-800" }
                    ].map((milestone, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs rounded-full ${milestone.color}`}>
                          {milestone.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">${milestone.amount.toLocaleString()}</span>
                          {currentFunding >= milestone.amount ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-gray-300">○</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Funding Tips */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Funding Tips</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Prepare a compelling pitch deck</li>
                    <li>• Have clear financial projections</li>
                    <li>• Build relationships with investors early</li>
                    <li>• Show traction and product-market fit</li>
                    <li>• Know your unit economics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
