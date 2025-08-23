'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3, LogOut, EyeOff, Lock } from 'lucide-react'

// Updated API key that works
const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'
const supabase = createClient(supabaseUrl, supabaseKey)

// HECM PLF lookup table (R3/PLF3 values for 6.375% rate)
const hecmPLFTable = {
  62: 0.364, 63: 0.371, 64: 0.378, 65: 0.385, 66: 0.392, 67: 0.399, 68: 0.406, 69: 0.413, 70: 0.420, 71: 0.427, 72: 0.399,
  73: 0.441, 74: 0.448, 75: 0.455, 76: 0.462, 77: 0.469, 78: 0.476, 79: 0.483, 80: 0.490, 81: 0.497, 82: 0.504, 83: 0.511,
  84: 0.518, 85: 0.525, 86: 0.532, 87: 0.539, 88: 0.546, 89: 0.553, 90: 0.560, 91: 0.567, 92: 0.574, 93: 0.581, 94: 0.588, 95: 0.595
}

export default function NextStepCRM() {
  // Authentication state - proper typing
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  // Core state
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [viewingClient, setViewingClient] = useState(null)
  const [showProgramComparison, setShowProgramComparison] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // Form state
  const [newClient, setNewClient] = useState({
    first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', address: '', city: '', state: '', zip_code: '',
    home_value: '', mortgage_balance: '', program_type: 'HECM', spouse_name: '', spouse_dob: '', spouse_is_nbs: false,
    pipeline_status: 'Lead Generated'
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

  // Login function
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

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setClients([])
  }

  // Load clients from database
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
    }
  }

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Get youngest age between client and spouse
  const getYoungestAge = (client) => {
    const clientAge = calculateAge(client.date_of_birth)
    const spouseAge = client.spouse_dob ? calculateAge(client.spouse_dob) : null
    
    if (clientAge && spouseAge) {
      return Math.min(clientAge, spouseAge)
    }
    return clientAge || spouseAge || 0
  }

  // Calculate UPB for HECM
  const calculateUPB = (homeValue, age, programType = 'HECM') => {
    if (!homeValue || !age) return 0
    
    const maxLoanAmount = Math.min(homeValue, 1149825) // FHA lending limit
    const plf = hecmPLFTable[age] || 0.364
    return Math.round(maxLoanAmount * plf)
  }

  // Add new client
  const handleAddClient = async () => {
    if (!newClient.first_name || !newClient.last_name) {
      alert('Please fill in required fields')
      return
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...newClient,
          home_value: parseFloat(newClient.home_value) || null,
          mortgage_balance: parseFloat(newClient.mortgage_balance) || null
        }])
        .select()

      if (error) throw error

      setClients([...clients, data[0]])
      setShowAddModal(false)
      setNewClient({
        first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', address: '', city: '', state: '', zip_code: '',
        home_value: '', mortgage_balance: '', program_type: 'HECM', spouse_name: '', spouse_dob: '', spouse_is_nbs: false,
        pipeline_status: 'Lead Generated'
      })
    } catch (error) {
      console.error('Error adding client:', error)
      alert('Failed to add client: ' + error.message)
    }
  }

  // Save edited client
  const handleSaveEdit = async () => {
    if (!selectedClient) return

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          first_name: selectedClient.first_name,
          last_name: selectedClient.last_name,
          email: selectedClient.email,
          phone: selectedClient.phone,
          date_of_birth: selectedClient.date_of_birth,
          address: selectedClient.address,
          city: selectedClient.city,
          state: selectedClient.state,
          zip_code: selectedClient.zip_code,
          home_value: parseFloat(selectedClient.home_value) || null,
          mortgage_balance: parseFloat(selectedClient.mortgage_balance) || null,
          program_type: selectedClient.program_type,
          spouse_name: selectedClient.spouse_name,
          spouse_dob: selectedClient.spouse_dob,
          spouse_is_nbs: selectedClient.spouse_is_nbs,
          pipeline_status: selectedClient.pipeline_status
        })
        .eq('id', selectedClient.id)

      if (error) throw error

      setClients(clients.map(client => 
        client.id === selectedClient.id ? selectedClient : client
      ))
      
      setShowEditModal(false)
      setSelectedClient(null)
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Failed to update client: ' + error.message)
    }
  }

  // Delete client
  const handleDeleteClient = async (clientId) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error

      setClients(clients.filter(client => client.id !== clientId))
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client: ' + error.message)
    }
  }

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = `${client.first_name} ${client.last_name} ${client.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || client.pipeline_status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Next Step CRM</h2>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-green-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Next Step CRM</h1>
            <p className="text-blue-100">Professional Reverse Mortgage Management</p>
            <div className="flex items-center justify-center mt-4">
              <User className="w-8 h-8 text-white mr-2" />
              <span className="text-white font-medium">Secure Login</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white bg-opacity-20 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:bg-opacity-30 transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-0 bg-white bg-opacity-20 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:bg-opacity-30 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:bg-opacity-10 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In to CRM'
                )}
              </button>
            </form>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-blue-200 text-xs">
              🔐 Secure authentication powered by enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main CRM Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Next Step CRM</h1>
                <p className="text-sm text-gray-600">Reverse Mortgage Division</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.pipeline_status !== 'Closed').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Calculator className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.pipeline_status === 'Under Review').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Closed Loans</p>
                <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.pipeline_status === 'Closed').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              
              <div className="relative">
                <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="Lead Generated">Lead Generated</option>
                  <option value="Initial Contact">Initial Contact</option>
                  <option value="Application Started">Application Started</option>
                  <option value="Application Submitted">Application Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Closed">Closed</option>
                  <option value="GHL Import">GHL Import</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Client
            </button>
          </div>
        </div>

        {/* Beautiful Client Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.length === 0 && (
            <div className="col-span-full text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No clients found</h3>
              <p className="text-gray-500">Get started by adding your first client</p>
            </div>
          )}

          {filteredClients.map((client) => {
            const age = getYoungestAge(client)
            const homeValue = client.home_value || 0
            const mortgageBalance = client.mortgage_balance || 0
            const upb = calculateUPB(homeValue, age, client.program_type || 'HECM')
            const netProceeds = Math.max(0, upb - mortgageBalance)

            return (
              <div key={client.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                <div className="p-6">
                  {/* Client Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Age: {age} {client.spouse_name && `• Spouse: ${client.spouse_name}`}
                        {client.spouse_is_nbs && <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">NBS</span>}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      client.pipeline_status === 'Closed' ? 'bg-green-100 text-green-800' :
                      client.pipeline_status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                      client.pipeline_status === 'Application Submitted' ? 'bg-blue-100 text-blue-800' :
                      client.pipeline_status === 'GHL Import' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {client.pipeline_status}
                    </span>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 mb-4">
                    {client.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-blue-500 mr-2" />
                        {client.phone}
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-green-500 mr-2" />
                        {client.email}
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <HomeIcon className="w-4 h-4 text-indigo-500 mr-2" />
                        {client.address}, {client.city}, {client.state}
                      </div>
                    )}
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Home Value</span>
                        <span className="font-semibold text-gray-900">${homeValue.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {upb > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-blue-700">Max Loan ({client.program_type || 'HECM'})</span>
                          <span className="font-semibold text-blue-900">${upb.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-blue-600">
                          PLF: {((upb / Math.min(homeValue, 1149825)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {netProceeds > 0 && (
                      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-purple-700">Est. Net Proceeds</span>
                          <span className="font-bold text-purple-900">${netProceeds.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setViewingClient(client)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    {homeValue >= 450000 && (
                      <button
                        onClick={() => setShowProgramComparison(client)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all duration-200"
                      >
                        <Calculator className="w-4 h-4 mr-1" />
                        Compare
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedClient(client)
                        setShowEditModal(true)
                      }}
                      className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg text-sm font-semibold transition-all duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(client.id)}
                      className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* GHL Webhook Endpoint for automatic lead import */}
        {/* This endpoint receives leads from GHL when disposition = "Next Step CRM" */}

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">Add New Client</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      required
                      value={newClient.first_name}
                      onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={newClient.last_name}
                      onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={newClient.date_of_birth}
                      onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                    <input
                      type="number"
                      value={newClient.home_value}
                      onChange={(e) => setNewClient({...newClient, home_value: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddClient}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl transition-all duration-200"
                  >
                    Add Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {showEditModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Edit Client: {selectedClient.first_name} {selectedClient.last_name}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={selectedClient.first_name || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, first_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={selectedClient.last_name || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, last_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={selectedClient.email || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={selectedClient.phone || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={selectedClient.date_of_birth || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, date_of_birth: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                    <input
                      type="number"
                      value={selectedClient.home_value || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, home_value: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                    <select
                      value={selectedClient.pipeline_status || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, pipeline_status: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Lead Generated">Lead Generated</option>
                      <option value="Initial Contact">Initial Contact</option>
                      <option value="Application Started">Application Started</option>
                      <option value="Application Submitted">Application Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Closed">Closed</option>
                      <option value="GHL Import">GHL Import</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedClient(null)
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Client Modal */}
        {viewingClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {viewingClient.first_name} {viewingClient.last_name}
                  </h3>
                  <button
                    onClick={() => setViewingClient(null)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium text-gray-600">First Name:</span> <span className="text-gray-800">{viewingClient.first_name}</span></div>
                      <div><span className="font-medium text-gray-600">Last Name:</span> <span className="text-gray-800">{viewingClient.last_name}</span></div>
                      <div><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800">{viewingClient.email || 'Not provided'}</span></div>
                      <div><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800">{viewingClient.phone || 'Not provided'}</span></div>
                      <div><span className="font-medium text-gray-600">Age:</span> <span className="text-gray-800">{calculateAge(viewingClient.date_of_birth) || 'Unknown'}</span></div>
                      <div><span className="font-medium text-gray-600">Pipeline Status:</span> <span className="text-gray-800">{viewingClient.pipeline_status}</span></div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">Financial Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium text-gray-600">Home Value:</span> <span className="text-gray-800">${(viewingClient.home_value || 0).toLocaleString()}</span></div>
                      <div><span className="font-medium text-gray-600">Program Type:</span> <span className="text-gray-800">{viewingClient.program_type || 'Not selected'}</span></div>
                      <div><span className="font-medium text-gray-600">Max Loan Amount:</span> <span className="text-gray-800">${calculateUPB(viewingClient.home_value, getYoungestAge(viewingClient), viewingClient.program_type).toLocaleString()}</span></div>
                      <div><span className="font-medium text-gray-600">Est. Net Proceeds:</span> <span className="text-gray-800">${Math.max(0, calculateUPB(viewingClient.home_value, getYoungestAge(viewingClient), viewingClient.program_type) - (viewingClient.mortgage_balance || 0)).toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this client? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteClient(showDeleteConfirm)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
