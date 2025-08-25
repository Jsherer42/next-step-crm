'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3, Eye as EyeIcon, EyeOff, Lock, LogOut } from 'lucide-react'

// Initialize Supabase client
const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'

const supabase = createClient(supabaseUrl, supabaseKey)

// LOGIN COMPONENT
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Invalid email or password. Please try again.')
        setLoading(false)
        return
      }

      if (data.user) {
        if (rememberMe) {
          localStorage.setItem('nextStepCRM_rememberMe', 'true')
        }
        onLogin(data.user)
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Next Step CRM
          </h1>
          <p className="text-gray-600">Reverse Mortgage Division</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="jeremiah.sherer@city1st.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function NextStepCRM() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [editingClient, setEditingClient] = useState({})
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    home_value: '',
    current_mortgage_balance: '',
    pipeline_status: 'Lead',
    non_borrowing_spouse: false
  })
  const [sessionTimeout, setSessionTimeout] = useState(null)
  const [showWarning, setShowWarning] = useState(false)

  const pipelineStatuses = [
    'Lead',
    'Contacted',
    'Qualified',
    'Proposal Out/Pitched',
    'Application Started',
    'Processing',
    'Underwriting',
    'Approval',
    'Docs Out',
    'Funded',
    'Declined',
    'Dead'
  ]

  const statusColors = {
    'Lead': 'bg-gray-100 text-gray-800 border border-gray-200',
    'Contacted': 'bg-blue-100 text-blue-800 border border-blue-200',
    'Qualified': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    'Proposal Out/Pitched': 'bg-purple-100 text-purple-800 border border-purple-200',
    'Application Started': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'Processing': 'bg-orange-100 text-orange-800 border border-orange-200',
    'Underwriting': 'bg-red-100 text-red-800 border border-red-200',
    'Approval': 'bg-green-100 text-green-800 border border-green-200',
    'Docs Out': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    'Funded': 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    'Declined': 'bg-rose-100 text-rose-800 border border-rose-200',
    'Dead': 'bg-stone-100 text-stone-800 border border-stone-200'
  }

  const cardColors = {
    'Lead': 'bg-gradient-to-br from-gray-50/60 to-gray-100/60',
    'Contacted': 'bg-gradient-to-br from-blue-50/60 to-blue-100/60',
    'Qualified': 'bg-gradient-to-br from-indigo-50/60 to-indigo-100/60',
    'Proposal Out/Pitched': 'bg-gradient-to-br from-purple-50/60 to-purple-100/60',
    'Application Started': 'bg-gradient-to-br from-yellow-50/60 to-yellow-100/60',
    'Processing': 'bg-gradient-to-br from-orange-50/60 to-orange-100/60',
    'Underwriting': 'bg-gradient-to-br from-red-50/60 to-red-100/60',
    'Approval': 'bg-gradient-to-br from-green-50/60 to-green-100/60',
    'Docs Out': 'bg-gradient-to-br from-emerald-50/60 to-emerald-100/60',
    'Funded': 'bg-gradient-to-br from-cyan-50/60 to-cyan-100/60',
    'Declined': 'bg-gradient-to-br from-rose-50/60 to-rose-100/60',
    'Dead': 'bg-gradient-to-br from-stone-50/60 to-stone-100/60'
  }

  // Authentication and session management
  useEffect(() => {
    checkSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null)
          setLoading(false)
          startSessionTimeout()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
          clearSessionTimeout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
    setLoading(false)
    
    if (session?.user) {
      startSessionTimeout()
    }
  }

  const startSessionTimeout = () => {
    clearSessionTimeout()
    
    // 8 minute warning
    const warningTimeout = setTimeout(() => {
      setShowWarning(true)
    }, 8 * 60 * 1000)
    
    // 10 minute logout
    const logoutTimeout = setTimeout(() => {
      handleLogout()
    }, 10 * 60 * 1000)
    
    setSessionTimeout({ warningTimeout, logoutTimeout })
  }

  const clearSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout.warningTimeout)
      clearTimeout(sessionTimeout.logoutTimeout)
      setSessionTimeout(null)
    }
    setShowWarning(false)
  }

  const extendSession = () => {
    setShowWarning(false)
    startSessionTimeout()
  }

  const handleLogout = async () => {
    clearSessionTimeout()
    await supabase.auth.signOut()
  }

  const handleLogin = (user) => {
    setUser(user)
  }

  // Load clients on component mount and when user changes
  useEffect(() => {
    if (user) {
      loadClients()
    }
  }, [user])

  // Filter clients when search term or status changes
  useEffect(() => {
    filterClients()
  }, [clients, searchTerm, selectedStatus])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
      alert('Error loading clients. Please refresh the page.')
    }
  }

  const filterClients = () => {
    let filtered = clients
    
    if (searchTerm) {
      filtered = filtered.filter(client =>
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
      )
    }
    
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(client => client.pipeline_status === selectedStatus)
    }
    
    setFilteredClients(filtered)
  }

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

  const addClient = async () => {
    const { error } = await supabase
      .from('clients')
      .insert([newClient])

    if (error) {
      console.error('Error adding client:', error)
      alert('Error adding client: ' + error.message)
    } else {
      setNewClient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        home_value: '',
        current_mortgage_balance: '',
        pipeline_status: 'Lead',
        non_borrowing_spouse: false
      })
      setShowAddModal(false)
      loadClients()
    }
  }

  const updateClient = async () => {
    const { error } = await supabase
      .from('clients')
      .update(editingClient)
      .eq('id', editingClient.id)

    if (error) {
      console.error('Error updating client:', error)
      alert('Error updating client: ' + error.message)
    } else {
      setShowEditModal(false)
      setEditingClient({})
      loadClients()
    }
  }

  const deleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) {
        console.error('Error deleting client:', error)
        alert('Error deleting client: ' + error.message)
      } else {
        loadClients()
      }
    }
  }

  const openEditModal = (client) => {
    setEditingClient({ ...client })
    setShowEditModal(true)
  }

  const openViewModal = (client) => {
    setSelectedClient(client)
    setShowViewModal(true)
  }

  const openCompareModal = (client) => {
    setSelectedClient(client)
    setShowCompareModal(true)
  }

  // Get PLF value based on age and program
  const getPLF = (program, age) => {
    if (!age || age < 62) return 0
    
    // HECM R3/PLF3 values at 6.375% rate
    const HECM_PLF_R3 = {
      62: 0.358, 63: 0.362, 64: 0.365, 65: 0.369, 66: 0.372, 67: 0.375, 68: 0.379, 69: 0.382,
      70: 0.386, 71: 0.389, 72: 0.399, 73: 0.404, 74: 0.408, 75: 0.413, 76: 0.418, 77: 0.423,
      78: 0.428, 79: 0.433, 80: 0.438, 81: 0.444, 82: 0.450, 83: 0.456, 84: 0.462, 85: 0.469,
      86: 0.476, 87: 0.484, 88: 0.492, 89: 0.501, 90: 0.511, 91: 0.522, 92: 0.535, 93: 0.549,
      94: 0.565, 95: 0.583
    }

    if (program === 'HECM') {
      return HECM_PLF_R3[age] || 0
    }
    
    return 0
  }

  // Get available programs based on home value and age
  const getAvailablePrograms = (homeValue, age) => {
    const programs = []
    
    if (age >= 62) {
      programs.push('HECM')
      
      if (homeValue >= 450000) {
        programs.push('Equity Plus')
        programs.push('Peak')
        programs.push('LOC')
      }
    }
    
    return programs
  }

  // Calculate loan amounts and proceeds
  const calculateLoanDetails = (program, homeValue, currentMortgage, age) => {
    const plf = getPLF(program, age)
    if (!plf) return null
    
    const principalLimit = homeValue * plf
    const netProceeds = principalLimit - (currentMortgage || 0)
    
    return {
      principalLimit: Math.round(principalLimit),
      netProceeds: Math.round(Math.max(0, netProceeds)),
      plf: (plf * 100).toFixed(1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading Next Step CRM...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-50">
      {/* Session Warning */}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Your session will expire in 2 minutes due to inactivity.
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-yellow-50 rounded-md p-1.5 inline-flex items-center justify-center text-yellow-400 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                onClick={extendSession}
              >
                <span className="text-xs text-yellow-800 mr-2">Extend</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Next Step CRM
                </h1>
                <p className="text-sm text-gray-600">Reverse Mortgage Division</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Total Net Proceeds: ${filteredClients.reduce((sum, client) => {
                    const age = calculateAge(client.date_of_birth)
                    const programs = getAvailablePrograms(client.home_value, age)
                    if (programs.length > 0) {
                      const details = calculateLoanDetails(programs[0], client.home_value, client.current_mortgage_balance, age)
                      return sum + (details?.netProceeds || 0)
                    }
                    return sum
                  }, 0).toLocaleString()}
                </span>
              </div>
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                className="pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none shadow-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                {pipelineStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </button>
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const age = calculateAge(client.date_of_birth)
            const programs = getAvailablePrograms(client.home_value, age)
            const primaryProgram = programs[0]
            const loanDetails = primaryProgram ? calculateLoanDetails(primaryProgram, client.home_value, client.current_mortgage_balance, age) : null
            
            return (
              <div 
                key={client.id} 
                className={`${cardColors[client.pipeline_status]} backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-white/20 transform hover:scale-105`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">Age {age}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[client.pipeline_status]}`}>
                      {client.pipeline_status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-2">
                        <Phone className="w-3 h-3 text-white" />
                      </div>
                      {client.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-2">
                        <Mail className="w-3 h-3 text-white" />
                      </div>
                      {client.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mr-2">
                        <HomeIcon className="w-3 h-3 text-white" />
                      </div>
                      ${client.home_value?.toLocaleString()}
                    </div>
                    {loanDetails && (
                      <div className="flex items-center text-sm text-green-700 font-semibold">
                        <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mr-2">
                          <DollarSign className="w-3 h-3 text-white" />
                        </div>
                        Est. Net Proceeds: ${loanDetails.netProceeds.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openViewModal(client)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Client"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Client"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => openCompareModal(client)}
                      className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm transform hover:scale-105"
                    >
                      <Calculator className="w-4 h-4 mr-1" />
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600">Get started by adding your first client.</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Add New Client
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={newClient.first_name}
                    onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={newClient.last_name}
                    onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={newClient.date_of_birth}
                    onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                  <select
                    value={newClient.pipeline_status}
                    onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {pipelineStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={newClient.street_address}
                  onChange={(e) => setNewClient({...newClient, street_address: e.target.value})}
                  className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={newClient.city}
                    onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={newClient.state}
                    onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={newClient.zip_code}
                    onChange={(e) => setNewClient({...newClient, zip_code: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                  <input
                    type="number"
                    value={newClient.home_value}
                    onChange={(e) => setNewClient({...newClient, home_value: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={newClient.current_mortgage_balance}
                    onChange={(e) => setNewClient({...newClient, current_mortgage_balance: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="non_borrowing_spouse"
                  checked={newClient.non_borrowing_spouse}
                  onChange={(e) => setNewClient({...newClient, non_borrowing_spouse: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="non_borrowing_spouse" className="ml-2 text-sm font-medium text-gray-700">
                  Has Non-Borrowing Spouse
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Programs Modal */}
      {showCompareModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Program Comparison - {selectedClient.first_name} {selectedClient.last_name}
              </h2>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Age:</span>
                    <span className="ml-2">{calculateAge(selectedClient.date_of_birth)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Home Value:</span>
                    <span className="ml-2">${selectedClient.home_value?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Current Mortgage:</span>
                    <span className="ml-2">${selectedClient.current_mortgage_balance?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Available Programs:</span>
                    <span className="ml-2">{getAvailablePrograms(selectedClient.home_value, calculateAge(selectedClient.date_of_birth)).length}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getAvailablePrograms(selectedClient.home_value, calculateAge(selectedClient.date_of_birth)).map((program) => {
                  const age = calculateAge(selectedClient.date_of_birth)
                  const details = calculateLoanDetails(program, selectedClient.home_value, selectedClient.current_mortgage_balance, age)
                  
                  if (!details) return null

                  const netProceeds = details.netProceeds

                  return (
                    <div key={program} className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{program}</h3>
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <DollarSign className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">PLF:</span>
                          <span className="font-semibold">{details.plf}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Principal Limit:</span>
                          <span className="font-semibold">${details.principalLimit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Mortgage:</span>
                          <span className="font-semibold text-red-600">-${(selectedClient.current_mortgage_balance || 0).toLocaleString()}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between">
                          <span className="text-gray-600">Net Proceeds:</span>
                          <span className={`font-semibold ml-2 ${netProceeds > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.round(Math.max(0, netProceeds)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-white/20">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> These are estimated calculations based on current rates and age-based PLF tables. 
                  Actual loan amounts may vary based on interest rates, closing costs, and other factors.
                  Age {calculateAge(selectedClient.date_of_birth)} client qualifies for {getAvailablePrograms(selectedClient.home_value, calculateAge(selectedClient.date_of_birth)).length} program(s).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Edit Client
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editingClient.first_name || ''}
                    onChange={(e) => setEditingClient({...editingClient, first_name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editingClient.last_name || ''}
                    onChange={(e) => setEditingClient({...editingClient, last_name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingClient.email || ''}
                    onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={editingClient.date_of_birth || ''}
                    onChange={(e) => setEditingClient({...editingClient, date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                  <select
                    value={editingClient.pipeline_status || ''}
                    onChange={(e) => setEditingClient({...editingClient, pipeline_status: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {pipelineStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={editingClient.street_address || ''}
                  onChange={(e) => setEditingClient({...editingClient, street_address: e.target.value})}
                  className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editingClient.city || ''}
                    onChange={(e) => setEditingClient({...editingClient, city: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={editingClient.state || ''}
                    onChange={(e) => setEditingClient({...editingClient, state: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={editingClient.zip_code || ''}
                    onChange={(e) => setEditingClient({...editingClient, zip_code: e.target.value})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                  <input
                    type="number"
                    value={editingClient.home_value || ''}
                    onChange={(e) => setEditingClient({...editingClient, home_value: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={editingClient.current_mortgage_balance || ''}
                    onChange={(e) => setEditingClient({...editingClient, current_mortgage_balance: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_non_borrowing_spouse"
                  checked={editingClient.non_borrowing_spouse || false}
                  onChange={(e) => setEditingClient({...editingClient, non_borrowing_spouse: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="edit_non_borrowing_spouse" className="ml-2 text-sm font-medium text-gray-700">
                  Has Non-Borrowing Spouse
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateClient}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md"
              >
                Update Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Client Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-gray-900">{selectedClient.first_name} {selectedClient.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Age</label>
                    <p className="text-gray-900">{calculateAge(selectedClient.date_of_birth)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedClient.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
