// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3, LogOut, EyeOff, Lock } from 'lucide-react'

// Initialize Supabase client
const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'
const supabase = createClient(supabaseUrl, supabaseKey)

// Pipeline stages with colors
const PIPELINE_STAGES = [
  { value: 'Proposal Out', label: 'Proposal Out/Pitched', color: 'bg-sky-100 border-sky-300 text-sky-800' },
  { value: 'Counseling Scheduled', label: 'Counseling Scheduled', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { value: 'Counseling In', label: 'Counseling In', color: 'bg-teal-100 border-teal-300 text-teal-800' },
  { value: 'Docs Out', label: 'Docs Out', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { value: 'Docs In', label: 'Docs In', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { value: 'Submitted to Processing', label: 'Submitted to Processing', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { value: 'Appraisal Ordered', label: 'Appraisal Ordered', color: 'bg-pink-100 border-pink-300 text-pink-800' },
  { value: 'Appraisal In', label: 'Appraisal In', color: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800' },
  { value: 'Submit to UW', label: 'Submit to UW', color: 'bg-red-100 border-red-300 text-red-800' },
  { value: 'Conditional Approval', label: 'Conditional Approval', color: 'bg-lime-100 border-lime-300 text-lime-800' },
  { value: 'CTC', label: 'CTC', color: 'bg-green-100 border-green-300 text-green-800' },
  { value: 'Funded', label: 'Funded', color: 'bg-gray-100 border-gray-300 text-gray-800' }
]

// Age-based PLF tables
const PLF_TABLES = {
  HECM: {
    55: 0.291, 56: 0.298, 57: 0.305, 58: 0.312, 59: 0.319, 60: 0.326,
    62: 0.339, 63: 0.346, 64: 0.353, 65: 0.360, 66: 0.367, 67: 0.374,
    68: 0.381, 69: 0.388, 70: 0.395, 71: 0.397, 72: 0.399, 73: 0.410,
    74: 0.420, 75: 0.431, 76: 0.442, 77: 0.453, 78: 0.464, 79: 0.475,
    80: 0.486, 81: 0.497, 82: 0.508, 83: 0.519, 84: 0.530, 85: 0.535,
    86: 0.545, 87: 0.556, 88: 0.567, 89: 0.578, 90: 0.589, 91: 0.600,
    92: 0.611, 93: 0.622, 94: 0.633, 95: 0.691
  },
  'Equity Plus': {
    55: 0.311, 56: 0.318, 57: 0.325, 58: 0.332, 59: 0.339, 60: 0.346,
    62: 0.362, 63: 0.369, 64: 0.376, 65: 0.383, 66: 0.390, 67: 0.397,
    68: 0.404, 69: 0.411, 70: 0.418, 71: 0.422, 72: 0.426, 73: 0.437,
    74: 0.447, 75: 0.458, 76: 0.469, 77: 0.480, 78: 0.491, 79: 0.502,
    80: 0.513, 81: 0.524, 82: 0.535, 83: 0.546, 84: 0.557, 85: 0.564,
    86: 0.574, 87: 0.585, 88: 0.596, 89: 0.607, 90: 0.618, 91: 0.629,
    92: 0.640, 93: 0.651, 94: 0.662, 95: 0.720
  },
  Peak: {
    55: 0.347, 56: 0.355, 57: 0.363, 58: 0.371, 59: 0.379, 60: 0.387,
    62: 0.405, 63: 0.413, 64: 0.421, 65: 0.429, 66: 0.437, 67: 0.445,
    68: 0.453, 69: 0.461, 70: 0.469, 71: 0.473, 72: 0.477, 73: 0.490,
    74: 0.502, 75: 0.515, 76: 0.528, 77: 0.541, 78: 0.554, 79: 0.567,
    80: 0.580, 81: 0.593, 82: 0.606, 83: 0.619, 84: 0.632, 85: 0.640,
    86: 0.652, 87: 0.665, 88: 0.678, 89: 0.691, 90: 0.704, 91: 0.717,
    92: 0.730, 93: 0.743, 94: 0.756, 95: 0.825
  },
  LOC: {
    55: 0.311, 56: 0.318, 57: 0.325, 58: 0.332, 59: 0.339, 60: 0.346,
    62: 0.362, 63: 0.369, 64: 0.376, 65: 0.383, 66: 0.390, 67: 0.397,
    68: 0.404, 69: 0.411, 70: 0.418, 71: 0.422, 72: 0.426, 73: 0.437,
    74: 0.447, 75: 0.458, 76: 0.469, 77: 0.480, 78: 0.491, 79: 0.502,
    80: 0.513, 81: 0.524, 82: 0.535, 83: 0.546, 84: 0.557, 85: 0.564,
    86: 0.574, 87: 0.585, 88: 0.596, 89: 0.607, 90: 0.618, 91: 0.629,
    92: 0.640, 93: 0.651, 94: 0.662, 95: 0.720
  }
}

export default function NextStepCRM() {
  // Authentication state
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  
  // Client management state
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [viewingClient, setViewingClient] = useState(null)
  
  // Session timeout state
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [timeoutCountdown, setTimeoutCountdown] = useState(120)
  
  // New client form
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    pipeline_status: 'Proposal Out',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    home_value: '',
    mortgage_balance: '',
    non_borrowing_spouse: false,
    spouse_first_name: '',
    spouse_last_name: '',
    spouse_date_of_birth: ''
  })

  // Initialize authentication
  useEffect(() => {
    checkUser()
  }, [])

  // Session timeout management
  useEffect(() => {
    if (!user) return

    let timeoutId
    let warningId
    let countdownInterval

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      clearTimeout(warningId)
      clearInterval(countdownInterval)
      setShowTimeoutWarning(false)
      setTimeoutCountdown(120)

      // Show warning after 8 minutes
      warningId = setTimeout(() => {
        setShowTimeoutWarning(true)
        let countdown = 120 // 2 minutes in seconds
        
        countdownInterval = setInterval(() => {
          countdown -= 1
          setTimeoutCountdown(countdown)
          
          if (countdown <= 0) {
            clearInterval(countdownInterval)
            handleLogout()
            alert('Session expired due to inactivity')
          }
        }, 1000)
      }, 8 * 60 * 1000) // 8 minutes

      // Auto logout after 10 minutes
      timeoutId = setTimeout(() => {
        handleLogout()
        alert('Session expired due to inactivity')
      }, 10 * 60 * 1000) // 10 minutes
    }

    // Activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      if (!showTimeoutWarning) {
        resetTimeout()
      }
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })

    // Initial timeout setup
    resetTimeout()

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      clearTimeout(timeoutId)
      clearTimeout(warningId)
      clearInterval(countdownInterval)
    }
  }, [user, showTimeoutWarning])

  // Load clients when user logs in
  useEffect(() => {
    if (user) {
      loadClients()
    }
  }, [user])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const handleLogin = async () => {
    setAuthLoading(true)
    console.log('Attempting login with:', loginForm.email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password
    })
    
    if (error) {
      console.error('Login error:', error)
      alert(error.message)
    } else {
      console.log('Login successful:', data.user.email)
      setUser(data.user)
    }
    
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setClients([])
  }

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error loading clients:', error)
    } else {
      setClients(data || [])
    }
  }

  const addClient = async () => {
    const { error } = await supabase
      .from('clients')
      .insert([newClient])
    
    if (error) {
      alert('Error adding client: ' + error.message)
    } else {
      setShowAddModal(false)
      setNewClient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        pipeline_status: 'Proposal Out',
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        home_value: '',
        mortgage_balance: '',
        non_borrowing_spouse: false,
        spouse_first_name: '',
        spouse_last_name: '',
        spouse_date_of_birth: ''
      })
      loadClients()
    }
  }

  const updateClient = async () => {
    const { error } = await supabase
      .from('clients')
      .update(editingClient)
      .eq('id', editingClient.id)
    
    if (error) {
      alert('Error updating client: ' + error.message)
    } else {
      setShowEditModal(false)
      loadClients()
    }
  }

  const deleteClient = async (id) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Error deleting client: ' + error.message)
    } else {
      setShowDeleteModal(false)
      loadClients()
    }
  }

  // Helper functions
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const calculateNetProceeds = (homeValue, mortgageBalance, age) => {
    if (!homeValue || !age || age < 62) return 0
    const plf = PLF_TABLES.HECM[age] || PLF_TABLES.HECM[95]
    const eligibleAmount = homeValue * plf
    return eligibleAmount - (mortgageBalance || 0)
  }

  // Calculate origination fee by program type
  const calculateOriginationFee = (program, homeValue, loanAmount) => {
    switch(program) {
      case 'HECM':
        const mca = Math.min(homeValue, 1209750)
        const first200k = Math.min(mca, 200000)
        const over200k = Math.max(0, mca - 200000)
        const basicFee = Math.max(2500, first200k * 0.02)
        const additionalFee = over200k * 0.01
        return Math.min(basicFee + additionalFee, 6000)
      
      case 'Peak':
        return loanAmount * 0.04 // 4%
      
      case 'Equity Plus':
      case 'LOC':
        return loanAmount * 0.015 // 1.5%
      
      default:
        return 0
    }
  }

  // Calculate rate revenue (for HECM only)
  const calculateRateRevenue = (program, loanAmount, utilization) => {
    if (program !== 'HECM') return 0
    
    // Based on utilization tier and corporate override
    const rateSheetBPS = utilization > 0.20 ? 104.750 : 106.500
    const corporateOverride = 100 // 100 BPS
    const netBPS = rateSheetBPS - corporateOverride
    
    return loanAmount * (netBPS / 10000)
  }

  // Get light tinted card styling with strong pipeline-colored borders
  const getPipelineCardStyling = (status) => {
    const styles = {
      'Proposal Out': 'bg-sky-50 border-2 border-sky-400 shadow-lg hover:shadow-xl text-gray-900',
      'Counseling Scheduled': 'bg-blue-50 border-2 border-blue-400 shadow-lg hover:shadow-xl text-gray-900',
      'Counseling In': 'bg-teal-50 border-2 border-teal-400 shadow-lg hover:shadow-xl text-gray-900',
      'Docs Out': 'bg-yellow-50 border-2 border-yellow-400 shadow-lg hover:shadow-xl text-gray-900',
      'Docs In': 'bg-orange-50 border-2 border-orange-400 shadow-lg hover:shadow-xl text-gray-900',
      'Submitted to Processing': 'bg-purple-50 border-2 border-purple-400 shadow-lg hover:shadow-xl text-gray-900',
      'Appraisal Ordered': 'bg-pink-50 border-2 border-pink-400 shadow-lg hover:shadow-xl text-gray-900',
      'Appraisal In': 'bg-fuchsia-50 border-2 border-fuchsia-400 shadow-lg hover:shadow-xl text-gray-900',
      'Submit to UW': 'bg-red-50 border-2 border-red-400 shadow-lg hover:shadow-xl text-gray-900',
      'Conditional Approval': 'bg-lime-50 border-2 border-lime-400 shadow-lg hover:shadow-xl text-gray-900',
      'CTC': 'bg-green-50 border-2 border-green-400 shadow-lg hover:shadow-xl text-gray-900',
      'Funded': 'bg-gray-50 border-2 border-gray-400 shadow-lg hover:shadow-xl text-gray-900'
    }
    return styles[status] || styles['Proposal Out']
  }

  // Get pipeline stage color for badges
  const getPipelineStageColor = (status) => {
    const stage = PIPELINE_STAGES.find(s => s.value === status || s.label === status)
    return stage ? stage.color : 'bg-gray-100 border-gray-300 text-gray-800'
  }

  // Program comparison using correct AGE-BASED PLF values
  const getAvailablePrograms = (homeValue, age) => {
    if (!age || age < 62) return []
    
    const programs = []
    
    // HECM always available for qualified borrowers
    programs.push({
      name: 'HECM',
      description: 'FHA-insured reverse mortgage',
      plf: PLF_TABLES.HECM[age] || PLF_TABLES.HECM[95],
      minHome: 0
    })
    
    // Proprietary products only for homes $450K+
    if (homeValue >= 450000) {
      programs.push({
        name: 'Equity Plus',
        description: 'Jumbo reverse mortgage',
        plf: PLF_TABLES['Equity Plus'][age] || PLF_TABLES['Equity Plus'][95],
        minHome: 450000
      })
      
      programs.push({
        name: 'Peak',
        description: 'Maximum proceeds option',
        plf: PLF_TABLES.Peak[age] || PLF_TABLES.Peak[95],
        minHome: 450000
      })
      
      programs.push({
        name: 'LOC',
        description: 'Line of Credit option',
        plf: PLF_TABLES.LOC[age] || PLF_TABLES.LOC[95],
        minHome: 450000
      })
    }
    
    return programs
  }

  // Filter clients based on search
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase()
    return (
      client.first_name?.toLowerCase().includes(searchLower) ||
      client.last_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchTerm)
    )
  })

  // Calculate summary stats
  const totalClients = clients.length
  const avgHomeValue = clients.reduce((sum, client) => sum + parseFloat(client.home_value || 0), 0) / (totalClients || 1)
  const totalNetProceeds = clients.reduce((sum, client) => {
    const age = calculateAge(client.date_of_birth)
    return sum + calculateNetProceeds(client.home_value, client.mortgage_balance, age)
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-500 to-teal-600 flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-500 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Next Step CRM
            </h1>
            <p className="text-gray-600 mt-2">Reverse Mortgage Management</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="jeremiah.sherer@city1st.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:via-green-600 hover:to-teal-600 transition-all transform hover:scale-105 font-semibold shadow-lg disabled:opacity-50"
            >
              {authLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-500 to-teal-600">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                  Next Step CRM
                </h1>
                <p className="text-sm text-gray-600">Reverse Mortgage Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-blue-600">{totalClients}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Home Value</p>
                <p className="text-3xl font-bold text-teal-600">${Math.round(avgHomeValue).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Net Proceeds</p>
                <p className="text-3xl font-bold text-green-600">${Math.round(totalNetProceeds).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add Client */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:via-green-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Client Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => {
            const age = calculateAge(client.date_of_birth)
            const netProceeds = calculateNetProceeds(client.home_value, client.mortgage_balance, age)
            
            return (
              <div key={client.id} className={`rounded-2xl p-6 transition-all transform hover:scale-105 ${getPipelineCardStyling(client.pipeline_status)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {client.first_name} {client.last_name}
                    </h3>
                    <p className="text-gray-600">{client.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-md ${getPipelineStageColor(client.pipeline_status)}`}>
                    {client.pipeline_status || 'Proposal Out'}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{client.phone}</span>
                  </div>
                  
                  {client.street_address && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {client.street_address}, {client.city}, {client.state} {client.zip_code}
                        </span>
                      </div>
                      
                        href={`https://www.zillow.com/homes/${encodeURIComponent(client.street_address + ' ' + client.city + ' ' + client.state + ' ' + client.zip_code)}_rb/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors shadow-sm"
                      >
                        <Home className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Age: {age || 'N/A'}</span>
                    {age && age < 62 && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Eligibility Issues
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Home Value: ${parseFloat(client.home_value || 0).toLocaleString()}
                    </span>
                  </div>

                  {netProceeds > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 shadow-sm">
                      <span className="text-sm font-bold text-green-800">
                        Est. Net Proceeds: ${Math.round(netProceeds).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setViewingClient(client)
                      setShowViewModal(true)
                    }}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingClient({...client})
                      setShowEditModal(true)
                    }}
                    className="flex-1 bg-amber-50 text-amber-600 py-2 px-3 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedClient(client)
                      setShowCompareModal(true)
                    }}
                    className="flex-1 bg-purple-50 text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Compare</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedClient(client)
                      setShowDeleteModal(true)
                    }}
                    className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Session Timeout Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-4 border-red-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-red-600 mb-2">Session Expiring Soon!</h2>
              
              <p className="text-gray-700 mb-4">
                Your session will expire due to inactivity in:
              </p>
              
              <div className="text-4xl font-bold text-red-600 mb-6">
                {Math.floor(timeoutCountdown / 60)}:{(timeoutCountdown % 60).toString().padStart(2, '0')}
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Click "Stay Logged In" to extend your session, or you will be automatically logged out for security.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    setUser(null)
                    setClients([])
                    setShowTimeoutWarning(false)
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Logout Now
                </button>
                <button
                  onClick={() => {
                    setShowTimeoutWarning(false)
                    clearTimeout(timeoutCountdown)
                    // This will trigger the resetTimeout through the activity handler
                    document.dispatchEvent(new Event('mousedown'))
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 text-white rounded-xl hover:from-blue-600 hover:via-green-600 hover:to-teal-600 transition-all font-semibold shadow-lg"
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={newClient.first_name}
                    onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={newClient.last_name}
                    onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={newClient.date_of_birth}
                    onChange={(e) => setNewClient({ ...newClient, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                  <select
                    value={newClient.pipeline_status}
                    onChange={(e) => setNewClient({ ...newClient, pipeline_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PIPELINE_STAGES.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={newClient.street_address}
                    onChange={(e) => setNewClient({ ...newClient, street_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={newClient.city}
                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={newClient.state}
                    onChange={(e) => setNewClient({ ...newClient, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={newClient.zip_code}
                    onChange={(e) => setNewClient({ ...newClient, zip_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                  <input
                    type="number"
                    value={newClient.home_value}
                    onChange={(e) => setNewClient({ ...newClient, home_value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={newClient.mortgage_balance}
                    onChange={(e) => setNewClient({ ...newClient, mortgage_balance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newClient.non_borrowing_spouse || false}
                      onChange={(e) => setNewClient({ ...newClient, non_borrowing_spouse: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Has Non-Borrowing Spouse</span>
                  </label>
                </div>

                {newClient.non_borrowing_spouse && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse First Name</label>
                      <input
                        type="text"
                        value={newClient.spouse_first_name}
                        onChange={(e) => setNewClient({ ...newClient, spouse_first_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Last Name</label>
                      <input
                        type="text"
                        value={newClient.spouse_last_name}
                        onChange={(e) => setNewClient({ ...newClient, spouse_last_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                      <input
                        type="date"
                        value={newClient.spouse_date_of_birth}
                        onChange={(e) => setNewClient({ ...newClient, spouse_date_of_birth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Client</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editingClient.first_name || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editingClient.last_name || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingClient.email || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={editingClient.date_of_birth || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                  <select
                    value={editingClient.pipeline_status || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, pipeline_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PIPELINE_STAGES.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={editingClient.street_address || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, street_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editingClient.city || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={editingClient.state || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={editingClient.zip_code || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, zip_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                  <input
                    type="number"
                    value={editingClient.home_value || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, home_value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={editingClient.mortgage_balance || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, mortgage_balance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingClient.non_borrowing_spouse || false}
                      onChange={(e) => setEditingClient({ ...editingClient, non_borrowing_spouse: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Has Non-Borrowing Spouse</span>
                  </label>
                </div>

                {editingClient.non_borrowing_spouse && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse First Name</label>
                      <input
                        type="text"
                        value={editingClient.spouse_first_name || ''}
                        onChange={(e) => setEditingClient({ ...editingClient, spouse_first_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Last Name</label>
                      <input
                        type="text"
                        value={editingClient.spouse_last_name || ''}
                        onChange={(e) => setEditingClient({ ...editingClient, spouse_last_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                      <input
                        type="date"
                        value={editingClient.spouse_date_of_birth || ''}
                        onChange={(e) => setEditingClient({ ...editingClient, spouse_date_of_birth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateClient}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {showViewModal && viewingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Client Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-lg text-gray-900">{viewingClient.first_name} {viewingClient.last_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-lg text-gray-900">{viewingClient.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-lg text-gray-900">{viewingClient.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <p className="text-lg text-gray-900">{calculateAge(viewingClient.date_of_birth) || 'N/A'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="text-lg text-gray-900">
                    {viewingClient.street_address}, {viewingClient.city}, {viewingClient.state} {viewingClient.zip_code}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Home Value</label>
                  <p className="text-lg text-gray-900">${parseFloat(viewingClient.home_value || 0).toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mortgage Balance</label>
                  <p className="text-lg text-gray-900">${parseFloat(viewingClient.mortgage_balance || 0).toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pipeline Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPipelineStageColor(viewingClient.pipeline_status)}`}>
                    {viewingClient.pipeline_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Client</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedClient.first_name} {selectedClient.last_name}? 
                This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteClient(selectedClient.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Programs Modal */}
      {showCompareModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Program Comparison - {selectedClient.first_name} {selectedClient.last_name}
                </h2>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Program Comparison Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {getAvailablePrograms(selectedClient.home_value, calculateAge(selectedClient.date_of_birth)).map((program) => {
                  const age = calculateAge(selectedClient.date_of_birth)
                  const eligibleAmount = selectedClient.home_value * program.plf
                  const netProceeds = eligibleAmount - (selectedClient.mortgage_balance || 0)
                  
                  return (
                    <div key={program.name} className="border border-gray-200 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">PLF Rate:</span>
                          <span className="font-semibold text-blue-600 ml-2">{(program.plf * 100).toFixed(1)}%</span>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-600">Eligible Amount:</span>
                          <span className="font-semibold text-green-600 ml-2">
                            ${Math.round(eligibleAmount).toLocaleString()}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-600">Est. Net Proceeds:</span>
                          <span className={`font-semibold ml-2 ${netProceeds > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.round(Math.max(0, netProceeds)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* NEW PROFITABILITY SECTION */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">💰 Profitability Analysis</h3>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {getAvailablePrograms(selectedClient.home_value, calculateAge(selectedClient.date_of_birth)).map((program) => {
                    const age = calculateAge(selectedClient.date_of_birth)
                    const principalLimit = selectedClient.home_value * program.plf
                    
                    // Default utilization scenarios
                    const utilizationScenarios = [0.60, 0.80] // 60% and 80%
                    
                    return (
                      <div key={`profit-${program.name}`} className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-green-800 mb-4">{program.name} Profit</h4>
                        
                        {utilizationScenarios.map((utilization) => {
                          const loanAmount = principalLimit * utilization
                          const originationFee = calculateOriginationFee(program.name, selectedClient.home_value, loanAmount)
                          const rateRevenue = calculateRateRevenue(program.name, loanAmount, utilization)
                          const totalProfit = originationFee + rateRevenue
                          
                          return (
                            <div key={utilization} className="mb-4 p-3 bg-white rounded-lg border border-green-100">
                              <div className="font-semibold text-green-700 mb-2">
                                {(utilization * 100).toFixed(0)}% Utilization
                              </div>
                              
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">UPB:</span>
                                  <span className="font-medium">${Math.round(loanAmount).toLocaleString()}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Origination Fee:</span>
                                  <span className="font-medium text-green-600">${Math.round(originationFee).toLocaleString()}</span>
                                </div>
                                
                                {program.name === 'HECM' && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Rate Revenue:</span>
                                    <span className="font-medium text-green-600">${Math.round(rateRevenue).toLocaleString()}</span>
                                  </div>
                                )}
                                
                                <div className="flex justify-between border-t border-green-200 pt-1 mt-2">
                                  <span className="font-semibold text-gray-900">Total Profit:</span>
                                  <span className="font-bold text-green-700">${Math.round(totalProfit).toLocaleString()}</span>
                                </div>
                                
                                <div className="text-xs text-green-600 text-center mt-1">
                                  Available for Commission Split
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> These are estimated calculations based on current rates and age-based PLF tables. 
                  HECM rate revenue includes corporate 100 BPS override. Origination fees: HECM (2025 FHA), Peak (4%), Others (1.5%).
                  Age {calculateAge(selectedClient.date_of_birth)} client qualifies for {getAvailablePrograms(selectedClient.home_value, calculateAge(selectedClient.date_of_birth)).length} program(s).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
