'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calendar, Filter, Edit2, Eye, X, Save, Calculator, User } from 'lucide-react'

// Client interface
interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  spouse_name?: string
  spouse_date_of_birth?: string
  spouse_is_nbs?: boolean
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  home_value?: number
  desired_proceeds?: number
  loan_officer?: string
  pipeline_status?: string
  lead_source?: string
  notes?: string
  program_type?: string
  interest_rate?: number
  property_type?: string
  created_at?: string
  updated_at?: string
}

// Global storage for clients - survives component re-renders
let globalClientStorage: Client[] = []

export default function NextStepCRM() {
  // Initialize with demo clients if storage is empty
  const initializeClients = (): Client[] => {
    if (globalClientStorage.length === 0) {
      globalClientStorage = [
        {
          id: '1',
          first_name: 'Robert',
          last_name: 'Johnson',
          email: 'robert.johnson@email.com',
          phone: '(555) 123-4567',
          date_of_birth: '1962-05-15',
          spouse_name: 'Linda Johnson',
          spouse_date_of_birth: '1965-08-22',
          spouse_is_nbs: false,
          street_address: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zip_code: '62701',
          home_value: 450000,
          desired_proceeds: 200000,
          loan_officer: 'Christian',
          pipeline_status: 'New Lead',
          lead_source: 'Website',
          notes: 'Initial consultation completed. Very interested in HECM program.',
          program_type: 'HECM',
          interest_rate: 6.5,
          property_type: 'Single Family',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          first_name: 'Margaret',
          last_name: 'Chen',
          email: 'margaret.chen@email.com',
          phone: '(555) 987-6543',
          date_of_birth: '1958-12-03',
          spouse_name: '',
          spouse_date_of_birth: '',
          spouse_is_nbs: false,
          street_address: '456 Oak Avenue',
          city: 'Madison',
          state: 'WI',
          zip_code: '53703',
          home_value: 620000,
          desired_proceeds: 350000,
          loan_officer: 'Ahmed',
          pipeline_status: 'Application Submitted',
          lead_source: 'Referral',
          notes: 'High-value property. Considering Equity Plus Peak for maximum proceeds.',
          program_type: 'Equity Plus Peak',
          interest_rate: 7.2,
          property_type: 'Single Family',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      console.log('🏠 Initialized demo clients in global storage')
    }
    return [...globalClientStorage]
  }

  // State management
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddClient, setShowAddClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showProgramComparison, setShowProgramComparison] = useState<Client | null>(null)

  // Load clients from global storage on mount
  useEffect(() => {
    const initialClients = initializeClients()
    setClients(initialClients)
    console.log('✅ Loaded clients from global storage:', initialClients.length)
  }, [])

  // Update global storage whenever clients change
  useEffect(() => {
    if (clients.length > 0) {
      globalClientStorage = [...clients]
      console.log('💾 Updated global storage with', clients.length, 'clients')
    }
  }, [clients])

  const [newClient, setNewClient] = useState<Client>({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    spouse_name: '',
    spouse_date_of_birth: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    home_value: 0,
    desired_proceeds: 0,
    loan_officer: '',
    pipeline_status: 'New Lead',
    lead_source: 'Website',
    notes: '',
    program_type: 'HECM',
    interest_rate: 6.5,
    property_type: 'Single Family'
  })

  // GHL Webhook handler for importing leads
  const handleGHLWebhook = async (webhookData: any) => {
    try {
      // Check if this is a "Next Step CRM" disposition
      if (webhookData.disposition === "Next Step CRM") {
        // Create new client from GHL data
        const newClient: Client = {
          id: Date.now().toString(),
          first_name: webhookData.firstName || 'Unknown',
          last_name: webhookData.lastName || 'Lead',
          email: webhookData.email || '',
          phone: webhookData.phone || '',
          date_of_birth: webhookData.dateOfBirth || '',
          street_address: webhookData.address || '',
          city: webhookData.city || '',
          state: webhookData.state || '',
          zip_code: webhookData.zipCode || '',
          home_value: webhookData.homeValue || 0,
          desired_proceeds: webhookData.desiredProceeds || 0,
          loan_officer: 'Unassigned',
          pipeline_status: 'GHL Import',
          lead_source: 'GoHighLevel',
          notes: `Imported from GHL on ${new Date().toLocaleDateString()}`,
          program_type: 'HECM',
          interest_rate: 6.5,
          property_type: 'Single Family',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Check for duplicates by phone number
        const existingClient = clients.find(client => 
          client.phone.replace(/\D/g, '') === newClient.phone.replace(/\D/g, '')
        )

        if (!existingClient) {
          const updatedClients = [...clients, newClient]
          setClients(updatedClients)
          console.log('✅ New lead imported from GHL:', newClient.first_name, newClient.last_name)
          alert(`✅ New lead added: ${newClient.first_name} ${newClient.last_name}`)
        } else {
          console.log('⚠️ Duplicate lead detected, skipping import')
          alert('⚠️ Duplicate lead detected - not importing')
        }
      }
    } catch (error) {
      console.error('❌ Error processing GHL webhook:', error)
    }
  }

  // Test persistence function
  const testPersistence = () => {
    const currentCount = clients.length
    console.log('🧪 Testing persistence...')
    console.log('Current clients in state:', currentCount)
    console.log('Current clients in global storage:', globalClientStorage.length)
    
    alert(`Persistence Test:\nClients in state: ${currentCount}\nClients in global storage: ${globalClientStorage.length}\n\nNow refresh the page to test if data persists!`)
  }

  // PLF Tables based on your actual data files
  const EQUITY_PLUS_PLF = {
    55: { "Equity Plus": 0.338, "Equity Plus Peak": 0.391, "Equity Plus LOC": 0.338 },
    56: { "Equity Plus": 0.341, "Equity Plus Peak": 0.394, "Equity Plus LOC": 0.341 },
    57: { "Equity Plus": 0.344, "Equity Plus Peak": 0.396, "Equity Plus LOC": 0.344 },
    58: { "Equity Plus": 0.347, "Equity Plus Peak": 0.399, "Equity Plus LOC": 0.347 },
    59: { "Equity Plus": 0.350, "Equity Plus Peak": 0.402, "Equity Plus LOC": 0.350 },
    60: { "Equity Plus": 0.353, "Equity Plus Peak": 0.405, "Equity Plus LOC": 0.353 },
    61: { "Equity Plus": 0.356, "Equity Plus Peak": 0.408, "Equity Plus LOC": 0.356 },
    62: { "Equity Plus": 0.359, "Equity Plus Peak": 0.411, "Equity Plus LOC": 0.359 },
    63: { "Equity Plus": 0.362, "Equity Plus Peak": 0.414, "Equity Plus LOC": 0.362 },
    64: { "Equity Plus": 0.365, "Equity Plus Peak": 0.417, "Equity Plus LOC": 0.365 },
    65: { "Equity Plus": 0.368, "Equity Plus Peak": 0.420, "Equity Plus LOC": 0.368 },
    66: { "Equity Plus": 0.371, "Equity Plus Peak": 0.423, "Equity Plus LOC": 0.371 },
    67: { "Equity Plus": 0.374, "Equity Plus Peak": 0.426, "Equity Plus LOC": 0.374 },
    68: { "Equity Plus": 0.377, "Equity Plus Peak": 0.429, "Equity Plus LOC": 0.377 },
    69: { "Equity Plus": 0.380, "Equity Plus Peak": 0.432, "Equity Plus LOC": 0.380 },
    70: { "Equity Plus": 0.383, "Equity Plus Peak": 0.435, "Equity Plus LOC": 0.383 },
    75: { "Equity Plus": 0.395, "Equity Plus Peak": 0.447, "Equity Plus LOC": 0.395 },
    80: { "Equity Plus": 0.407, "Equity Plus Peak": 0.459, "Equity Plus LOC": 0.407 },
    85: { "Equity Plus": 0.419, "Equity Plus Peak": 0.471, "Equity Plus LOC": 0.419 },
    90: { "Equity Plus": 0.431, "Equity Plus Peak": 0.483, "Equity Plus LOC": 0.431 },
    95: { "Equity Plus": 0.443, "Equity Plus Peak": 0.495, "Equity Plus LOC": 0.443 }
  }

  // Enhanced PLF calculation with all programs
  const calculateProgramComparison = (client: Client) => {
    const age = getYoungestAge(client)
    const homeValue = client.home_value || 0
    
    const programs = [
      {
        name: 'HECM',
        description: 'Government Program - FHA Insured',
        plf: age >= 70 ? 0.338 : age >= 65 ? 0.305 : 0.285,
        upb: homeValue * (age >= 70 ? 0.338 : age >= 65 ? 0.305 : 0.285),
        features: ['FHA Insured', 'No Income Requirements', 'Counseling Required', 'Mortgage Insurance']
      },
      {
        name: 'Equity Plus',
        description: 'Standard Proprietary Program',
        plf: EQUITY_PLUS_PLF[Math.min(age, 95)]?.["Equity Plus"] || 0.338,
        upb: homeValue * (EQUITY_PLUS_PLF[Math.min(age, 95)]?.["Equity Plus"] || 0.338),
        features: ['Higher Loan Limits', 'No Mortgage Insurance', 'Faster Processing', 'Flexible Terms']
      },
      {
        name: 'Equity Plus Peak',
        description: 'Enhanced Proprietary Program',
        plf: EQUITY_PLUS_PLF[Math.min(age, 95)]?.["Equity Plus Peak"] || 0.391,
        upb: homeValue * (EQUITY_PLUS_PLF[Math.min(age, 95)]?.["Equity Plus Peak"] || 0.391),
        features: ['Highest Loan Amounts', 'Premium Program', 'Best for High-Value Homes', 'Maximum Proceeds']
      },
      {
        name: 'Equity Plus LOC',
        description: 'Line of Credit Program',
        plf: EQUITY_PLUS_PLF[Math.min(age, 95)]?.["Equity Plus LOC"] || 0.338,
        upb: homeValue * (EQUITY_PLUS_PLF[Math.min(age, 95)]?.["Equity Plus LOC"] || 0.338),
        features: ['Line of Credit', 'Growth Rate', 'Flexible Access', 'Future Planning']
      }
    ]

    return programs.sort((a, b) => b.upb - a.upb)
  }

  // Simple PLF calculation for individual use
  const calculateUPB = (homeValue: number, age: number, programType: string = 'HECM') => {
    let plf = 0.285 // Default HECM at age 62
    
    if (programType === 'HECM') {
      plf = age >= 70 ? 0.338 : age >= 65 ? 0.305 : 0.285
    } else if (programType === 'Equity Plus') {
      plf = EQUITY_PLUS_PLF[Math.min(age, 95)]?.["Equity Plus"] || 0.338
    } else if (programType === 'Equity Plus Peak') {
      plf = EQUITY_PLUS_PLF[Math.min(age, 95)]?.["Equity Plus Peak"] || 0.391
    } else if (programType === 'Equity Plus LOC') {
      plf = EQUITY_PLUS_PLF[Math.min(age, 95)]?.["Equity Plus LOC"] || 0.338
    }
    
    return homeValue * plf
  }

  const getYoungestAge = (client: Client) => {
    const clientAge = calculateAge(client.date_of_birth)
    const spouseAge = client.spouse_date_of_birth ? calculateAge(client.spouse_date_of_birth) : null
    return spouseAge ? Math.min(clientAge, spouseAge) : clientAge
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Calculate total UPB pipeline instead of desired proceeds
  const totalPipeline = clients.reduce((sum, client) => {
    const age = getYoungestAge(client)
    const upb = calculateUPB(client.home_value || 0, age, client.program_type || 'HECM')
    return sum + upb
  }, 0)

  // Filtered clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    
    const matchesFilter = filterStatus === 'all' || client.pipeline_status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const addClient = () => {
    if (newClient.first_name && newClient.last_name) {
      const clientToAdd: Client = {
        ...newClient,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const updatedClients = [...clients, clientToAdd]
      setClients(updatedClients)
      
      setNewClient({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        spouse_name: '',
        spouse_date_of_birth: '',
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        home_value: 0,
        desired_proceeds: 0,
        loan_officer: '',
        pipeline_status: 'New Lead',
        lead_source: 'Website',
        notes: '',
        program_type: 'HECM',
        interest_rate: 6.5,
        property_type: 'Single Family'
      })
      setShowAddClient(false)
      console.log('✅ New client added:', clientToAdd.first_name, clientToAdd.last_name)
    }
  }

  const deleteClient = (id: string) => {
    const updatedClients = clients.filter(client => client.id !== id)
    setClients(updatedClients)
    setShowDeleteConfirm(null)
    console.log('✅ Client deleted')
  }

  const updateClient = (updatedClient: Client) => {
    const updatedClients = clients.map(client => 
      client.id === updatedClient.id 
        ? { ...updatedClient, updated_at: new Date().toISOString() }
        : client
    )
    setClients(updatedClients)
    setEditingClient(null)
    console.log('✅ Client updated:', updatedClient.first_name, updatedClient.last_name)
  }

  const addNote = (clientId: string) => {
    if (newNote.trim()) {
      const updatedClients = clients.map(client => 
        client.id === clientId 
          ? { 
              ...client, 
              notes: client.notes ? `${client.notes}\n\n${new Date().toLocaleDateString()}: ${newNote}` : newNote,
              updated_at: new Date().toISOString()
            }
          : client
      )
      setClients(updatedClients)
      setNewNote('')
      console.log('✅ Note added to client')
    }
  }

  const selectProgram = (client: Client, programName: string) => {
    const updatedClient = { 
      ...client, 
      program_type: programName,
      updated_at: new Date().toISOString()
    }
    updateClient(updatedClient)
    setShowProgramComparison(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-8 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black">Next Step CRM</h1>
                  <p className="text-blue-100 font-semibold">City First FHA Retirement</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-lg font-bold text-white/90 mb-1">Total UPB Pipeline</p>
                <p className="text-4xl font-black text-white drop-shadow-lg">
                  {formatCurrency(totalPipeline)}
                </p>
                <p className="text-sm text-blue-100 mt-2">
                  {clients.length} Active Clients • Real PLF Calculations
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => {
                  const testData = {
                    disposition: "Next Step CRM",
                    firstName: "Test",
                    lastName: "Lead",
                    email: "testlead@email.com",
                    phone: "(555) 999-8888",
                    homeValue: 500000,
                    address: "789 Test Street",
                    city: "Test City",
                    state: "TX",
                    zipCode: "12345"
                  }
                  handleGHLWebhook(testData)
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                🔗 Test GHL Import
              </button>
              <button 
                onClick={testPersistence}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                🧪 Test Persistence
              </button>
              <button 
                onClick={() => setShowAddClient(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3"
              >
                <Plus className="w-6 h-6" />
                Add New Client
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <select
                className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="New Lead">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Application Submitted">Application Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Closed">Closed</option>
                <option value="GHL Import">GHL Import</option>
              </select>
            </div>
          </div>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const age = getYoungestAge(client)
            const upb = calculateUPB(client.home_value || 0, age, client.program_type || 'HECM')
            
            return (
              <div key={client.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="p-6">
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
                      client.pipeline_status === 'GHL Import' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {client.pipeline_status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                    {client.street_address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <HomeIcon className="w-4 h-4" />
                        <a 
                          href={`https://www.zillow.com/homes/${encodeURIComponent(client.street_address + ' ' + client.city + ' ' + client.state)}_rb/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {client.street_address}, {client.city}, {client.state}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Home Value</div>
                      <div className="font-bold text-gray-900">{formatCurrency(client.home_value || 0)}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-600 mb-1 flex items-center gap-1">
                        <Calculator className="w-3 h-3" />
                        Calculated UPB
                      </div>
                      <div className="font-bold text-blue-900">{formatCurrency(upb)}</div>
                    </div>
                  </div>

                  {client.program_type && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-purple-600 mb-1">Program</div>
                      <div className="font-semibold text-purple-900">{client.program_type}</div>
                      {client.interest_rate && (
                        <div className="text-xs text-purple-700 mt-1">{client.interest_rate}% Interest Rate</div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => setShowProgramComparison(client)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Calculator className="w-4 h-4 mr-1" />
                      Compare
                    </button>
                    <button
                      onClick={() => setEditingClient(client)}
                      className="flex items-center justify-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(client.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
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
            <div className="text-gray-400 text-lg mb-2">No clients found</div>
            <div className="text-gray-500">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Add New Client</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      required
                      value={newClient.first_name || ''}
                      onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={newClient.last_name || ''}
                      onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newClient.email || ''}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone || ''}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={newClient.date_of_birth || ''}
                    onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loan Officer</label>
                  <select
                    value={newClient.loan_officer || ''}
                    onChange={(e) => setNewClient({...newClient, loan_officer: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Loan Officer</option>
                    <option value="Christian">Christian</option>
                    <option value="Ahmed">Ahmed</option>
                    <option value="Sarah">Sarah</option>
                    <option value="Michael">Michael</option>
                  </select>
                </div>
              </div>

              {/* Property & Program Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={newClient.street_address || ''}
                    onChange={(e) => setNewClient({...newClient, street_address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={newClient.city || ''}
                      onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={newClient.state || ''}
                      onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={newClient.zip_code || ''}
                      onChange={(e) => setNewClient({...newClient, zip_code: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <select
                      value={newClient.property_type || ''}
                      onChange={(e) => setNewClient({...newClient, property_type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Single Family">Single Family</option>
                      <option value="Condominium">Condominium</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Manufactured">Manufactured</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                    <input
                      type="number"
                      value={newClient.home_value || ''}
                      onChange={(e) => setNewClient({...newClient, home_value: Number(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desired Proceeds</label>
                    <input
                      type="number"
                      value={newClient.desired_proceeds || ''}
                      onChange={(e) => setNewClient({...newClient, desired_proceeds: Number(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                  <select
                    value={newClient.program_type || ''}
                    onChange={(e) => setNewClient({...newClient, program_type: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HECM">HECM (Government Program)</option>
                    <option value="Equity Plus">Equity Plus (Standard Proprietary)</option>
                    <option value="Equity Plus Peak">Equity Plus Peak (Enhanced Proprietary)</option>
                    <option value="Equity Plus LOC">Equity Plus LOC (Line of Credit)</option>
                  </select>
                </div>

                {newClient.program_type === 'HECM' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newClient.interest_rate || ''}
                      onChange={(e) => setNewClient({...newClient, interest_rate: Number(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Initial Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Initial Notes</label>
              <textarea
                value={newClient.notes || ''}
                onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any initial notes about this client..."
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowAddClient(false)}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Comparison Modal */}
      {showProgramComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Program Comparison for {showProgramComparison.first_name} {showProgramComparison.last_name}</h2>
              <button
                onClick={() => setShowProgramComparison(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Client Age:</strong> {getYoungestAge(showProgramComparison)} • 
                <strong> Home Value:</strong> {formatCurrency(showProgramComparison.home_value || 0)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {calculateProgramComparison(showProgramComparison).map((program, index) => (
                <div 
                  key={program.name} 
                  className={`border-2 rounded-xl p-6 relative ${
                    index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  {index === 0 && (
                    <div className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      🏆 BEST OPTION
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2">{program.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="text-sm text-gray-600">PLF Rate</div>
                      <div className="text-lg font-bold">{(program.plf * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Maximum UPB</div>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(program.upb)}</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="text-sm font-semibold text-gray-700">Key Features:</div>
                    {program.features.map((feature, idx) => (
                      <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => selectProgram(showProgramComparison, program.name)}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      index === 0 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    Select This Program
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Recommendation Summary</h4>
              <p className="text-blue-800">
                Based on the analysis, <strong>{calculateProgramComparison(showProgramComparison)[0].name}</strong> offers 
                the highest UPB of <strong>{formatCurrency(calculateProgramComparison(showProgramComparison)[0].upb)}</strong> 
                for this client's situation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{selectedClient.first_name} {selectedClient.last_name}</h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-semibold">{selectedClient.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-semibold">{selectedClient.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Age</div>
                  <div className="font-semibold">{getYoungestAge(selectedClient)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Program</div>
                  <div className="font-semibold">{selectedClient.program_type}</div>
                </div>
              </div>

              {selectedClient.street_address && (
                <div>
                  <div className="text-sm text-gray-600">Address</div>
                  <div className="font-semibold">
                    {selectedClient.street_address}, {selectedClient.city}, {selectedClient.state} {selectedClient.zip_code}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Home Value</div>
                  <div className="font-semibold">{formatCurrency(selectedClient.home_value || 0)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Calculated UPB</div>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(calculateUPB(selectedClient.home_value || 0, getYoungestAge(selectedClient), selectedClient.program_type))}
                  </div>
                </div>
              </div>

              {selectedClient.notes && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Notes</div>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{selectedClient.notes}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-600 mb-2">Add Note</div>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a note..."
                />
                <button
                  onClick={() => addNote(selectedClient.id)}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Client</h2>
              <button
                onClick={() => setEditingClient(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editingClient.first_name}
                    onChange={(e) => setEditingClient({...editingClient, first_name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editingClient.last_name}
                    onChange={(e) => setEditingClient({...editingClient, last_name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingClient.email}
                  onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editingClient.phone}
                  onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                  <input
                    type="number"
                    value={editingClient.home_value || ''}
                    onChange={(e) => setEditingClient({...editingClient, home_value: Number(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                  <select
                    value={editingClient.program_type || ''}
                    onChange={(e) => setEditingClient({...editingClient, program_type: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HECM">HECM</option>
                    <option value="Equity Plus">Equity Plus</option>
                    <option value="Equity Plus Peak">Equity Plus Peak</option>
                    <option value="Equity Plus LOC">Equity Plus LOC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                <select
                  value={editingClient.pipeline_status || ''}
                  onChange={(e) => setEditingClient({...editingClient, pipeline_status: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Application Submitted">Application Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setEditingClient(null)}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateClient(editingClient)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Save className="w-4 h-4 mr-2 inline" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this client? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteClient(showDeleteConfirm)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
