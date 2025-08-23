// @ts-nocheck
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
  // Authentication state - using any to fix TypeScript
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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-green-400">
      {/* Header */}
      <div className="bg-white bg-opacity-90 backdrop-blur-lg shadow-lg border-b border-white border-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Next Step CRM</h1>
                <p className="text-sm text-gray-700">Reverse Mortgage Division</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg"
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
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white border-opacity-30">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white border-opacity-30">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Active Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.pipeline_status !== 'Closed').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white border-opacity-30">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.pipeline_status === 'Under Review').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white border-opacity-30">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Closed Loans</p>
                <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.pipeline_status === 'Closed').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-xl p-6 mb-8 border border-white border-opacity-30">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white bg-opacity-80"
                />
              </div>
              
              <div className="relative">
                <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white bg-opacity-80"
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
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
              <div key={client.id} className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-40 overflow-hidden hover:shadow-3xl hover:bg-opacity-100 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                <div className="p-6">
                  {/* Client Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-gray-700 text-sm font-medium">
                        Age: {age} {client.spouse_name && `• Spouse: ${client.spouse_name}`}
                        {client.spouse_is_nbs && <span className="ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full shadow-md">NBS</span>}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                      client.pipeline_status === 'Closed' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                      client.pipeline_status === 'Under Review' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                      client.pipeline_status === 'Application Submitted' ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white' :
                      client.pipeline_status === 'GHL Import' ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white' :
                      'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    }`}>
                      {client.pipeline_status}
                    </span>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 mb-4">
                    {client.phone && (
                      <div className="flex items-center text-sm text-gray-700">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mr-2">
                          <Phone className="w-3 h-3 text-white" />
                        </div>
                        {client.phone}
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center text-sm text-gray-700">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mr-2">
                          <Mail className="w-3 h-3 text-white" />
                        </div>
                        {client.email}
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center text-sm text-gray-700">
                        <div className="w-6 h-6 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center mr-2">
                          <HomeIcon className="w-3 h-3 text-white" />
                        </div>
                        {client.address}, {client.city}, {client.state}
                      </div>
                    )}
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-gray-100 via-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">Home Value</span>
                        <span className="font-bold text-xl text-gray-900">${homeValue.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {upb > 0 && (
                      <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-300 shadow-inner">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-blue-800">Max Loan ({client.program_type || 'HECM'})</span>
                          <span className="font-bold text-xl text-blue-900">${upb.toLocaleString()}</span>
                        </div>
                        <div className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded-full inline-block">
                          PLF: {((upb / Math.min(homeValue, 1149825)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {netProceeds > 0 && (
                      <div className="bg-gradient-to-r from-emerald-100 via-green-50 to-teal-100 rounded-xl p-4 border border-green-300 shadow-inner">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-green-800">Est. Net Proceeds</span>
                          <span className="font-bold text-2xl text-green-900">${netProceeds.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => setViewingClient(client)}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    {homeValue >= 450000 && (
                      <button
                        onClick={() => setShowProgramComparison(client)}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                      className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(client.id)}
                      className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
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
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={selectedClient.address || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, address: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={selectedClient.city || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, city: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={selectedClient.state || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, state: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={selectedClient.zip_code || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, zip_code: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mortgage Balance</label>
                      <input
                        type="number"
                        value={selectedClient.mortgage_balance || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, mortgage_balance: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                      <select
                        value={selectedClient.program_type || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, program_type: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Program</option>
                        <option value="HECM">HECM</option>
                        <option value="HMN">Home Mortgage Navigator</option>
                        <option value="HOMESAFE">HomeSafe</option>
                        <option value="GoodLife">GoodLife</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Spouse Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Name</label>
                      <input
                        type="text"
                        value={selectedClient.spouse_name || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, spouse_name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                      <input
                        type="date"
                        value={selectedClient.spouse_dob || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, spouse_dob: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        checked={selectedClient.spouse_is_nbs || false}
                        onChange={(e) => setSelectedClient({...selectedClient, spouse_is_nbs: e.target.checked})}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Non-Borrowing Spouse (NBS)</label>
                    </div>
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

        {/* Program Comparison Modal */}
        {showProgramComparison && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Program Comparison - {showProgramComparison.first_name} {showProgramComparison.last_name}
                  </h3>
                  <button
                    onClick={() => setShowProgramComparison(null)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['HECM', 'HMN', 'HOMESAFE', 'GoodLife'].map((program) => {
                    const homeValue = showProgramComparison.home_value || 0
                    const mortgageBalance = showProgramComparison.mortgage_balance || 0
                    const age = getYoungestAge(showProgramComparison)
                    const upb = calculateUPB(homeValue, age, program)
                    const netProceeds = Math.max(0, upb - mortgageBalance)
                    
                    // Determine if this is the best option
                    const allPrograms = ['HECM', 'HMN', 'HOMESAFE', 'GoodLife']
                    const bestProgram = allPrograms.reduce((best, current) => {
                      const currentProceeds = Math.max(0, calculateUPB(homeValue, age, current) - mortgageBalance)
                      const bestProceeds = Math.max(0, calculateUPB(homeValue, age, best) - mortgageBalance)
                      return currentProceeds > bestProceeds ? current : best
                    }, 'HECM')
                    
                    const isBest = program === bestProgram
                    
                    return (
                      <div key={program} className={`rounded-xl p-4 border-2 ${isBest ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-gray-200 bg-white'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-lg text-gray-900">{program}</h4>
                          {isBest && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">BEST</span>}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Max Loan:</span>
                            <span className="font-semibold">${upb.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">PLF Rate:</span>
                            <span className="font-semibold">{((upb / Math.min(homeValue, 1149825)) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Net Proceeds:</span>
                            <span className="font-bold text-green-600">${netProceeds.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Calculation Details</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Client Age:</strong> {getYoungestAge(showProgramComparison)} (youngest borrower)</p>
                    <p><strong>Property Value:</strong> ${(showProgramComparison.home_value || 0).toLocaleString()}</p>
                    <p><strong>Current Mortgage:</strong> ${(showProgramComparison.mortgage_balance || 0).toLocaleString()}</p>
                    <p><strong>FHA Lending Limit:</strong> $1,149,825</p>
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
