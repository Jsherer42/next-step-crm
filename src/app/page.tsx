'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3 } from 'lucide-react'

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  spouse_first_name?: string
  spouse_last_name?: string
  spouse_date_of_birth?: string
  home_value?: number
  address?: string
  property_type?: string
  current_mortgage_balance?: number
  occupancy_status?: string
  program_type?: string
  pipeline_status?: string
  pipeline_date?: string
  created_at?: string
}

// PLF Tables for calculations
const HECM_PLF = {
  62: 0.575, 63: 0.580, 64: 0.585, 65: 0.590, 66: 0.595, 67: 0.600, 68: 0.605, 69: 0.610, 70: 0.615,
  71: 0.620, 72: 0.625, 73: 0.630, 74: 0.635, 75: 0.640, 76: 0.645, 77: 0.650, 78: 0.655, 79: 0.660,
  80: 0.665, 81: 0.670, 82: 0.675, 83: 0.680, 84: 0.685, 85: 0.690, 86: 0.695, 87: 0.700, 88: 0.705,
  89: 0.710, 90: 0.715, 91: 0.720, 92: 0.725, 93: 0.730, 94: 0.735, 95: 0.740
}

const EQUITY_PLUS_PLF = {
  55: 0.350, 56: 0.355, 57: 0.360, 58: 0.365, 59: 0.370, 60: 0.375, 61: 0.380, 62: 0.555, 63: 0.560,
  64: 0.565, 65: 0.570, 66: 0.575, 67: 0.580, 68: 0.585, 69: 0.590, 70: 0.595, 71: 0.600, 72: 0.605,
  73: 0.610, 74: 0.615, 75: 0.620, 76: 0.625, 77: 0.630, 78: 0.635, 79: 0.640, 80: 0.645, 81: 0.650,
  82: 0.655, 83: 0.660, 84: 0.665, 85: 0.670, 86: 0.675, 87: 0.680, 88: 0.685, 89: 0.690, 90: 0.695,
  91: 0.700, 92: 0.705, 93: 0.710, 94: 0.715, 95: 0.720
}

