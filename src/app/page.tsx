'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3, LogOut, EyeOff, Lock } from 'lucide-react'

const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQzNTMxNjYsImV4cCI6MjAzOTkyOTE2Nn0.kAp6hmt6gqFJoxr5NwBiCh0FaxXOgywpUptRoZMHgJI'

const supabase = createClient(supabaseUrl, supabaseKey)

// CORRECTED PLF Tables with YOUR EXACT VALUES
const HECM_PLF = {
  62: 0.339, 63: 0.346, 64: 0.353, 65: 0.361, 66: 0.368, 67: 0.376, 68: 0.384, 69: 0.392, 70: 0.397,
  71: 0.397, 72: 0.399, 73: 0.408, 74: 0.416, 75: 0.426, 76: 0.433, 77: 0.443, 78: 0.454, 79: 0.460,
  80: 0.472, 81: 0.483, 82: 0.496, 83: 0.508, 84: 0.521, 85: 0.535, 86: 0.548, 87: 0.563, 88: 0.575,
  89: 0.590, 90: 0.606, 91: 0.622, 92: 0.639, 93: 0.656, 94: 0.674, 95: 0.691
}

const EQUITY_PLUS_PLF = {
  55: 0.338, 56: 0.341, 57: 0.343, 58: 0.346, 59: 0.349, 60: 0.353, 61: 0.356, 62: 0.358, 63: 0.362,
  64: 0.365, 65: 0.370, 66: 0.376, 67: 0.382, 68: 0.388, 69: 0.394, 70: 0.402, 71: 0.410, 72: 0.426,
  73: 0.426, 74: 0.437, 75: 0.447, 76: 0.457, 77: 0.467, 78: 0.472, 79: 0.484, 80: 0.495, 81: 0.506,
  82: 0.520, 83: 0.534, 84: 0.540, 85: 0.550, 86: 0.553, 87: 0.557, 88: 0.559, 89: 0.559, 90: 0.559,
  91: 0.559, 92: 0.559, 93: 0.559, 94: 0.559, 95: 0.559
}

const PEAK_PLF = {
  55: 0.391, 56: 0.393, 57: 0.396, 58: 0.397, 59: 0.400, 60: 0.404, 61: 0.407, 62: 0.410, 63: 0.414,
  64: 0.419, 65: 0.424, 66: 0.429, 67: 0.435, 68: 0.440, 69: 0.446, 70: 0.453, 71: 0.460, 72: 0.477,
  73: 0.477, 74: 0.487, 75: 0.497, 76: 0.516, 77: 0.524, 78: 0.534, 79: 0.543, 80: 0.544, 81: 0.556,
  82: 0.563, 83: 0.581, 84: 0.590, 85: 0.600, 86: 0.603, 87: 0.606, 88: 0.610, 89: 0.610, 90: 0.611,
  91: 0.611, 92: 0.611, 93: 0.611, 94: 0.611, 95: 0.611
}

const LOC_PLF = {
  55: 0.338, 56: 0.341, 57: 0.343, 58: 0.346, 59: 0.349, 60: 0.353, 61: 0.356, 62: 0.358, 63: 0.362,
  64: 0.365, 65: 0.370, 66: 0.376, 67: 0.382, 68: 0.388, 69: 0.394, 70: 0.402, 71: 0.410, 72: 0.426,
  73: 0.426, 74: 0.437, 75: 0.447, 76: 0.467, 77: 0.472, 78: 0.484, 79: 0.495, 80: 0.506, 81: 0.506,
  82: 0.520, 83: 0.534, 84: 0.540, 85: 0.550, 86: 0.553, 87: 0.557, 88: 0.559, 89: 0.559, 90: 0.559,
  91: 0.559, 92: 0.559, 93: 0.559, 94: 0.559, 95: 0.559
}

