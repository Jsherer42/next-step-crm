// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3, LogOut, EyeOff, Lock } from 'lucide-react'

const supabase = createClient(
  'https://nmcqlekpyqfgyzoelcsa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'
)

// Complete age-based PLF tables from conversation history
const PLF_TABLES = {
  HECM: {
    55: 33.9, 56: 34.3, 57: 34.8, 58: 35.2, 59: 35.7, 60: 36.1, 61: 36.6, 62: 37.0,
    63: 37.5, 64: 37.9, 65: 38.4, 66: 38.8, 67: 39.3, 68: 39.7, 69: 40.2, 70: 40.6,
    71: 41.1, 72: 41.5, 73: 42.0, 74: 42.4, 75: 42.9, 76: 43.3, 77: 43.8, 78: 44.2,
    79: 44.7, 80: 45.1, 81: 45.6, 82: 46.0, 83: 46.5, 84: 46.9, 85: 47.4, 86: 47.8,
    87: 48.3, 88: 48.7, 89: 49.2, 90: 49.6, 91: 50.1, 92: 50.5, 93: 51.0, 94: 51.4, 95: 51.9
  },
  'Equity Plus': {
    62: 40.6, 63: 41.1, 64: 41.5, 65: 42.0, 66: 42.4, 67: 42.9, 68: 43.3, 69: 43.8,
    70: 44.2, 71: 44.7, 72: 45.1, 73: 45.6, 74: 46.0, 75: 46.5, 76: 46.9, 77: 47.4,
    78: 47.8, 79: 48.3, 80: 48.7, 81: 49.2, 82: 49.6, 83: 50.1, 84: 50.5, 85: 51.0,
    86: 51.4, 87: 51.9, 88: 52.3, 89: 52.8, 90: 53.2, 91: 53.7, 92: 54.1, 93: 54.6, 
    94: 55.0, 95: 55.5
  },
  Peak: {
    62: 42.7, 63: 43.2, 64: 43.6, 65: 44.1, 66: 44.5, 67: 45.0, 68: 45.4, 69: 45.9,
    70: 46.3, 71: 46.8, 72: 47.2, 73: 47.7, 74: 48.1, 75: 48.6, 76: 49.0, 77: 49.5,
    78: 49.9, 79: 50.4, 80: 50.8, 81: 51.3, 82: 51.7, 83: 52.2, 84: 52.6, 85: 53.1,
    86: 53.5, 87: 54.0, 88: 54.4, 89: 54.9, 90: 55.3, 91: 55.8, 92: 56.2, 93: 56.7,
    94: 57.1, 95: 57.6
  },
  LOC: {
    62: 40.6, 63: 41.1, 64: 41.5, 65: 42.0, 66: 42.4, 67: 42.9, 68: 43.3, 69: 43.8,
    70: 44.2, 71: 44.7, 72: 45.1, 73: 45.6, 74: 46.0, 75: 46.5, 76: 46.9, 77: 47.4,
    78: 47.8, 79: 48.3, 80: 48.7, 81: 49.2, 82: 49.6, 83: 50.1, 84: 50.5, 85: 51.0,
    86: 51.4, 87: 51.9, 88: 52.3, 89: 52.8, 90: 53.2, 91: 53.7, 92: 54.1, 93: 54.6,
    94: 55.0, 95: 55.5
  }
}

// Complete 12-stage pipeline system with colors
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

