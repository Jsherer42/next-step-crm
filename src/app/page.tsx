'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3 } from 'lucide-react'

// Initialize Supabase client with CURRENT API KEY
const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'

const supabase = createClient(supabaseUrl, supabaseKey)

export default function NextStepCRM() {
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
    'Lead': 'bg-gray-100 text-gray-800',
    'Contacted': 'bg-blue-100 text-blue-800',
    'Qualified': 'bg-indigo-100 text-indigo-800',
    'Proposal Out/Pitched': 'bg-purple-100 text-purple-800',
    'Application Started': 'bg-yellow-100 text-yellow-800',
    'Processing': 'bg-orange-100 text-orange-800',
    'Underwriting': 'bg-red-100 text-red-800',
    'Approval': 'bg-green-100 text-green-800',
    'Docs Out': 'bg-emerald-100 text-emerald-800',
    'Funded': 'bg-cyan-100 text-cyan-800',
    'Declined': 'bg-rose-100 text-rose-800',
    'Dead': 'bg-stone-100 text-stone-800'
  }

  // Load clients on component mount
  useEffect(() => {
    loadClients()
  }, [])

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
    
    // Age-based PLF values
    const plfTable = {
      62: { HECM: 39.9, 'Equity Plus': 42.60, Peak: 47.70, LOC: 42.60 },
      63: { HECM: 40.4, 'Equity Plus': 43.15, Peak: 48.30, LOC: 43.15 },
      64: { HECM: 40.8, 'Equity Plus': 43.70, Peak: 48.90, LOC: 43.70 },
      65: { HECM: 41.3, 'Equity Plus': 44.25, Peak: 49.50, LOC: 44.25 },
      66: { HECM: 41.8, 'Equity Plus': 44.80, Peak: 50.10, LOC: 44.80 },
      67: { HECM: 42.2, 'Equity Plus': 45.25, Peak: 50.60, LOC: 45.25 },
      68: { HECM: 42.7, 'Equity Plus': 45.80, Peak: 51.20, LOC: 45.80 },
      69: { HECM: 43.1, 'Equity Plus': 46.25, Peak: 51.70, LOC: 46.25 },
      70: { HECM: 43.6, 'Equity Plus': 46.80, Peak: 52.30, LOC: 46.80 },
      71: { HECM: 44.0, 'Equity Plus': 47.25, Peak: 52.80, LOC: 47.25 },
      72: { HECM: 39.9, 'Equity Plus': 42.60, Peak: 47.70, LOC: 42.60 },
      73: { HECM: 40.4, 'Equity Plus': 43.15, Peak: 48.30, LOC: 43.15 },
      74: { HECM: 40.8, 'Equity Plus': 43.70, Peak: 48.90, LOC: 43.70 },
      75: { HECM: 41.3, 'Equity Plus': 44.25, Peak: 49.50, LOC: 44.25 }
    }
    
    return plfTable[age]?.[program] || 0
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
    
    const principalLimit = homeValue * (plf / 100)
    const netProceeds = principalLimit - (currentMortgage || 0)
    
    return {
      principalLimit: Math.round(principalLimit),
      netProceeds: Math.round(Math.max(0, netProceeds)),
      plf: plf
    }
  }

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
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Total Net Proceeds: ${filteredClients.reduce((sum, client) => {
                  const age = calculateAge(client.date_of_birth)
                  const programs = getAvailablePrograms(client.home_value, age)
                  if (programs.length > 0) {
                    const details = calculateLoanDetails(programs[0], client.home_value, client.current_mortgage_balance, age)
                    return sum + (details?.netProceeds || 0)
                  }
                  return sum
                }, 0).toLocaleString()}</span>
              </div>
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200"
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
              <div key={client.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
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
                      <Phone className="w-4 h-4 mr-2" />
                      {client.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {client.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Home className="w-4 h-4 mr-2" />
                      ${client.home_value?.toLocaleString()}
                    </div>
                    {loanDetails && (
                      <div className="flex items-center text-sm text-green-600 font-semibold">
                        <DollarSign className="w-4 h-4 mr-2" />
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
                      className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-sm font-semibold rounded-lg transition-all duration-200"
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
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                  <select
                    value={newClient.pipeline_status}
                    onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={newClient.city}
                    onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={newClient.state}
                    onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                  <input
                    type="number"
                    value={newClient.home_value}
                    onChange={(e) => setNewClient({...newClient, home_value: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={newClient.current_mortgage_balance}
                    onChange={(e) => setNewClient({...newClient, current_mortgage_balance: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            
            <div className="flex justify-end space-x-4 p-6 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200"
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
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
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
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
                    <div key={program} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{program}</h3>
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
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
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Edit Client</h2>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editingClient.last_name || ''}
                    onChange={(e) => setEditingClient({...editingClient, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                  <select
                    value={editingClient.pipeline_status || ''}
                    onChange={(e) => setEditingClient({...editingClient, pipeline_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editingClient.city || ''}
                    onChange={(e) => setEditingClient({...editingClient, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={editingClient.state || ''}
                    onChange={(e) => setEditingClient({...editingClient, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={editingClient.zip_code || ''}
                    onChange={(e) => setEditingClient({...editingClient, zip_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={editingClient.current_mortgage_balance || ''}
                    onChange={(e) => setEditingClient({...editingClient, current_mortgage_balance: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            
            <div className="flex justify-end space-x-4 p-6 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={updateClient}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200"
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
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Client Details</h2>
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
                    <p className="text-gray-900">{selectedClient.phone}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Property & Loan Details</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">
                      {selectedClient.street_address}<br />
                      {selectedClient.city}, {selectedClient.state} {selectedClient.zip_code}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Home Value</label>
                    <p className="text-gray-900">${selectedClient.home_value?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Mortgage Balance</label>
                    <p className="text-gray-900">${selectedClient.current_mortgage_balance?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pipeline Status</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedClient.pipeline_status]}`}>
                      {selectedClient.pipeline_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