export default function NextStepCRM() {
  // Authentication state
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  // Core state
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showProgramComparison, setShowProgramComparison] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [viewingClient, setViewingClient] = useState(null)

  // Form state for new client
  const [newClient, setNewClient] = useState({
    first_name: '', last_name: '', email: '', phone: '', date_of_birth: '',
    street_address: '', city: '', state: '', zip_code: '',
    home_value: '', mortgage_balance: '', program_type: '', pipeline_status: 'Lead',
    spouse_first_name: '', spouse_last_name: '', spouse_date_of_birth: '', non_borrowing_spouse: false
  })

  // Check authentication on load
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      
      if (session?.user) {
        await loadClients()
      }
      setLoading(false)
    }
    
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          loadClients()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password
    })

    if (error) {
      alert('Login failed: ' + error.message)
    }
    
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
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
    const { data, error } = await supabase
      .from('clients')
      .insert([newClient])
      .select()

    if (error) {
      console.error('Error adding client:', error)
      alert('Error adding client: ' + error.message)
    } else {
      setClients([...clients, data[0]])
      setShowAddModal(false)
      setNewClient({
        first_name: '', last_name: '', email: '', phone: '', date_of_birth: '',
        street_address: '', city: '', state: '', zip_code: '',
        home_value: '', mortgage_balance: '', program_type: '', pipeline_status: 'Lead',
        spouse_first_name: '', spouse_last_name: '', spouse_date_of_birth: '', non_borrowing_spouse: false
      })
    }
  }

  const updateClient = async () => {
    const { data, error } = await supabase
      .from('clients')
      .update(editingClient)
      .eq('id', editingClient.id)
      .select()

    if (error) {
      console.error('Error updating client:', error)
      alert('Error updating client: ' + error.message)
    } else {
      setClients(clients.map(c => c.id === editingClient.id ? data[0] : c))
      setShowEditModal(false)
      setEditingClient(null)
    }
  }

  const deleteClient = async () => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', selectedClient.id)

    if (error) {
      console.error('Error deleting client:', error)
      alert('Error deleting client: ' + error.message)
    } else {
      setClients(clients.filter(c => c.id !== selectedClient.id))
      setShowDeleteModal(false)
      setSelectedClient(null)
    }
  }

  // Calculate age from date of birth
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

  // Calculate PLF based on age and program
  const calculatePLF = (age, program) => {
    if (!age || age < 55) return 0
    
    switch(program) {
      case 'HECM':
        return HECM_PLF[Math.min(Math.max(age, 62), 95)] || 0
      case 'Equity Plus':
        return EQUITY_PLUS_PLF[Math.min(Math.max(age, 55), 95)] || 0
      case 'Peak':
        return PEAK_PLF[Math.min(Math.max(age, 55), 95)] || 0
      case 'LOC':
        return LOC_PLF[Math.min(Math.max(age, 55), 95)] || 0
      default:
        return 0
    }
  }

  // Calculate net proceeds
  const calculateNetProceeds = (homeValue, mortgageBalance, plf) => {
    const grossProceeds = homeValue * plf
    return Math.max(0, grossProceeds - (mortgageBalance || 0))
  }

  // Determine which programs client qualifies for based on $450K minimum
  const getQualifyingPrograms = (homeValue) => {
    const programs = ['HECM']
    if (homeValue >= 450000) {
      programs.push('Equity Plus', 'Peak', 'LOC')
    }
    return programs
  }

  // Get program comparisons for a client
  const getProgramComparisons = (client) => {
    const age = calculateAge(client.date_of_birth)
    const homeValue = parseFloat(client.home_value) || 0
    const mortgageBalance = parseFloat(client.mortgage_balance) || 0
    const qualifyingPrograms = getQualifyingPrograms(homeValue)
    
    return qualifyingPrograms.map(program => {
      const plf = calculatePLF(age, program)
      const netProceeds = calculateNetProceeds(homeValue, mortgageBalance, plf)
      return {
        name: program,
        plf: plf,
        grossProceeds: homeValue * plf,
        netProceeds: netProceeds
      }
    }).sort((a, b) => b.netProceeds - a.netProceeds)
  }

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm) ||
    client.pipeline_status?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats
  const totalClients = clients.length
  const totalValue = clients.reduce((sum, client) => sum + (parseFloat(client.home_value) || 0), 0)
  const averageValue = totalClients > 0 ? totalValue / totalClients : 0
  const pipelineStats = clients.reduce((stats, client) => {
    stats[client.pipeline_status] = (stats[client.pipeline_status] || 0) + 1
    return stats
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-green-400 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Next Step CRM</h2>
          <p className="text-blue-100">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-green-400 flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white border-opacity-40">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Next Step CRM
            </h1>
            <p className="text-gray-600 mt-2">Reverse Mortgage Division</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Main CRM Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-green-400">
      {/* Header */}
      <div className="bg-white bg-opacity-90 backdrop-blur-lg shadow-lg border-b border-white border-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Next Step CRM</h1>
                <p className="text-sm text-gray-600">Reverse Mortgage Division</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white border-opacity-40">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Clients</h3>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white border-opacity-40">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Home Value</h3>
                <p className="text-2xl font-bold text-gray-900">${(totalValue / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white border-opacity-40">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Average Home Value</h3>
                <p className="text-2xl font-bold text-gray-900">${(averageValue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white border-opacity-40">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Active Leads</h3>
                <p className="text-2xl font-bold text-gray-900">{pipelineStats.Lead || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add Client */}
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-6 border border-white border-opacity-40">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, phone, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Client
            </button>
          </div>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClients.map((client) => {
            const age = calculateAge(client.date_of_birth)
            const homeValue = parseFloat(client.home_value) || 0
            const mortgageBalance = parseFloat(client.mortgage_balance) || 0
            const comparisons = getProgramComparisons(client)
            const bestProgram = comparisons[0]
            
            return (
              <div key={client.id} className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-40 overflow-hidden hover:shadow-3xl hover:bg-opacity-100 transition-all duration-300 transform hover:scale-105">
                {/* Client Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {client.first_name} {client.last_name}
                        {age && <span className="text-gray-600 ml-2">({age})</span>}
                      </h3>
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <Phone className="w-4 h-4 text-white" />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">{client.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                            <Mail className="w-4 h-4 text-white" />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">{client.email}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-md ${
                      client.pipeline_status === 'Lead' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' :
                      client.pipeline_status === 'Qualified' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' :
                      client.pipeline_status === 'In Progress' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300' :
                      client.pipeline_status === 'Closed' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' :
                      'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                    }`}>
                      {client.pipeline_status}
                    </span>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Home Value</p>
                          <p className="text-2xl font-bold text-blue-900">
                            ${homeValue.toLocaleString()}
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                          <Home className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl border border-green-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700">Best Net Proceeds</p>
                          <p className="text-2xl font-bold text-green-900">
                            ${bestProgram ? bestProgram.netProceeds.toLocaleString() : '0'}
                          </p>
                          {bestProgram && (
                            <p className="text-xs text-green-600">{bestProgram.name} - {(bestProgram.plf * 100).toFixed(1)}%</p>
                          )}
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {mortgageBalance > 0 && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-700">Current Mortgage Balance</p>
                          <p className="text-xl font-bold text-red-900">${mortgageBalance.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                          <Calculator className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4">
                    <button
                      onClick={() => {
                        setViewingClient(client)
                        setShowViewModal(true)
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedClient(client)
                        setShowProgramComparison(true)
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Compare
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingClient({ ...client })
                        setShowEditModal(true)
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedClient(client)
                        setShowDeleteModal(true)
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <X className="w-4 h-4" />
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
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Client
            </button>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Add New Client</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
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
                      type="text"
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
                      <option value="Lead">Lead</option>
                      <option value="Qualified">Qualified</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mortgage Balance</label>
                    <input
                      type="number"
                      value={newClient.mortgage_balance}
                      onChange={(e) => setNewClient({ ...newClient, mortgage_balance: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                    <select
                      value={newClient.program_type}
                      onChange={(e) => setNewClient({ ...newClient, program_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Program</option>
                      <option value="HECM">HECM</option>
                      <option value="Equity Plus">Equity Plus</option>
                      <option value="Peak">Peak</option>
                      <option value="LOC">LOC</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Spouse Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                    <input
                      type="date"
                      value={newClient.spouse_date_of_birth}
                      onChange={(e) => setNewClient({ ...newClient, spouse_date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      id="nonBorrowingSpouse"
                      checked={newClient.non_borrowing_spouse}
                      onChange={(e) => setNewClient({ ...newClient, non_borrowing_spouse: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="nonBorrowingSpouse" className="ml-2 text-sm text-gray-700">
                      Non-Borrowing Spouse
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Edit Client</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
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
                      type="text"
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
                      <option value="Lead">Lead</option>
                      <option value="Qualified">Qualified</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mortgage Balance</label>
                    <input
                      type="number"
                      value={editingClient.mortgage_balance || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, mortgage_balance: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                    <select
                      value={editingClient.program_type || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, program_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Program</option>
                      <option value="HECM">HECM</option>
                      <option value="Equity Plus">Equity Plus</option>
                      <option value="Peak">Peak</option>
                      <option value="LOC">LOC</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Spouse Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                    <input
                      type="date"
                      value={editingClient.spouse_date_of_birth || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, spouse_date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      id="editNonBorrowingSpouse"
                      checked={editingClient.non_borrowing_spouse || false}
                      onChange={(e) => setEditingClient({ ...editingClient, non_borrowing_spouse: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="editNonBorrowingSpouse" className="ml-2 text-sm text-gray-700">
                      Non-Borrowing Spouse
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateClient}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                Update Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {showViewModal && viewingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Client Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2">
                    <div><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-800">{viewingClient.first_name} {viewingClient.last_name}</span></div>
                    <div><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800">{viewingClient.email}</span></div>
                    <div><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800">{viewingClient.phone}</span></div>
                    <div><span className="font-medium text-gray-600">Date of Birth:</span> <span className="text-gray-800">{viewingClient.date_of_birth}</span></div>
                    <div><span className="font-medium text-gray-600">Age:</span> <span className="text-gray-800">{calculateAge(viewingClient.date_of_birth)}</span></div>
                    <div><span className="font-medium text-gray-600">Pipeline Status:</span> <span className="text-gray-800">{viewingClient.pipeline_status}</span></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Financial Information</h4>
                  <div className="space-y-2">
                    <div><span className="font-medium text-gray-600">Home Value:</span> <span className="text-gray-800">${parseFloat(viewingClient.home_value || 0).toLocaleString()}</span></div>
                    <div><span className="font-medium text-gray-600">Mortgage Balance:</span> <span className="text-gray-800">${parseFloat(viewingClient.mortgage_balance || 0).toLocaleString()}</span></div>
                    <div><span className="font-medium text-gray-600">Program Type:</span> <span className="text-gray-800">{viewingClient.program_type || 'Not selected'}</span></div>
                  </div>
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
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Client</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete {selectedClient.first_name} {selectedClient.last_name}? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteClient}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Comparison Modal */}
      {showProgramComparison && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Program Comparison</h3>
                  <p className="text-gray-600">{selectedClient.first_name} {selectedClient.last_name} - Age {calculateAge(selectedClient.date_of_birth)}</p>
                </div>
                <button onClick={() => setShowProgramComparison(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getProgramComparisons(selectedClient).map((program, index) => (
                  <div key={program.name} className={`bg-white rounded-xl shadow-lg border-2 p-6 ${index === 0 ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-200'}`}>
                    {index === 0 && (
                      <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full mb-4 text-center">
                        BEST OPTION
                      </div>
                    )}
                    <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">{program.name}</h4>
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">PLF Rate</p>
                        <p className="text-2xl font-bold text-blue-600">{(program.plf * 100).toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Gross Proceeds</p>
                        <p className="text-lg font-semibold text-gray-900">${program.grossProceeds.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Net Proceeds</p>
                        <p className="text-xl font-bold text-green-600">${program.netProceeds.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Home Value</p>
                    <p className="text-xl font-bold text-gray-900">${parseFloat(selectedClient.home_value || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Current Mortgage</p>
                    <p className="text-xl font-bold text-red-600">${parseFloat(selectedClient.mortgage_balance || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Client Age</p>
                    <p className="text-xl font-bold text-blue-600">{calculateAge(selectedClient.date_of_birth)} years</p>
                  </div>
                </div>
                {parseFloat(selectedClient.home_value || 0) < 450000 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Home value is under $450,000. Only HECM program is available. Equity Plus, Peak, and LOC require minimum $450,000 home value.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