export default function NextStepCRM() {
  // Authentication state
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: 'jeremiah.sherer@city1st.com', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  // Session timeout state
  const [timeoutWarning, setTimeoutWarning] = useState(false)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [timeoutCountdown, setTimeoutCountdown] = useState(120) // 2 minutes in seconds
  const [activityTimeout, setActivityTimeout] = useState(null)
  const [warningTimeout, setWarningTimeout] = useState(null)

  // Client management state
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)

  // Client data states
  const [newClient, setNewClient] = useState({
    first_name: '', last_name: '', email: '', phone: '', date_of_birth: '',
    pipeline_status: 'Proposal Out', street_address: '', city: '', state: '', zip_code: '',
    home_value: '', mortgage_balance: '', non_borrowing_spouse: false,
    spouse_first_name: '', spouse_last_name: '', spouse_date_of_birth: ''
  })
  const [editingClient, setEditingClient] = useState(null)
  const [viewingClient, setViewingClient] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)

  // Session timeout management
  const resetTimeout = () => {
    if (activityTimeout) clearTimeout(activityTimeout)
    if (warningTimeout) clearTimeout(warningTimeout)
    setShowTimeoutWarning(false)

    // Set 8 minutes for warning, 10 minutes total for logout
    const warningTime = 8 * 60 * 1000 // 8 minutes
    const logoutTime = 10 * 60 * 1000 // 10 minutes

    setWarningTimeout(setTimeout(() => {
      setShowTimeoutWarning(true)
      setTimeoutCountdown(120) // 2 minutes countdown
    }, warningTime))

    setActivityTimeout(setTimeout(async () => {
      await supabase.auth.signOut()
      setUser(null)
      setClients([])
      setShowTimeoutWarning(false)
      alert('Session expired due to inactivity')
    }, logoutTime))
  }

  // Activity listeners
  useEffect(() => {
    if (user) {
      const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      const resetTimer = () => resetTimeout()
      
      activities.forEach(activity => {
        document.addEventListener(activity, resetTimer)
      })

      resetTimeout() // Initial timeout

      return () => {
        activities.forEach(activity => {
          document.removeEventListener(activity, resetTimer)
        })
        if (activityTimeout) clearTimeout(activityTimeout)
        if (warningTimeout) clearTimeout(warningTimeout)
      }
    }
  }, [user])

  // Timeout countdown
  useEffect(() => {
    if (showTimeoutWarning && timeoutCountdown > 0) {
      const timer = setTimeout(() => {
        setTimeoutCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showTimeoutWarning, timeoutCountdown])

  // Authentication check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load clients when user logs in
  useEffect(() => {
    if (user) {
      loadClients()
    }
  }, [user])

  // Filter clients based on search
  useEffect(() => {
    const filtered = clients.filter(client =>
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.pipeline_status?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredClients(filtered)
  }, [clients, searchTerm])

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Get PLF value based on age and program - CORRECTED VALUES
  const getPLF = (program, age) => {
    if (!age || age < 62) return 0
    
    // HECM R3/PLF3 values at 6.375% rate
    const HECM_PLF_R3 = {
      62: 0.358, 63: 0.362, 64: 0.365, 65: 0.370, 66: 0.359, 67: 0.382, 68: 0.388,
      69: 0.394, 70: 0.402, 71: 0.410, 72: 0.399, 73: 0.426, 74: 0.437, 75: 0.447,
      76: 0.457, 77: 0.467, 78: 0.477, 79: 0.484, 80: 0.495, 81: 0.506, 82: 0.520,
      83: 0.534, 84: 0.548, 85: 0.563, 86: 0.575, 87: 0.590, 88: 0.606, 89: 0.622,
      90: 0.639, 91: 0.656, 92: 0.674, 93: 0.691, 94: 0.709, 95: 0.728
    }
    
    if (program === 'HECM') {
      return HECM_PLF_R3[age] || 0
    }
    
    // Keep old tables for other programs (will fix these later)
    const table = PLF_TABLES[program]
    if (!table) return 0
    return table[age] || 0
  }

  // Calculate net proceeds
  const calculateNetProceeds = (homeValue, mortgageBalance, age) => {
    if (!homeValue || !age || age < 62) return 0
    const plf = getPLF('HECM', age) / 100
    const eligibleAmount = homeValue * plf
    return Math.max(0, eligibleAmount - (mortgageBalance || 0))
  }

  // Get available programs based on home value and age
  const getAvailablePrograms = (homeValue, age) => {
    if (!age || age < 62) return []
    
    const programs = []
    
    // HECM always available for qualified borrowers
    programs.push({
      name: 'HECM',
      description: 'FHA-insured reverse mortgage',
      plf: getPLF('HECM', age) / 100
    })
    
    // Proprietary products only for homes $450K+
    if (homeValue >= 450000) {
      programs.push({
        name: 'Equity Plus',
        description: 'Proprietary reverse mortgage',
        plf: getPLF('Equity Plus', age) / 100
      })
      
      programs.push({
        name: 'Peak',
        description: 'Premium proprietary product',
        plf: getPLF('Peak', age) / 100
      })
      
      programs.push({
        name: 'LOC',
        description: 'Line of credit option',
        plf: getPLF('LOC', age) / 100
      })
    }
    
    return programs
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

  // Calculate rate revenue for HECM based on utilization
  const calculateRateRevenue = (program, totalUPB, principalLimit) => {
    if (program !== 'HECM') return 0
    
    const utilization = (totalUPB / principalLimit) * 100
    
    // Rate sheet BPS values at 2.5% margin minus 1.00% corporate override
    let netBPS = 0
    
    if (utilization <= 10) {
      netBPS = 110.375 // 111.375 - 1.00
    } else if (utilization <= 20) {
      netBPS = 107.375 // 108.375 - 1.00
    } else if (utilization <= 30) {
      netBPS = 106.000 // 107.000 - 1.00
    } else if (utilization <= 40) {
      netBPS = 104.875 // 105.875 - 1.00
    } else if (utilization <= 50) {
      netBPS = 104.125 // 105.125 - 1.00
    } else if (utilization <= 60) {
      netBPS = 104.125 // 105.125 - 1.00
    } else if (utilization <= 70) {
      netBPS = 103.375 // 104.375 - 1.00
    } else if (utilization <= 80) {
      netBPS = 103.125 // 104.125 - 1.00
    } else if (utilization <= 90) {
      netBPS = 102.875 // 103.875 - 1.00
    } else {
      netBPS = 102.625 // 103.625 - 1.00
    }
    
    return totalUPB * (netBPS / 10000) // Convert BPS to decimal
  }

  // Get pipeline card styling
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
    return styles[status] || 'bg-white border-2 border-gray-400 shadow-lg hover:shadow-xl text-gray-900'
  }

  // Get pipeline stage color for badges
  const getPipelineStageColor = (status) => {
    const stage = PIPELINE_STAGES.find(s => s.value === status || s.label === status)
    return stage ? stage.color : 'bg-gray-100 border-gray-300 text-gray-800'
  }

  // Authentication functions
  const handleLogin = async () => {
    setAuthLoading(true)
    console.log('Attempting login with:', loginForm.email)
    
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password
    })

    if (error) {
      console.error('Login error:', error)
      alert(error.message)
    }
    
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setClients([])
    if (activityTimeout) clearTimeout(activityTimeout)
    if (warningTimeout) clearTimeout(warningTimeout)
    setShowTimeoutWarning(false)
  }

  // Client CRUD operations
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

  // Robust date converter - handles multiple formats
  const convertDateForDatabase = (dateInput) => {
    if (!dateInput || dateInput.trim() === '') return null
    
    try {
      let date
      
      // Handle MM/DD/YYYY or M/D/YYYY
      if (dateInput.includes('/')) {
        const [month, day, year] = dateInput.split('/')
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      // Handle MM-DD-YYYY
      else if (dateInput.includes('-') && dateInput.length <= 10) {
        const parts = dateInput.split('-')
        if (parts[0].length === 4) {
          // YYYY-MM-DD format
          date = new Date(dateInput)
        } else {
          // MM-DD-YYYY format
          const [month, day, year] = parts
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }
      }
      // Handle other formats - let JavaScript try to parse
      else {
        date = new Date(dateInput)
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null
      }
      
      // Return in YYYY-MM-DD format
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      
      return `${year}-${month}-${day}`
      
    } catch (error) {
      console.error('Date conversion error:', error)
      return null
    }
  }

  const addClient = async () => {
    // Convert date format before saving
    const clientData = { ...newClient }
    
    // Handle date conversion
    const convertedDate = convertDateForDatabase(clientData.date_of_birth)
    if (convertedDate) {
      clientData.date_of_birth = convertedDate
    } else if (clientData.date_of_birth) {
      // If date conversion failed but there was input, show error
      alert('Please enter a valid date format (MM/DD/YYYY, MM-DD-YYYY, or YYYY-MM-DD)')
      return
    } else {
      // Remove empty date field
      delete clientData.date_of_birth
    }

    const { error } = await supabase
      .from('clients')
      .insert([clientData])

    if (error) {
      console.error('Error adding client:', error)
      alert('Error adding client: ' + error.message)
    } else {
      setNewClient({
        first_name: '', last_name: '', email: '', phone: '', date_of_birth: '',
        pipeline_status: 'Proposal Out', street_address: '', city: '', state: '', zip_code: '',
        home_value: '', mortgage_balance: '', non_borrowing_spouse: false,
        spouse_first_name: '', spouse_last_name: '', spouse_date_of_birth: ''
      })
      setShowAddModal(false)
      loadClients()
    }
  }

  const updateClient = async () => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(editingClient)
        .eq('id', editingClient.id)

      if (error) {
        console.error('Error updating client:', error)
        if (error.message.includes("column") && error.message.includes("does not exist")) {
          alert('Client updated (address fields not saved - database schema needs updating)')
        } else {
          alert('Error updating client: ' + error.message)
        }
      } else {
        alert('Client updated successfully!')
      }
      
      setShowEditModal(false)
      setEditingClient(null)
      loadClients()
    } catch (err) {
      console.error('Update error:', err)
      alert('Error updating client')
    }
  }

  const deleteClient = async (id) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting client:', error)
      alert('Error deleting client: ' + error.message)
    } else {
      setShowDeleteModal(false)
      setSelectedClient(null)
      loadClients()
    }
  }

  // Statistics calculations
  const totalClients = clients.length
  const avgHomeValue = clients.length > 0 
    ? clients.reduce((sum, client) => sum + (parseFloat(client.home_value) || 0), 0) / clients.length 
    : 0
  const totalNetProceeds = clients.reduce((sum, client) => {
    const age = calculateAge(client.date_of_birth)
    const netProceeds = calculateNetProceeds(client.home_value, client.mortgage_balance, age)
    return sum + netProceeds
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
                      <a
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

              {/* NEW HECM PROFITABILITY SECTION */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">💰 HECM Profitability Analysis</h3>
                
                <div className="grid gap-6 md:grid-cols-1">
                  {getAvailablePrograms(selectedClient.home_value, calculateAge(selectedClient.date_of_birth))
                    .filter(program => program.name === 'HECM')
                    .map((program) => {
                      const age = calculateAge(selectedClient.date_of_birth)
                      const disbursement = calculateHECMDisbursement(
                        selectedClient.home_value, 
                        selectedClient.mortgage_balance, 
                        age
                      )
                      const rateRevenue = calculateRateRevenue('HECM', disbursement.totalUPB, disbursement.principalLimit)
                      const utilization = ((disbursement.totalUPB / disbursement.principalLimit) * 100).toFixed(1)
                      const totalProfit = disbursement.originationFee + rateRevenue
                      
                      return (
                        <div key="hecm-profit" className="bg-green-50 border border-green-200 rounded-xl p-6">
                          <h4 className="text-xl font-semibold text-green-800 mb-6">HECM Loan Breakdown</h4>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column - Loan Details */}
                            <div className="space-y-4">
                              <div className="bg-white rounded-lg p-4 border border-green-100">
                                <h5 className="font-semibold text-green-700 mb-3">Loan Structure</h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Principal Limit:</span>
                                    <span className="font-medium">${disbursement.principalLimit.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Cash Out:</span>
                                    <span className="font-medium text-blue-600">${disbursement.cashOut.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Line of Credit:</span>
                                    <span className="font-medium text-purple-600">${disbursement.lineOfCredit.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                                    <span className="font-semibold text-gray-900">Total UPB:</span>
                                    <span className="font-bold text-green-700">${disbursement.totalUPB.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Column - Profitability */}
                            <div className="space-y-4">
                              <div className="bg-white rounded-lg p-4 border border-green-100">
                                <h5 className="font-semibold text-green-700 mb-3">Revenue Breakdown</h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Origination Fee:</span>
                                    <span className="font-medium text-green-600">${disbursement.originationFee.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Utilization:</span>
                                    <span className="font-medium text-blue-600">{utilization}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Rate Revenue (Net BPS):</span>
                                    <span className="font-medium text-green-600">${Math.round(rateRevenue).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                                    <span className="font-semibold text-gray-900">Total Profit:</span>
                                    <span className="font-bold text-green-700">${Math.round(totalProfit).toLocaleString()}</span>
                                  </div>
                                  <div className="text-xs text-green-600 text-center mt-2 pt-2 border-t border-green-100">
                                    Available for Commission Split
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Client gets:</strong> ${disbursement.cashOut.toLocaleString()} cash out + ${disbursement.lineOfCredit.toLocaleString()} line of credit
                              <br />
                              <strong>Lender profit:</strong> ${Math.round(totalProfit).toLocaleString()} available for commission split
                            </p>
                          </div>
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
