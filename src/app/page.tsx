'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3, LogOut } from 'lucide-react'

// Updated API key (the ONLY change needed for authentication)
const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'
const supabase = createClient(supabaseUrl, supabaseKey)

// HECM PLF lookup table (R3/PLF3 values for 6.375% rate)
const hecmPLFTable = {
  62: 0.364, 63: 0.371, 64: 0.378, 65: 0.385, 66: 0.392, 67: 0.399, 68: 0.406, 69: 0.413, 70: 0.420, 71: 0.427, 72: 0.399, // Using your correct 39.9% for age 72
  73: 0.441, 74: 0.448, 75: 0.455, 76: 0.462, 77: 0.469, 78: 0.476, 79: 0.483, 80: 0.490, 81: 0.497, 82: 0.504,
  83: 0.511, 84: 0.518, 85: 0.525, 86: 0.532, 87: 0.539, 88: 0.546, 89: 0.553, 90: 0.560, 91: 0.567, 92: 0.574,
  93: 0.581, 94: 0.588, 95: 0.595
}

// Equity Plus PLF lookup table  
const equityPlusPLFTable = {
  62: 0.398, 63: 0.405, 64: 0.412, 65: 0.419, 66: 0.426, 67: 0.433, 68: 0.440, 69: 0.447, 70: 0.454, 71: 0.461, 72: 0.426,
  73: 0.475, 74: 0.482, 75: 0.489, 76: 0.496, 77: 0.503, 78: 0.510, 79: 0.517, 80: 0.524, 81: 0.531, 82: 0.538,
  83: 0.545, 84: 0.552, 85: 0.559, 86: 0.566, 87: 0.573, 88: 0.580, 89: 0.587, 90: 0.594, 91: 0.601, 92: 0.608,
  93: 0.615, 94: 0.622, 95: 0.629
}

// Peak PLF lookup table
const peakPLFTable = {
  62: 0.432, 63: 0.439, 64: 0.446, 65: 0.453, 66: 0.460, 67: 0.467, 68: 0.474, 69: 0.481, 70: 0.488, 71: 0.495, 72: 0.477,
  73: 0.509, 74: 0.516, 75: 0.523, 76: 0.530, 77: 0.537, 78: 0.544, 79: 0.551, 80: 0.558, 81: 0.565, 82: 0.572,
  83: 0.579, 84: 0.586, 85: 0.593, 86: 0.600, 87: 0.607, 88: 0.614, 89: 0.621, 90: 0.628, 91: 0.635, 92: 0.642,
  93: 0.649, 94: 0.656, 95: 0.663
}

// LOC PLF lookup table (same as Equity Plus)
const locPLFTable = {
  62: 0.398, 63: 0.405, 64: 0.412, 65: 0.419, 66: 0.426, 67: 0.433, 68: 0.440, 69: 0.447, 70: 0.454, 71: 0.461, 72: 0.426,
  73: 0.475, 74: 0.482, 75: 0.489, 76: 0.496, 77: 0.503, 78: 0.510, 79: 0.517, 80: 0.524, 81: 0.531, 82: 0.538,
  83: 0.545, 84: 0.552, 85: 0.559, 86: 0.566, 87: 0.573, 88: 0.580, 89: 0.587, 90: 0.594, 91: 0.601, 92: 0.608,
  93: 0.615, 94: 0.622, 95: 0.629
}

