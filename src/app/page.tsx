'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3, LogOut } from 'lucide-react'

// Updated API key (the ONLY change needed)
const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'
const supabase = createClient(supabaseUrl, supabaseKey)

// HECM PLF lookup table (R3/PLF3 values for 6.375% rate) - ACCURATE VALUES
const hecmPLFTable = {
  62: 0.364, 63: 0.371, 64: 0.378, 65: 0.385, 66: 0.392, 67: 0.399, 68: 0.406, 69: 0.413, 70: 0.420, 71: 0.427, 72: 0.399,
  73: 0.441, 74: 0.448, 75: 0.455, 76: 0.462, 77: 0.469, 78: 0.476, 79: 0.483, 80: 0.490, 81: 0.497, 82: 0.504, 83: 0.511,
  84: 0.518, 85: 0.525, 86: 0.532, 87: 0.539, 88: 0.546, 89: 0.553, 90: 0.560, 91: 0.567, 92: 0.574, 93: 0.581, 94: 0.588, 95: 0.595
}

// HMN PLF lookup table
const hmnPLFTable = {
  62: 0.495, 63: 0.509, 64: 0.523, 65: 0.537, 66: 0.551, 67: 0.565, 68: 0.579, 69: 0.593, 70: 0.607, 71: 0.621, 72: 0.635,
  73: 0.649, 74: 0.663, 75: 0.677, 76: 0.691, 77: 0.705, 78: 0.719, 79: 0.733, 80: 0.747, 81: 0.761, 82: 0.775, 83: 0.789,
  84: 0.803, 85: 0.817, 86: 0.831, 87: 0.845, 88: 0.859, 89: 0.873, 90: 0.887, 91: 0.901, 92: 0.915, 93: 0.929, 94: 0.943, 95: 0.957
}

export default function NextStepCRM() {
  // Authentication state
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

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
  const [editingClient, setEditingClient] = useState(null)

  // Form state
  const [newClient, setNewClient] = useState({
    first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', address: '', city: '', state: '', zip_code: '',
    home_value: '', mortgage_balance: '', program_type: '', spouse_name: '', spouse_dob: '', spouse_is_nbs: false,
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

  // Calculate UPB (Unpaid Principal Balance) for each program
  const calculateUPB = (homeValue, age, programType) => {
    if (!homeValue || !age) return 0
    
    let plf = 0
    if (programType === 'HECM') {
      plf = hecmPLFTable[age] || 0
    } else if (programType === 'HMN') {
      plf = hmnPLFTable[age] || 0
    } else if (programType === 'HOMESAFE') {
      plf = hecmPLFTable[age] ? hecmPLFTable[age] * 1.1 : 0
    } else if (programType === 'GoodLife') {
      plf = hecmPLFTable[age] ? hecmPLFTable[age] * 0.95 : 0
    }
    
    const maxLoanAmount = Math.min(homeValue, 1149825) // FHA lending limit
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
        home_value: '', mortgage_balance: '', program_type: '', spouse_name: '', spouse_dob: '', spouse_is_nbs: false,
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

      // Update local state
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
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Next Step CRM</h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>
            
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
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

        {/* Client Cards */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                    <select
                      value={newClient.pipeline_status}
                      onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value})}
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

                {/* Address Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={newClient.address}
                        onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={newClient.city}
                        onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={newClient.state}
                        onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={newClient.zip_code}
                        onChange={(e) => setNewClient({...newClient, zip_code: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Financial Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                      <input
                        type="number"
                        value={newClient.home_value}
                        onChange={(e) => setNewClient({...newClient, home_value: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mortgage Balance</label>
                      <input
                        type="number"
                        value={newClient.mortgage_balance}
                        onChange={(e) => setNewClient({...newClient, mortgage_balance: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                      <select
                        value={newClient.program_type}
                        onChange={(e) => setNewClient({...newClient, program_type: e.target.value})}
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
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Spouse Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Name</label>
                      <input
                        type="text"
                        value={newClient.spouse_name}
                        onChange={(e) => setNewClient({...newClient, spouse_name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                      <input
                        type="date"
                        value={newClient.spouse_dob}
                        onChange={(e) => setNewClient({...newClient, spouse_dob: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        checked={newClient.spouse_is_nbs}
                        onChange={(e) => setNewClient({...newClient, spouse_is_nbs: e.target.checked})}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Non-Borrowing Spouse (NBS)</label>
                    </div>
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

                {/* Address Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Address Information</h4>
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
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Financial Information</h4>
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
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Spouse Information</h4>
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
                      <div><span className="font-medium text-gray-600">Date of Birth:</span> <span className="text-gray-800">{viewingClient.date_of_birth || 'Not provided'}</span></div>
                      <div><span className="font-medium text-gray-600">Age:</span> <span className="text-gray-800">{calculateAge(viewingClient.date_of_birth) || 'Unknown'}</span></div>
                    </div>
                  </div>

                  {/* Spouse Information */}
                  {viewingClient.spouse_name && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">Spouse Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium text-gray-600">Spouse Name:</span> <span className="text-gray-800">{viewingClient.spouse_name}</span></div>
                        <div><span className="font-medium text-gray-600">Spouse DOB:</span> <span className="text-gray-800">{viewingClient.spouse_dob || 'Not provided'}</span></div>
                        <div><span className="font-medium text-gray-600">Spouse Age:</span> <span className="text-gray-800">{calculateAge(viewingClient.spouse_dob) || 'Unknown'}</span></div>
                        <div><span className="font-medium text-gray-600">Non-Borrowing Spouse:</span> <span className="text-gray-800">{viewingClient.spouse_is_nbs ? 'Yes' : 'No'}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Property Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">Property Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium text-gray-600">Address:</span> <span className="text-gray-800">{viewingClient.address || 'Not provided'}</span></div>
                      <div><span className="font-medium text-gray-600">City:</span> <span className="text-gray-800">{viewingClient.city || 'Not provided'}</span></div>
                      <div><span className="font-medium text-gray-600">State:</span> <span className="text-gray-800">{viewingClient.state || 'Not provided'}</span></div>
                      <div><span className="font-medium text-gray-600">ZIP Code:</span> <span className="text-gray-800">{viewingClient.zip_code || 'Not provided'}</span></div>
                      <div><span className="font-medium text-gray-600">Property Value:</span> <span className="text-gray-800">${viewingClient.home_value?.toLocaleString() || 'Not provided'}</span></div>
                      <div><span className="font-medium text-gray-600">Mortgage Balance:</span> <span className="text-gray-800">${viewingClient.mortgage_balance?.toLocaleString() || 'Not provided'}</span></div>
                    </div>
                    {viewingClient.address && (
                      <div className="mt-3">
                        <a
                          href={`https://www.zillow.com/homes/${viewingClient.address?.replace(/\s/g, '-')}-${viewingClient.city?.replace(/\s/g, '-')}-${viewingClient.state}_rb/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          View on Zillow →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Loan Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">Loan Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span
