'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js''use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3, EyeOff, Lock, LogOut } from 'lucide-react'

// Initialize Supabase
const supabase = createClient(
  'https://qyrbkwcmsnrtomndsojb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cmJrd2Ntc25ydG9tbmRzb2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU4OTcyNjUsImV4cCI6MjA0MTQ3MzI2NX0.OZVkWEuUy3KJPyGOdHTL1gI2sB8hFv--EIQ8bbElJTI'
)

// Login Component
function LoginPage({ onLogin }: { onLogin: (userData: any) => void }) {
  const [email, setEmail] = useState('jeremiah.sherer@city1st.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simple authentication check
    if (email === 'jeremiah.sherer@city1st.com' && password.length > 0) {
      onLogin({ email, name: 'Jeremiah Sherer' })
    } else {
      alert('Invalid credentials. Please use jeremiah.sherer@city1st.com')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Next Step CRM
            </h1>
            <p className="text-gray-600 mt-2">Reverse Mortgage Division</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NextStepCRM() {
  const [user, setUser] = useState(null)
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    pipeline_status: 'Lead',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    home_value: '',
    current_mortgage_balance: '',
    has_non_borrowing_spouse: false
  })
  const [loading, setLoading] = useState(true)
  const [sessionTime, setSessionTime] = useState(600) // 10 minutes
  const [showWarning, setShowWarning] = useState(false)

  // Pipeline statuses with colors
  const pipelineStatuses = [
    { name: 'Lead', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { name: 'Qualified', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { name: 'Counseling Scheduled', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { name: 'Counseling Complete', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { name: 'Application Submitted', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { name: 'Processing', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { name: 'Underwriting', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { name: 'Approval', color: 'bg-green-100 text-green-800 border-green-200' },
    { name: 'Docs Out', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { name: 'Signed', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    { name: 'Funded', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { name: 'Closed', color: 'bg-green-200 text-green-900 border-green-300' }
  ]

  // PLF Table
  const plfTable = {
    62: { 'HECM': 39.9, 'Equity Plus': 45.0, 'Peak': 50.0, 'LOC': 35.0 },
    63: { 'HECM': 41.1, 'Equity Plus': 46.5, 'Peak': 51.5, 'LOC': 36.0 },
    64: { 'HECM': 42.3, 'Equity Plus': 48.0, 'Peak': 53.0, 'LOC': 37.0 },
    65: { 'HECM': 43.6, 'Equity Plus': 49.5, 'Peak': 54.5, 'LOC': 38.0 },
    66: { 'HECM': 44.9, 'Equity Plus': 51.0, 'Peak': 56.0, 'LOC': 39.0 },
    67: { 'HECM': 46.3, 'Equity Plus': 52.5, 'Peak': 57.5, 'LOC': 40.0 },
    68: { 'HECM': 47.7, 'Equity Plus': 54.0, 'Peak': 59.0, 'LOC': 41.0 },
    69: { 'HECM': 49.2, 'Equity Plus': 55.5, 'Peak': 60.5, 'LOC': 42.0 },
    70: { 'HECM': 50.7, 'Equity Plus': 57.0, 'Peak': 62.0, 'LOC': 43.0 },
    71: { 'HECM': 52.3, 'Equity Plus': 58.5, 'Peak': 63.5, 'LOC': 44.0 },
    72: { 'HECM': 53.9, 'Equity Plus': 60.0, 'Peak': 65.0, 'LOC': 45.0 },
    73: { 'HECM': 55.6, 'Equity Plus': 61.5, 'Peak': 66.5, 'LOC': 46.0 },
    74: { 'HECM': 57.4, 'Equity Plus': 63.0, 'Peak': 68.0, 'LOC': 47.0 },
    75: { 'HECM': 59.2, 'Equity Plus': 64.5, 'Peak': 69.5, 'LOC': 48.0 }
  }

  // Authentication and session management
  useEffect(() => {
    const savedUser = localStorage.getItem('nextStepUser')
    const loginTime = localStorage.getItem('nextStepLoginTime')
    
    if (savedUser && loginTime) {
      const elapsed = (Date.now() - parseInt(loginTime)) / 1000
      if (elapsed < 600) { // 10 minutes
        setUser(JSON.parse(savedUser))
        setSessionTime(600 - elapsed)
      } else {
        localStorage.removeItem('nextStepUser')
        localStorage.removeItem('nextStepLoginTime')
      }
    }
    setLoading(false)
  }, [])

  // Session timer
  useEffect(() => {
    if (!user) return

    const timer = setInterval(() => {
      setSessionTime(prev => {
        if (prev <= 120 && !showWarning) { // 2 minutes warning
          setShowWarning(true)
        }
        if (prev <= 0) {
          handleLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [user, showWarning])

  // Load clients
  useEffect(() => {
    if (user) {
      loadClients()
    }
  }, [user])

  // Filter clients
  useEffect(() => {
    let filtered = clients
    
    if (searchTerm) {
      filtered = filtered.filter(client =>
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
      )
    }
    
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(client => client.pipeline_status === selectedStatus)
    }
    
    setFilteredClients(filtered)
  }, [clients, searchTerm, selectedStatus])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('nextStepUser', JSON.stringify(userData))
    localStorage.setItem('nextStepLoginTime', Date.now().toString())
    setSessionTime(600)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('nextStepUser')
    localStorage.removeItem('nextStepLoginTime')
    setShowWarning(false)
  }

  const extendSession = () => {
    localStorage.setItem('nextStepLoginTime', Date.now().toString())
    setSessionTime(600)
    setShowWarning(false)
  }

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

  const getPLF = (program, age) => {
    if (!age || age < 62) return 0
    const ageKey = Math.min(Math.max(age, 62), 75)
    return plfTable[ageKey] ? plfTable[ageKey][program] || 0 : 0
  }

  const getAvailablePrograms = (homeValue, age) => {
    const programs = []
    if (homeValue >= 150000) programs.push('HECM')
    if (homeValue >= 300000) programs.push('Equity Plus')
    if (homeValue >= 450000) programs.push('Peak')
    if (homeValue >= 200000) programs.push('LOC')
    return programs
  }

  const calculateLoanDetails = (program, homeValue, currentMortgage, age) => {
    const plf = getPLF(program, age)
    const principalLimit = (homeValue * plf) / 100
    const netProceeds = Math.max(0, principalLimit - currentMortgage)
    
    return {
      principalLimit: principalLimit.toFixed(0),
      netProceeds: netProceeds.toFixed(0),
      plf: plf.toFixed(1)
    }
  }

  const addClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()

      if (error) throw error
      
      setClients([data[0], ...clients])
      setShowAddModal(false)
      setNewClient({
        first_name: '',
        last_name: '',
        phone: '',
        date_of_birth: '',
        pipeline_status: 'Lead',
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        home_value: '',
        current_mortgage_balance: '',
        has_non_borrowing_spouse: false
      })
    } catch (error) {
      console.error('Error adding client:', error)
      alert('Error adding client. Please try again.')
    }
  }

  const updateClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(selectedClient)
        .eq('id', selectedClient.id)
        .select()

      if (error) throw error

      setClients(clients.map(c => c.id === selectedClient.id ? data[0] : c))
      setShowEditModal(false)
      setSelectedClient(null)
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Error updating client. Please try again.')
    }
  }

  const deleteClient = async (clientId) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error

      setClients(clients.filter(c => c.id !== clientId))
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Error deleting client. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    const statusObj = pipelineStatuses.find(s => s.name === status)
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const openEditModal = (client) => {
    setSelectedClient({...client})
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

  const formatMinutes = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
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
          <div className="flex items-center gap-3">
            <div className="text-yellow-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-yellow-800 font-medium">Session expiring soon!</p>
              <p className="text-yellow-700 text-sm">Time remaining: {formatMinutes(sessionTime)}</p>
            </div>
            <button
              onClick={extendSession}
              className="ml-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
            >
              Extend
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Next Step CRM
                </h1>
                <p className="text-sm text-gray-600">Reverse Mortgage Division</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.name}
              </div>
              <div className="text-sm text-gray-500">
                Session: {formatMinutes(sessionTime)}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 appearance-none"
              >
                <option value="All">All Statuses</option>
                {pipelineStatuses.map(status => (
                  <option key={status.name} value={status.name}>{status.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                <p className="text-sm text-gray-600">Total Clients</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.pipeline_status === 'Funded').length}
                </p>
                <p className="text-sm text-gray-600">Funded</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => ['Processing', 'Underwriting', 'Approval'].includes(c.pipeline_status)).length}
                </p>
                <p className="text-sm text-gray-600">In Process</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => ['Lead', 'Qualified'].includes(c.pipeline_status)).length}
                </p>
                <p className="text-sm text-gray-600">New Leads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {client.first_name} {client.last_name}
                    </h3>
                    <p className="text-gray-600 text-sm">{client.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.pipeline_status)}`}>
                    {client.pipeline_status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HomeIcon className="w-4 h-4" />
                    <span>${parseInt(client.home_value || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>Mortgage: ${parseInt(client.current_mortgage_balance || 0).toLocaleString()}</span>
                  </div>
                  {client.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Age: {calculateAge(client.date_of_birth)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openViewModal(client)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(client)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => openCompareModal(client)}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Calculator className="w-4 h-4" />
                    Compare
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No clients found</p>
            <p className="text-gray-500">Add your first client to get started</p>
          </div>
        )}
      </main>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newClient.first_name}
                    onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newClient.last_name}
                    onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={newClient.date_of_birth}
                    onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Status</label>
                <select
                  value={newClient.pipeline_status}
                  onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {pipelineStatuses.map(status => (
                    <option key={status.name} value={status.name}>{status.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={newClient.street_address}
                  onChange={(e) => setNewClient({...newClient, street_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newClient.city}
                    onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newClient.state}
                    onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={newClient.zip_code}
                    onChange={(e) => setNewClient({...newClient, zip_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Value</label>
                  <input
                    type="number"
                    value={newClient.home_value}
                    onChange={(e) => setNewClient({...newClient, home_value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={newClient.current_mortgage_balance}
                    onChange={(e) => setNewClient({...newClient, current_mortgage_balance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="non-borrowing-spouse"
                  checked={newClient.has_non_borrowing_spouse}
                  onChange={(e) => setNewClient({...newClient, has_non_borrowing_spouse: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="non-borrowing-spouse" className="text-sm text-gray-700">
                  Has Non-Borrowing Spouse
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Edit Client</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={selectedClient.first_name}
                    onChange={(e) => setSelectedClient({...selectedClient, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={selectedClient.last_name}
                    onChange={(e) => setSelectedClient({...selectedClient, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={selectedClient.phone}
                    onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={selectedClient.date_of_birth}
                    onChange={(e) => setSelectedClient({...selectedClient, date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Status</label>
                <select
                  value={selectedClient.pipeline_status}
                  onChange={(e) => setSelectedClient({...selectedClient, pipeline_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {pipelineStatuses.map(status => (
                    <option key={status.name} value={status.name}>{status.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={selectedClient.street_address}
                  onChange={(e) => setSelectedClient({...selectedClient, street_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={selectedClient.city}
                    onChange={(e) => setSelectedClient({...selectedClient, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={selectedClient.state}
                    onChange={(e) => setSelectedClient({...selectedClient, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={selectedClient.zip_code}
                    onChange={(e) => setSelectedClient({...selectedClient, zip_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Value</label>
                  <input
                    type="number"
                    value={selectedClient.home_value}
                    onChange={(e) => setSelectedClient({...selectedClient, home_value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={selectedClient.current_mortgage_balance}
                    onChange={(e) => setSelectedClient({...selectedClient, current_mortgage_balance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-non-borrowing-spouse"
                  checked={selectedClient.has_non_borrowing_spouse}
                  onChange={(e) => setSelectedClient({...selectedClient, has_non_borrowing_spouse: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="edit-non-borrowing-spouse" className="text-sm text-gray-700">
                  Has Non-Borrowing Spouse
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-between">
              <button
                onClick={() => deleteClient(selectedClient.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateClient}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{selectedClient.first_name} {selectedClient.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-gray-900">
                        {selectedClient.date_of_birth} 
                        {selectedClient.date_of_birth && ` (Age: ${calculateAge(selectedClient.date_of_birth)})`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Pipeline Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedClient.pipeline_status)}`}>
                        {selectedClient.pipeline_status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">
                        {selectedClient.street_address}<br />
                        {selectedClient.city}, {selectedClient.state} {selectedClient.zip_code}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Home Value</label>
                      <p className="text-gray-900">${parseInt(selectedClient.home_value || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Mortgage Balance</label>
                      <p className="text-gray-900">${parseInt(selectedClient.current_mortgage_balance || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Non-Borrowing Spouse</label>
                      <p className="text-gray-900">{selectedClient.has_non_borrowing_spouse ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  openEditModal(selectedClient)
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700"
              >
                Edit Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Programs Modal */}
      {showCompareModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Program Comparison - {selectedClient.first_name} {selectedClient.last_name}
                </h2>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Client Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 font-medium">{calculateAge(selectedClient.date_of_birth) || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Home Value:</span>
                    <span className="ml-2 font-medium">${parseInt(selectedClient.home_value || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Current Mortgage:</span>
                    <span className="ml-2 font-medium">${parseInt(selectedClient.current_mortgage_balance || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Net Equity:</span>
                    <span className="ml-2 font-medium">${Math.max(0, (selectedClient.home_value || 0) - (selectedClient.current_mortgage_balance || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {(() => {
                const age = calculateAge(selectedClient.date_of_birth)
                const homeValue = parseInt(selectedClient.home_value || 0)
                const currentMortgage = parseInt(selectedClient.current_mortgage_balance || 0)
                const availablePrograms = getAvailablePrograms(homeValue, age)

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {['HECM', 'Equity Plus', 'Peak', 'LOC'].map((program) => {
                      const isAvailable = availablePrograms.includes(program)
                      const details = isAvailable ? calculateLoanDetails(program, homeValue, currentMortgage, age) : null

                      return (
                        <div
                          key={program}
                          className={`rounded-lg border-2 p-4 ${
                            isAvailable
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{program}</h4>
                            {isAvailable ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Available
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                Not Available
                              </span>
                            )}
                          </div>

                          {isAvailable && details ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">PLF:</span>
                                <span className="font-medium">{details.plf}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Principal Limit:</span>
                                <span className="font-medium">${parseInt(details.principalLimit).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Net Proceeds:</span>
                                <span className="font-medium text-green-600">${parseInt(details.netProceeds).toLocaleString()}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {homeValue < 150000 && program === 'HECM' && 'Minimum $150K home value required'}
                              {homeValue < 300000 && program === 'Equity Plus' && 'Minimum $300K home value required'}
                              {homeValue < 450000 && program === 'Peak' && 'Minimum $450K home value required'}
                              {homeValue < 200000 && program === 'LOC' && 'Minimum $200K home value required'}
                              {!age && 'Age required for calculation'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3, EyeOff, Lock, LogOut } from 'lucide-react'

// Initialize Supabase
const supabase = createClient(
  'https://qyrbkwcmsnrtomndsojb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cmJrd2Ntc25ydG9tbmRzb2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU4OTcyNjUsImV4cCI6MjA0MTQ3MzI2NX0.OZVkWEuUy3KJPyGOdHTL1gI2sB8hFv--EIQ8bbElJTI'
)

// Login Component
function LoginPage({ onLogin }: { onLogin: (userData: any) => void }) {
  const [email, setEmail] = useState('jeremiah.sherer@city1st.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simple authentication check
    if (email === 'jeremiah.sherer@city1st.com' && password.length > 0) {
      onLogin({ email, name: 'Jeremiah Sherer' })
    } else {
      alert('Invalid credentials. Please use jeremiah.sherer@city1st.com')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Next Step CRM
            </h1>
            <p className="text-gray-600 mt-2">Reverse Mortgage Division</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NextStepCRM() {
  const [user, setUser] = useState(null)
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    pipeline_status: 'Lead',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    home_value: '',
    current_mortgage_balance: '',
    has_non_borrowing_spouse: false
  })
  const [loading, setLoading] = useState(true)
  const [sessionTime, setSessionTime] = useState(600) // 10 minutes
  const [showWarning, setShowWarning] = useState(false)

  // Pipeline statuses with colors
  const pipelineStatuses = [
    { name: 'Lead', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { name: 'Qualified', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { name: 'Counseling Scheduled', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { name: 'Counseling Complete', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { name: 'Application Submitted', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { name: 'Processing', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { name: 'Underwriting', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { name: 'Approval', color: 'bg-green-100 text-green-800 border-green-200' },
    { name: 'Docs Out', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { name: 'Signed', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    { name: 'Funded', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { name: 'Closed', color: 'bg-green-200 text-green-900 border-green-300' }
  ]

  // PLF Table
  const plfTable = {
    62: { 'HECM': 39.9, 'Equity Plus': 45.0, 'Peak': 50.0, 'LOC': 35.0 },
    63: { 'HECM': 41.1, 'Equity Plus': 46.5, 'Peak': 51.5, 'LOC': 36.0 },
    64: { 'HECM': 42.3, 'Equity Plus': 48.0, 'Peak': 53.0, 'LOC': 37.0 },
    65: { 'HECM': 43.6, 'Equity Plus': 49.5, 'Peak': 54.5, 'LOC': 38.0 },
    66: { 'HECM': 44.9, 'Equity Plus': 51.0, 'Peak': 56.0, 'LOC': 39.0 },
    67: { 'HECM': 46.3, 'Equity Plus': 52.5, 'Peak': 57.5, 'LOC': 40.0 },
    68: { 'HECM': 47.7, 'Equity Plus': 54.0, 'Peak': 59.0, 'LOC': 41.0 },
    69: { 'HECM': 49.2, 'Equity Plus': 55.5, 'Peak': 60.5, 'LOC': 42.0 },
    70: { 'HECM': 50.7, 'Equity Plus': 57.0, 'Peak': 62.0, 'LOC': 43.0 },
    71: { 'HECM': 52.3, 'Equity Plus': 58.5, 'Peak': 63.5, 'LOC': 44.0 },
    72: { 'HECM': 53.9, 'Equity Plus': 60.0, 'Peak': 65.0, 'LOC': 45.0 },
    73: { 'HECM': 55.6, 'Equity Plus': 61.5, 'Peak': 66.5, 'LOC': 46.0 },
    74: { 'HECM': 57.4, 'Equity Plus': 63.0, 'Peak': 68.0, 'LOC': 47.0 },
    75: { 'HECM': 59.2, 'Equity Plus': 64.5, 'Peak': 69.5, 'LOC': 48.0 }
  }

  // Authentication and session management
  useEffect(() => {
    const savedUser = localStorage.getItem('nextStepUser')
    const loginTime = localStorage.getItem('nextStepLoginTime')
    
    if (savedUser && loginTime) {
      const elapsed = (Date.now() - parseInt(loginTime)) / 1000
      if (elapsed < 600) { // 10 minutes
        setUser(JSON.parse(savedUser))
        setSessionTime(600 - elapsed)
      } else {
        localStorage.removeItem('nextStepUser')
        localStorage.removeItem('nextStepLoginTime')
      }
    }
    setLoading(false)
  }, [])

  // Session timer
  useEffect(() => {
    if (!user) return

    const timer = setInterval(() => {
      setSessionTime(prev => {
        if (prev <= 120 && !showWarning) { // 2 minutes warning
          setShowWarning(true)
        }
        if (prev <= 0) {
          handleLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [user, showWarning])

  // Load clients
  useEffect(() => {
    if (user) {
      loadClients()
    }
  }, [user])

  // Filter clients
  useEffect(() => {
    let filtered = clients
    
    if (searchTerm) {
      filtered = filtered.filter(client =>
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
      )
    }
    
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(client => client.pipeline_status === selectedStatus)
    }
    
    setFilteredClients(filtered)
  }, [clients, searchTerm, selectedStatus])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('nextStepUser', JSON.stringify(userData))
    localStorage.setItem('nextStepLoginTime', Date.now().toString())
    setSessionTime(600)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('nextStepUser')
    localStorage.removeItem('nextStepLoginTime')
    setShowWarning(false)
  }

  const extendSession = () => {
    localStorage.setItem('nextStepLoginTime', Date.now().toString())
    setSessionTime(600)
    setShowWarning(false)
  }

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

  const getPLF = (program, age) => {
    if (!age || age < 62) return 0
    const ageKey = Math.min(Math.max(age, 62), 75)
    return plfTable[ageKey] ? plfTable[ageKey][program] || 0 : 0
  }

  const getAvailablePrograms = (homeValue, age) => {
    const programs = []
    if (homeValue >= 150000) programs.push('HECM')
    if (homeValue >= 300000) programs.push('Equity Plus')
    if (homeValue >= 450000) programs.push('Peak')
    if (homeValue >= 200000) programs.push('LOC')
    return programs
  }

  const calculateLoanDetails = (program, homeValue, currentMortgage, age) => {
    const plf = getPLF(program, age)
    const principalLimit = (homeValue * plf) / 100
    const netProceeds = Math.max(0, principalLimit - currentMortgage)
    
    return {
      principalLimit: principalLimit.toFixed(0),
      netProceeds: netProceeds.toFixed(0),
      plf: plf.toFixed(1)
    }
  }

  const addClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()

      if (error) throw error
      
      setClients([data[0], ...clients])
      setShowAddModal(false)
      setNewClient({
        first_name: '',
        last_name: '',
        phone: '',
        date_of_birth: '',
        pipeline_status: 'Lead',
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        home_value: '',
        current_mortgage_balance: '',
        has_non_borrowing_spouse: false
      })
    } catch (error) {
      console.error('Error adding client:', error)
      alert('Error adding client. Please try again.')
    }
  }

  const updateClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(selectedClient)
        .eq('id', selectedClient.id)
        .select()

      if (error) throw error

      setClients(clients.map(c => c.id === selectedClient.id ? data[0] : c))
      setShowEditModal(false)
      setSelectedClient(null)
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Error updating client. Please try again.')
    }
  }

  const deleteClient = async (clientId) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error

      setClients(clients.filter(c => c.id !== clientId))
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Error deleting client. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    const statusObj = pipelineStatuses.find(s => s.name === status)
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const openEditModal = (client) => {
    setSelectedClient({...client})
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

  const formatMinutes = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
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
          <div className="flex items-center gap-3">
            <div className="text-yellow-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-yellow-800 font-medium">Session expiring soon!</p>
              <p className="text-yellow-700 text-sm">Time remaining: {formatMinutes(sessionTime)}</p>
            </div>
            <button
              onClick={extendSession}
              className="ml-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
            >
              Extend
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Next Step CRM
                </h1>
                <p className="text-sm text-gray-600">Reverse Mortgage Division</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.name}
              </div>
              <div className="text-sm text-gray-500">
                Session: {formatMinutes(sessionTime)}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 appearance-none"
              >
                <option value="All">All Statuses</option>
                {pipelineStatuses.map(status => (
                  <option key={status.name} value={status.name}>{status.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                <p className="text-sm text-gray-600">Total Clients</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.pipeline_status === 'Funded').length}
                </p>
                <p className="text-sm text-gray-600">Funded</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => ['Processing', 'Underwriting', 'Approval'].includes(c.pipeline_status)).length}
                </p>
                <p className="text-sm text-gray-600">In Process</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => ['Lead', 'Qualified'].includes(c.pipeline_status)).length}
                </p>
                <p className="text-sm text-gray-600">New Leads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {client.first_name} {client.last_name}
                    </h3>
                    <p className="text-gray-600 text-sm">{client.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.pipeline_status)}`}>
                    {client.pipeline_status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HomeIcon className="w-4 h-4" />
                    <span>${parseInt(client.home_value || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>Mortgage: ${parseInt(client.current_mortgage_balance || 0).toLocaleString()}</span>
                  </div>
                  {client.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Age: {calculateAge(client.date_of_birth)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openViewModal(client)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(client)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => openCompareModal(client)}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Calculator className="w-4 h-4" />
                    Compare
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No clients found</p>
            <p className="text-gray-500">Add your first client to get started</p>
          </div>
        )}
      </main>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newClient.first_name}
                    onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newClient.last_name}
                    onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={newClient.date_of_birth}
                    onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Status</label>
                <select
                  value={newClient.pipeline_status}
                  onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {pipelineStatuses.map(status => (
                    <option key={status.name} value={status.name}>{status.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={newClient.street_address}
                  onChange={(e) => setNewClient({...newClient, street_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newClient.city}
                    onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newClient.state}
                    onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={newClient.zip_code}
                    onChange={(e) => setNewClient({...newClient, zip_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Value</label>
                  <input
                    type="number"
                    value={newClient.home_value}
                    onChange={(e) => setNewClient({...newClient, home_value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={newClient.current_mortgage_balance}
                    onChange={(e) => setNewClient({...newClient, current_mortgage_balance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="non-borrowing-spouse"
                  checked={newClient.has_non_borrowing_spouse}
                  onChange={(e) => setNewClient({...newClient, has_non_borrowing_spouse: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="non-borrowing-spouse" className="text-sm text-gray-700">
                  Has Non-Borrowing Spouse
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Edit Client</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={selectedClient.first_name}
                    onChange={(e) => setSelectedClient({...selectedClient, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={selectedClient.last_name}
                    onChange={(e) => setSelectedClient({...selectedClient, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={selectedClient.phone}
                    onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={selectedClient.date_of_birth}
                    onChange={(e) => setSelectedClient({...selectedClient, date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Status</label>
                <select
                  value={selectedClient.pipeline_status}
                  onChange={(e) => setSelectedClient({...selectedClient, pipeline_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {pipelineStatuses.map(status => (
                    <option key={status.name} value={status.name}>{status.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={selectedClient.street_address}
                  onChange={(e) => setSelectedClient({...selectedClient, street_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={selectedClient.city}
                    onChange={(e) => setSelectedClient({...selectedClient, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={selectedClient.state}
                    onChange={(e) => setSelectedClient({...selectedClient, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={selectedClient.zip_code}
                    onChange={(e) => setSelectedClient({...selectedClient, zip_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Value</label>
                  <input
                    type="number"
                    value={selectedClient.home_value}
                    onChange={(e) => setSelectedClient({...selectedClient, home_value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={selectedClient.current_mortgage_balance}
                    onChange={(e) => setSelectedClient({...selectedClient, current_mortgage_balance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-non-borrowing-spouse"
                  checked={selectedClient.has_non_borrowing_spouse}
                  onChange={(e) => setSelectedClient({...selectedClient, has_non_borrowing_spouse: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="edit-non-borrowing-spouse" className="text-sm text-gray-700">
                  Has Non-Borrowing Spouse
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-between">
              <button
                onClick={() => deleteClient(selectedClient.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateClient}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{selectedClient.first_name} {selectedClient.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-gray-900">
                        {selectedClient.date_of_birth} 
                        {selectedClient.date_of_birth && ` (Age: ${calculateAge(selectedClient.date_of_birth)})`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Pipeline Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedClient.pipeline_status)}`}>
                        {selectedClient.pipeline_status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">
                        {selectedClient.street_address}<br />
                        {selectedClient.city}, {selectedClient.state} {selectedClient.zip_code}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Home Value</label>
                      <p className="text-gray-900">${parseInt(selectedClient.home_value || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Mortgage Balance</label>
                      <p className="text-gray-900">${parseInt(selectedClient.current_mortgage_balance || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Non-Borrowing Spouse</label>
                      <p className="text-gray-900">{selectedClient.has_non_borrowing_spouse ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  openEditModal(selectedClient)
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700"
              >
                Edit Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Programs Modal */}
      {showCompareModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Program Comparison - {selectedClient.first_name} {selectedClient.last_name}
                </h2>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Client Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 font-medium">{calculateAge(selectedClient.date_of_birth) || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Home Value:</span>
                    <span className="ml-2 font-medium">${parseInt(selectedClient.home_value || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Current Mortgage:</span>
                    <span className="ml-2 font-medium">${parseInt(selectedClient.current_mortgage_balance || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Net Equity:</span>
                    <span className="ml-2 font-medium">${Math.max(0, (selectedClient.home_value || 0) - (selectedClient.current_mortgage_balance || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {(() => {
                const age = calculateAge(selectedClient.date_of_birth)
                const homeValue = parseInt(selectedClient.home_value || 0)
                const currentMortgage = parseInt(selectedClient.current_mortgage_balance || 0)
                const availablePrograms = getAvailablePrograms(homeValue, age)

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {['HECM', 'Equity Plus', 'Peak', 'LOC'].map((program) => {
                      const isAvailable = availablePrograms.includes(program)
                      const details = isAvailable ? calculateLoanDetails(program, homeValue, currentMortgage, age) : null

                      return (
                        <div
                          key={program}
                          className={`rounded-lg border-2 p-4 ${
                            isAvailable
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{program}</h4>
                            {isAvailable ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Available
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                Not Available
                              </span>
                            )}
                          </div>

                          {isAvailable && details ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">PLF:</span>
                                <span className="font-medium">{details.plf}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Principal Limit:</span>
                                <span className="font-medium">${parseInt(details.principalLimit).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Net Proceeds:</span>
                                <span className="font-medium text-green-600">${parseInt(details.netProceeds).toLocaleString()}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {homeValue < 150000 && program === 'HECM' && 'Minimum $150K home value required'}
                              {homeValue < 300000 && program === 'Equity Plus' && 'Minimum $300K home value required'}
                              {homeValue < 450000 && program === 'Peak' && 'Minimum $450K home value required'}
                              {homeValue < 200000 && program === 'LOC' && 'Minimum $200K home value required'}
                              {!age && 'Age required for calculation'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