export default function NextStepCRM() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showProgramComparison, setShowProgramComparison] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client>({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    spouse_first_name: '',
    spouse_last_name: '',
    spouse_date_of_birth: '',
    home_value: 0,
    address: '',
    property_type: 'Single Family Residence',
    current_mortgage_balance: 0,
    occupancy_status: 'Primary Residence',
    program_type: 'HECM',
    pipeline_status: 'Proposal Out',
    pipeline_date: new Date().toISOString().split('T')[0]
  })

  const [newClient, setNewClient] = useState<Client>({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    spouse_first_name: '',
    spouse_last_name: '',
    spouse_date_of_birth: '',
    home_value: 0,
    address: '',
    property_type: 'Single Family Residence',
    current_mortgage_balance: 0,
    occupancy_status: 'Primary Residence',
    program_type: 'HECM',
    pipeline_status: 'Proposal Out',
    pipeline_date: new Date().toISOString().split('T')[0]
  })

  // Load clients from localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('nextStepClients')
    if (savedClients) {
      setClients(JSON.parse(savedClients))
    }
  }, [])

  // Save clients to localStorage
  useEffect(() => {
    localStorage.setItem('nextStepClients', JSON.stringify(clients))
  }, [clients])

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 62
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Get youngest borrower age (required for PLF calculations)
  const getYoungestAge = (client: Client): number => {
    const primaryAge = calculateAge(client.date_of_birth)
    if (!client.spouse_date_of_birth) return primaryAge
    const spouseAge = calculateAge(client.spouse_date_of_birth)
    return Math.min(primaryAge, spouseAge)
  }

  // Calculate UPB based on program type and age
  const calculateUPB = (homeValue: number, programType: string, age: number): number => {
    const ageKey = Math.min(age, 95) as keyof typeof HECM_PLF
    
    let plf = 0
    if (programType === 'HECM') {
      plf = HECM_PLF[ageKey] || 0.575
    } else {
      plf = EQUITY_PLUS_PLF[ageKey] || 0.350
    }
    
    const lendingLimit = programType === 'HECM' ? 1149825 : 4000000
    const effectiveValue = Math.min(homeValue, lendingLimit)
    
    return effectiveValue * plf
  }

  // Calculate net proceeds (what client actually receives)
  const calculateNetProceeds = (upb: number, currentMortgage: number, programType: string): number => {
    const estimatedCosts = {
      'HECM': 8000,
      'Equity Plus Standard': 12000,
      'Equity Plus Extra': 12000,
      'Equity Plus Select': 12000
    }
    
    const closingCosts = estimatedCosts[programType as keyof typeof estimatedCosts] || 8000
    return Math.max(0, upb - currentMortgage - closingCosts)
  }

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Add new client
  const addClient = () => {
    if (newClient.first_name && newClient.last_name) {
      const client = {
        ...newClient,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      setClients([...clients, client])
      setNewClient({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        spouse_first_name: '',
        spouse_last_name: '',
        spouse_date_of_birth: '',
        home_value: 0,
        address: '',
        property_type: 'Single Family Residence',
        current_mortgage_balance: 0,
        occupancy_status: 'Primary Residence',
        program_type: 'HECM',
        pipeline_status: 'Proposal Out',
        pipeline_date: new Date().toISOString().split('T')[0]
      })
      setShowAddModal(false)
    }
  }

  // Update client
  const updateClient = () => {
    setClients(clients.map(client => 
      client.id === editingClient.id ? editingClient : client
    ))
    setShowEditModal(false)
  }

  // Delete client
  const deleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id))
  }

  // Filter clients
  const filteredClients = clients.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  // Calculate stats
  const totalPipeline = clients.reduce((sum, client) => {
    const age = getYoungestAge(client)
    return sum + calculateUPB(client.home_value || 0, client.program_type || 'HECM', age)
  }, 0)

  // Test import function
  const testGHLImport = () => {
    const testLead = {
      id: Date.now().toString(),
      first_name: 'Test',
      last_name: 'Lead',
      email: 'test@example.com',
      phone: '(555) 123-4567',
      date_of_birth: '1960-01-01',
      home_value: 500000,
      address: '123 Test Street, Test City, TS 12345',
      property_type: 'Single Family Residence',
      current_mortgage_balance: 0,
      occupancy_status: 'Primary Residence',
      program_type: 'HECM',
      pipeline_status: 'Proposal Out',
      pipeline_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }
    
    setClients([...clients, testLead])
    alert('Test lead imported and saved!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-green-400">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Next Step CRM</h1>
          <p className="text-blue-100">Professional Reverse Mortgage Management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Clients</p>
                <p className="text-3xl font-bold">{clients.length}</p>
              </div>
              <User className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Pipeline</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPipeline)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Average UPB</p>
                <p className="text-2xl font-bold">{clients.length > 0 ? formatCurrency(totalPipeline / clients.length) : '$0'}</p>
              </div>
              <HomeIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-0 bg-white bg-opacity-20 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:bg-opacity-30"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-2xl transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
          <button
            onClick={testGHLImport}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-2xl transition-all flex items-center gap-2 font-medium"
          >
            <DollarSign className="w-5 h-5" />
            Test GHL Import
          </button>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const age = getYoungestAge(client)
            const upb = calculateUPB(client.home_value || 0, client.program_type || 'HECM', age)
            const netProceeds = calculateNetProceeds(upb, client.current_mortgage_balance || 0, client.program_type || 'HECM')

            return (
              <div key={client.id} className="bg-white bg-opacity-20 rounded-2xl p-6 text-white backdrop-blur-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {client.first_name} {client.last_name}
                      {client.spouse_first_name && (
                        <span className="text-sm font-normal"> & {client.spouse_first_name}</span>
                      )}
                    </h3>
                    <p className="text-gray-200 text-sm">
                      Youngest Borrower: <span className="font-semibold">{age} years</span>
                    </p>
                    {client.address && (
                      <p className="text-gray-200 text-sm mt-1">{client.address}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-300">💰 {formatCurrency(netProceeds)}</p>
                    <p className="text-xs text-gray-300">Est. Net Proceeds</p>
                    <p className="text-sm text-gray-200">UPB: {formatCurrency(upb)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-200 mb-4">
                  <span className="flex items-center">
                    <HomeIcon className="w-4 h-4 mr-1" />
                    {client.property_type} • {client.occupancy_status}
                  </span>
                  <span>{formatCurrency(client.home_value || 0)}</span>
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => setShowProgramComparison(client)}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Compare
                  </button>
                  <button
                    onClick={() => {
                      setEditingClient(client)
                      setShowEditModal(true)
                    }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteClient(client.id)}
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

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={newClient.date_of_birth}
                    onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Address Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Address</label>
                  <input
                    type="text"
                    value={newClient.address || ''}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter property address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home Value *</label>
                    <input
                      type="number"
                      value={newClient.home_value || ''}
                      onChange={(e) => setNewClient({...newClient, home_value: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter home value"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                    <input
                      type="number"
                      value={newClient.current_mortgage_balance || ''}
                      onChange={(e) => setNewClient({...newClient, current_mortgage_balance: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current mortgage balance"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={addClient}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  Add Client
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Client Modal */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedClient.first_name} {selectedClient.last_name}</h2>
                  {selectedClient.address && (
                    <p className="text-gray-600">{selectedClient.address}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-semibold text-gray-800">{selectedClient.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-semibold text-gray-800">{selectedClient.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Age</div>
                  <div className="font-semibold text-gray-800">{getYoungestAge(selectedClient)} years</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Home Value</div>
                  <div className="font-semibold text-gray-800">{formatCurrency(selectedClient.home_value || 0)}</div>
                </div>
              </div>

              {selectedClient.address && (
                <div className="mb-6">
                  <a
                    href={`https://www.zillow.com/homes/${encodeURIComponent(selectedClient.address)}_rb/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    🏠 View on Zillow
                  </a>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