export default function NextStepCRM() {
  // Authentication state
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // CRM state
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    spouse_first_name: '',
    spouse_last_name: '',
    spouse_date_of_birth: '',
    property_value: '',
    current_mortgage_balance: '',
    desired_loan_amount: '',
    program_type: 'HECM',
    pipeline_status: 'Initial Contact',
    notes: ''
  })

  const pipelineColors = {
    'Initial Contact': 'bg-red-100 text-red-800',
    'Documents Requested': 'bg-orange-100 text-orange-800', 
    'Application Submitted': 'bg-yellow-100 text-yellow-800',
    'Initial Review': 'bg-blue-100 text-blue-800',
    'Appraisal Ordered': 'bg-indigo-100 text-indigo-800',
    'Appraisal Complete': 'bg-purple-100 text-purple-800',
    'Underwriting': 'bg-pink-100 text-pink-800',
    'Approval': 'bg-green-100 text-green-800',
    'Closing Scheduled': 'bg-teal-100 text-teal-800',
    'Closing Complete': 'bg-emerald-100 text-emerald-800',
    'Funded': 'bg-lime-100 text-lime-800',
    'Declined': 'bg-gray-100 text-gray-800'
  }

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          loadClients()
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Check initial auth status
  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await loadClients()
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      })

      if (error) {
        alert(`Login failed: ${error.message}`)
        return
      }

      // Success - user will be set by onAuthStateChange
    } catch (err) {
      console.error('Login error:', err)
      alert('Login failed. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Logout function
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setClients([])
    } catch (error) {
      console.error('Logout error:', error)
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

  // Get youngest age between client and spouse for PLF calculation
  const getYoungestAge = (client) => {
    const clientAge = calculateAge(client.date_of_birth)
    const spouseAge = client.spouse_date_of_birth ? calculateAge(client.spouse_date_of_birth) : null
    
    if (clientAge && spouseAge) {
      return Math.min(clientAge, spouseAge)
    }
    return clientAge || spouseAge || 72 // Default to 72 if no age available
  }

  // Calculate PLF based on program and age
  const calculatePLF = (programType, age) => {
    age = Math.max(62, Math.min(95, age)) // Ensure age is within valid range
    
    switch (programType) {
      case 'HECM':
        return hecmPLFTable[age] || 0.5
      case 'Equity Plus':
        return equityPlusPLFTable[age] || 0.55
      case 'Peak':
        return peakPLFTable[age] || 0.6
      case 'LOC':
        return locPLFTable[age] || 0.55
      default:
        return hecmPLFTable[age] || 0.5
    }
  }

  // Calculate net proceeds
  const calculateNetProceeds = (client) => {
    const propertyValue = parseFloat(client.property_value) || 0
    const mortgageBalance = parseFloat(client.current_mortgage_balance) || 0
    const youngestAge = getYoungestAge(client)
    const plf = calculatePLF(client.program_type, youngestAge)
    
    const principalLimit = propertyValue * plf
    const netProceeds = principalLimit - mortgageBalance
    
    return Math.max(0, netProceeds)
  }

  // Load clients from Supabase
  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading clients:', error)
        return
      }

      setClients(data || [])
    } catch (err) {
      console.error('Error:', err)
    }
  }

  // Add new client to Supabase
  const addClient = async () => {
    if (!newClient.first_name || !newClient.last_name) {
      alert('Please fill in required fields (First Name, Last Name)')
      return
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()

      if (error) {
        console.error('Error adding client:', error)
        alert('Error adding client. Please try again.')
        return
      }

      setClients([data[0], ...clients])
      setNewClient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        address: '',
        spouse_first_name: '',
        spouse_last_name: '',
        spouse_date_of_birth: '',
        property_value: '',
        current_mortgage_balance: '',
        desired_loan_amount: '',
        program_type: 'HECM',
        pipeline_status: 'Initial Contact',
        notes: ''
      })
      setShowAddModal(false)
    } catch (err) {
      console.error('Error:', err)
      alert('Error adding client. Please try again.')
    }
  }

  // Update client in Supabase
  const updateClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(selectedClient)
        .eq('id', selectedClient.id)
        .select()

      if (error) {
        console.error('Error updating client:', error)
        alert('Error updating client. Please try again.')
        return
      }

      setClients(clients.map(client => 
        client.id === selectedClient.id ? data[0] : client
      ))
      setShowEditModal(false)
      setSelectedClient(null)
    } catch (err) {
      console.error('Error:', err)
      alert('Error updating client. Please try again.')
    }
  }

  // Delete client from Supabase
  const deleteClient = async (clientId) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) {
        console.error('Error deleting client:', error)
        alert('Error deleting client. Please try again.')
        return
      }

      setClients(clients.filter(client => client.id !== clientId))
      setShowDeleteModal(false)
      setSelectedClient(null)
    } catch (err) {
      console.error('Error:', err)
      alert('Error deleting client. Please try again.')
    }
  }

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  )

  // Calculate total pipeline value
  const totalPipelineValue = filteredClients.reduce((sum, client) => {
    return sum + calculateNetProceeds(client)
  }, 0)

  // Determine which programs to show in comparison
  const getAvailablePrograms = (client) => {
    const propertyValue = parseFloat(client.property_value) || 0
    
    // Only show non-HECM programs if property value is $450K or higher
    if (propertyValue >= 450000) {
      return ['HECM', 'Equity Plus', 'Peak', 'LOC']
    } else {
      return ['HECM']  // Only HECM for properties under $450K
    }
  }

  // Show loading spinner during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="relative w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Next Step CRM</h1>
              <p className="text-gray-600">Reverse Mortgage Client Management</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {authLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Secure access to client data</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main CRM Interface (shown after successful authentication)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with User Info and Logout */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Next Step CRM</h1>
            <p className="text-gray-600">Reverse Mortgage Client Management System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{filteredClients.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">${totalPipelineValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredClients.filter(client => 
                    !['Funded', 'Declined'].includes(client.pipeline_status)
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <Calculator className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Loan Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${filteredClients.length > 0 ? Math.round(totalPipelineValue / filteredClients.length).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add Client */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Client
          </button>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const youngestAge = getYoungestAge(client)
            const netProceeds = calculateNetProceeds(client)
            const plf = calculatePLF(client.program_type, youngestAge)

            return (
              <div key={client.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {client.first_name} {client.last_name}
                    </h3>
                    {client.spouse_first_name && (
                      <p className="text-gray-600 text-sm mb-1">
                        Spouse: {client.spouse_first_name} {client.spouse_last_name}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${pipelineColors[client.pipeline_status] || 'bg-gray-100 text-gray-800'}`}>
                    {client.pipeline_status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {client.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center">
                      <HomeIcon className="w-4 h-4 mr-2" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Property Value</p>
                      <p className="font-semibold">${parseFloat(client.property_value || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Program Type</p>
                      <p className="font-semibold">{client.program_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Age/PLF</p>
                      <p className="font-semibold">{youngestAge} / {(plf * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Net Proceeds</p>
                      <p className="font-semibold text-green-600">${netProceeds.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedClient(client)
                      setShowViewModal(true)
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClient(client)
                      setShowCompareModal(true)
                    }}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <Calculator className="w-4 h-4 mr-1" />
                    Compare
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClient({...client})
                      setShowEditModal(true)
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClient(client)
                      setShowDeleteModal(true)
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                  {client.address && (
                    <a
                      href={`https://www.zillow.com/homes/${encodeURIComponent(client.address)}_rb/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center text-sm"
                      title="View on Zillow"
                    >
                      🏠
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first client'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Client
              </button>
            )}
          </div>
        )}

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Client</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={newClient.first_name}
                      onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={newClient.last_name}
                      onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={newClient.date_of_birth}
                      onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={newClient.address}
                      onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter property address"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Spouse Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse First Name</label>
                      <input
                        type="text"
                        value={newClient.spouse_first_name}
                        onChange={(e) => setNewClient({...newClient, spouse_first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter spouse first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Last Name</label>
                      <input
                        type="text"
                        value={newClient.spouse_last_name}
                        onChange={(e) => setNewClient({...newClient, spouse_last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter spouse last name"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                    <input
                      type="date"
                      value={newClient.spouse_date_of_birth}
                      onChange={(e) => setNewClient({...newClient, spouse_date_of_birth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Value</label>
                      <input
                        type="number"
                        value={newClient.property_value}
                        onChange={(e) => setNewClient({...newClient, property_value: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter property value"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                      <input
                        type="number"
                        value={newClient.current_mortgage_balance}
                        onChange={(e) => setNewClient({...newClient, current_mortgage_balance: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current mortgage balance"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desired Loan Amount</label>
                    <input
                      type="number"
                      value={newClient.desired_loan_amount}
                      onChange={(e) => setNewClient({...newClient, desired_loan_amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter desired loan amount"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Loan Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                      <select
                        value={newClient.program_type}
                        onChange={(e) => setNewClient({...newClient, program_type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="HECM">HECM</option>
                        <option value="Equity Plus">Equity Plus</option>
                        <option value="Peak">Peak</option>
                        <option value="LOC">LOC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                      <select
                        value={newClient.pipeline_status}
                        onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Initial Contact">Initial Contact</option>
                        <option value="Documents Requested">Documents Requested</option>
                        <option value="Application Submitted">Application Submitted</option>
                        <option value="Initial Review">Initial Review</option>
                        <option value="Appraisal Ordered">Appraisal Ordered</option>
                        <option value="Appraisal Complete">Appraisal Complete</option>
                        <option value="Underwriting">Underwriting</option>
                        <option value="Approval">Approval</option>
                        <option value="Closing Scheduled">Closing Scheduled</option>
                        <option value="Closing Complete">Closing Complete</option>
                        <option value="Funded">Funded</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={newClient.notes}
                      onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Enter any additional notes"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addClient}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {showEditModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Client</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={selectedClient.first_name || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={selectedClient.last_name || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={selectedClient.email || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={selectedClient.phone || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={selectedClient.date_of_birth || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, date_of_birth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={selectedClient.address || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter property address"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Spouse Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse First Name</label>
                      <input
                        type="text"
                        value={selectedClient.spouse_first_name || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, spouse_first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter spouse first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Last Name</label>
                      <input
                        type="text"
                        value={selectedClient.spouse_last_name || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, spouse_last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter spouse last name"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                    <input
                      type="date"
                      value={selectedClient.spouse_date_of_birth || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, spouse_date_of_birth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Value</label>
                      <input
                        type="number"
                        value={selectedClient.property_value || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, property_value: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter property value"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                      <input
                        type="number"
                        value={selectedClient.current_mortgage_balance || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, current_mortgage_balance: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current mortgage balance"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desired Loan Amount</label>
                    <input
                      type="number"
                      value={selectedClient.desired_loan_amount || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, desired_loan_amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter desired loan amount"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Loan Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                      <select
                        value={selectedClient.program_type || 'HECM'}
                        onChange={(e) => setSelectedClient({...selectedClient, program_type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="HECM">HECM</option>
                        <option value="Equity Plus">Equity Plus</option>
                        <option value="Peak">Peak</option>
                        <option value="LOC">LOC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                      <select
                        value={selectedClient.pipeline_status || 'Initial Contact'}
                        onChange={(e) => setSelectedClient({...selectedClient, pipeline_status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Initial Contact">Initial Contact</option>
                        <option value="Documents Requested">Documents Requested</option>
                        <option value="Application Submitted">Application Submitted</option>
                        <option value="Initial Review">Initial Review</option>
                        <option value="Appraisal Ordered">Appraisal Ordered</option>
                        <option value="Appraisal Complete">Appraisal Complete</option>
                        <option value="Underwriting">Underwriting</option>
                        <option value="Approval">Approval</option>
                        <option value="Closing Scheduled">Closing Scheduled</option>
                        <option value="Closing Complete">Closing Complete</option>
                        <option value="Funded">Funded</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={selectedClient.notes || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Enter any additional notes"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateClient}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
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
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Client Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium text-gray-600">First Name:</span> <span className="text-gray-800">{selectedClient.first_name}</span></div>
                    <div><span className="font-medium text-gray-600">Last Name:</span> <span className="text-gray-800">{selectedClient.last_name}</span></div>
                    <div><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800">{selectedClient.email || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800">{selectedClient.phone || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-600">Date of Birth:</span> <span className="text-gray-800">{selectedClient.date_of_birth || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-600">Age:</span> <span className="text-gray-800">{calculateAge(selectedClient.date_of_birth) || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Spouse Information */}
                {(selectedClient.spouse_first_name || selectedClient.spouse_last_name) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">Spouse Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium text-gray-600">Spouse First Name:</span> <span className="text-gray-800">{selectedClient.spouse_first_name || 'N/A'}</span></div>
                      <div><span className="font-medium text-gray-600">Spouse Last Name:</span> <span className="text-gray-800">{selectedClient.spouse_last_name || 'N/A'}</span></div>
                      <div><span className="font-medium text-gray-600">Spouse DOB:</span> <span className="text-gray-800">{selectedClient.spouse_date_of_birth || 'N/A'}</span></div>
                      <div><span className="font-medium text-gray-600">Spouse Age:</span> <span className="text-gray-800">{calculateAge(selectedClient.spouse_date_of_birth) || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Property Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">Property Information</h3>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div><span className="font-medium text-gray-600">Address:</span> <span className="text-gray-800">{selectedClient.address || 'N/A'}</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><span className="font-medium text-gray-600">Property Value:</span> <span className="text-gray-800">${parseFloat(selectedClient.property_value || 0).toLocaleString()}</span></div>
                      <div><span className="font-medium text-gray-600">Current Mortgage:</span> <span className="text-gray-800">${parseFloat(selectedClient.current_mortgage_balance || 0).toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>

                {/* Loan Information */}
                <div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium text-gray-600">Program Type:</span> <span className="text-gray-800">{selectedClient.program_type}</span></div>
                    <div><span className="font-medium text-gray-600">Pipeline Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${pipelineColors[selectedClient.pipeline_status] || 'bg-gray-100 text-gray-800'}`}>
                        {selectedClient.pipeline_status}
                      </span>
                    </div>
                    <div><span className="font-medium text-gray-600">Desired Loan Amount:</span> <span className="text-gray-800">${parseFloat(selectedClient.desired_loan_amount || 0).toLocaleString()}</span></div>
                    <div><span className="font-medium text-gray-600">Youngest Age:</span> <span className="text-gray-800">{getYoungestAge(selectedClient)}</span></div>
                    <div><span className="font-medium text-gray-600">PLF:</span> <span className="text-gray-800">{(calculatePLF(selectedClient.program_type, getYoungestAge(selectedClient)) * 100).toFixed(1)}%</span></div>
                    <div><span className="font-medium text-gray-600">Net Proceeds:</span> <span className="text-green-600 font-semibold">${calculateNetProceeds(selectedClient).toLocaleString()}</span></div>
                  </div>
                </div>

                {/* Notes */}
                {selectedClient.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedClient.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setShowEditModal(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Program Comparison Modal */}
        {showCompareModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Program Comparison - {selectedClient.first_name} {selectedClient.last_name}</h2>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getAvailablePrograms(selectedClient).map((program) => {
                  const youngestAge = getYoungestAge(selectedClient)
                  const plf = calculatePLF(program, youngestAge)
                  const propertyValue = parseFloat(selectedClient.property_value) || 0
                  const mortgageBalance = parseFloat(selectedClient.current_mortgage_balance) || 0
                  const principalLimit = propertyValue * plf
                  const netProceeds = Math.max(0, principalLimit - mortgageBalance)

                  // Determine if this is the best option
                  const allPrograms = getAvailablePrograms(selectedClient)
                  const bestProgram = allPrograms.reduce((best, current) => {
                    const bestNetProceeds = Math.max(0, (propertyValue * calculatePLF(best, youngestAge)) - mortgageBalance)
                    const currentNetProceeds = Math.max(0, (propertyValue * calculatePLF(current, youngestAge)) - mortgageBalance)
                    return currentNetProceeds > bestNetProceeds ? current : best
                  })
                  const isBest = program === bestProgram

                  return (
                    <div key={program} className={`bg-white rounded-lg border-2 p-4 ${isBest ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">{program}</h3>
                        {isBest && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">BEST OPTION</span>}
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-600">Property Value</p>
                          <p className="font-semibold">${propertyValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">PLF Rate</p>
                          <p className="font-semibold">{(plf * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Principal Limit</p>
                          <p className="font-semibold">${principalLimit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Mortgage Balance</p>
                          <p className="font-semibold">-${mortgageBalance.toLocaleString()}</p>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-gray-600">Net Proceeds</p>
                          <p className={`text-xl font-bold ${isBest ? 'text-green-600' : 'text-blue-600'}`}>
                            ${netProceeds.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Calculation Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Client Age:</strong> {calculateAge(selectedClient.date_of_birth) || 'N/A'}</p>
                  {selectedClient.spouse_date_of_birth && (
                    <p><strong>Spouse Age:</strong> {calculateAge(selectedClient.spouse_date_of_birth)}</p>
                  )}
                  <p><strong>Youngest Age (for PLF):</strong> {getYoungestAge(selectedClient)}</p>
                  <p><strong>Property Value:</strong> ${parseFloat(selectedClient.property_value || 0).toLocaleString()}</p>
                  <p><strong>Current Mortgage Balance:</strong> ${parseFloat(selectedClient.current_mortgage_balance || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedClient.first_name} {selectedClient.last_name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteClient(selectedClient.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
