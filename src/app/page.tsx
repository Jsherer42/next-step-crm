'use client'

import { useState } from 'react'
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

export default function NextStepCRM() {
  // Simple state
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddClient, setShowAddClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Load clients from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nextStepClients')
        if (saved) {
          const parsedClients = JSON.parse(saved)
          setClients(parsedClients)
          console.log('✅ Loaded', parsedClients.length, 'clients from storage')
        }
      } catch (error) {
        console.error('Error loading clients:', error)
      }
    }
  }, [])

  // Save clients to localStorage whenever clients change
  useEffect(() => {
    if (typeof window !== 'undefined' && clients.length >= 0) {
      try {
        localStorage.setItem('nextStepClients', JSON.stringify(clients))
        console.log('💾 Saved', clients.length, 'clients to storage')
      } catch (error) {
        console.error('Error saving clients:', error)
      }
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
      const newClient: Client = {
        id: Date.now().toString(),
        first_name: webhookData.firstName || 'Test',
        last_name: webhookData.lastName || 'Lead',
        email: webhookData.email || 'testlead@email.com',
        phone: webhookData.phone || '(555) 999-8888',
        date_of_birth: webhookData.dateOfBirth || '1970-01-01',
        street_address: webhookData.address || '789 Test Street',
        city: webhookData.city || 'Test City',
        state: webhookData.state || 'TX',
        zip_code: webhookData.zipCode || '12345',
        home_value: webhookData.homeValue || 500000,
        desired_proceeds: webhookData.desiredProceeds || 200000,
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

      const updatedClients = [...clients, newClient]
      setClients(updatedClients)
      console.log('✅ New lead imported:', newClient.first_name, newClient.last_name)
      alert(`✅ New lead added and saved: ${newClient.first_name} ${newClient.last_name}`)
    } catch (error) {
      console.error('❌ Error processing GHL webhook:', error)
    }
  }

  // Remove demo clients function - not needed
  // JJ doesn't need demo clients, only real persistent clients

  // PLF calculation
  const calculateUPB = (homeValue: number, age: number, programType: string = 'HECM') => {
    let plf = 0.285
    
    if (programType === 'HECM') {
      plf = age >= 70 ? 0.338 : age >= 65 ? 0.305 : 0.285
    } else if (programType === 'Equity Plus') {
      plf = 0.338
    } else if (programType === 'Equity Plus Peak') {
      plf = 0.391
    } else if (programType === 'Equity Plus LOC') {
      plf = 0.338
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

  const totalPipeline = clients.reduce((sum, client) => {
    const age = getYoungestAge(client)
    const upb = calculateUPB(client.home_value || 0, age, client.program_type || 'HECM')
    return sum + upb
  }, 0)

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
      alert('Client added! (Session only - will disappear on refresh)')
    }
  }

  const deleteClient = (id: string) => {
    const updatedClients = clients.filter(client => client.id !== id)
    setClients(updatedClients)
    setShowDeleteConfirm(null)
    console.log('✅ Client deleted')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-500 to-teal-600">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 text-white p-8 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                  <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white drop-shadow-lg">Next Step CRM</h1>
                  <p className="text-blue-100 font-semibold">City First FHA Retirement</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-30">
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
                onClick={addDemoClients}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                👥 Add Demo Clients
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
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Pipeline */}
          <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total UPB Pipeline</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(totalPipeline)}</p>
              </div>
              <div className="bg-blue-500 bg-opacity-80 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Active Clients */}
          <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Active Clients</p>
                <p className="text-3xl font-bold text-white">{clients.length}</p>
              </div>
              <div className="bg-green-500 bg-opacity-80 rounded-full p-3">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* New Leads */}
          <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">New Leads</p>
                <p className="text-3xl font-bold text-white">{clients.filter(c => c.pipeline_status === 'New Lead' || c.pipeline_status === 'GHL Import').length}</p>
              </div>
              <div className="bg-teal-500 bg-opacity-80 rounded-full p-3">
                <Phone className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Qualified */}
          <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Qualified</p>
                <p className="text-3xl font-bold text-white">{clients.filter(c => c.pipeline_status === 'Application Submitted' || c.pipeline_status === 'Under Review').length}</p>
              </div>
              <div className="bg-blue-600 bg-opacity-80 rounded-full p-3">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white border-opacity-30">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/60" />
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-3.5 h-5 w-5 text-white/60" />
              <select
                className="pl-12 pr-8 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white backdrop-blur-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all" className="text-gray-900">All Status</option>
                <option value="New Lead" className="text-gray-900">New Lead</option>
                <option value="Contacted" className="text-gray-900">Contacted</option>
                <option value="Application Submitted" className="text-gray-900">Application Submitted</option>
                <option value="Under Review" className="text-gray-900">Under Review</option>
                <option value="Approved" className="text-gray-900">Approved</option>
                <option value="Closed" className="text-gray-900">Closed</option>
                <option value="GHL Import" className="text-gray-900">GHL Import</option>
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
              <div key={client.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
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
                      client.pipeline_status === 'Application Submitted' ? 'bg-blue-100 text-blue-800' :
                      client.pipeline_status === 'GHL Import' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {client.pipeline_status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                    {client.street_address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <HomeIcon className="w-4 h-4 text-indigo-500" />
                        <a 
                          href={`https://www.zillow.com/homes/${encodeURIComponent(client.street_address + ' ' + client.city + ' ' + client.state)}_rb/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {client.street_address}, {client.city}, {client.state}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1 font-medium">Home Value</div>
                      <div className="font-bold text-gray-900 text-lg">{formatCurrency(client.home_value || 0)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200">
                      <div className="text-xs text-blue-600 mb-1 flex items-center gap-1 font-medium">
                        <Calculator className="w-3 h-3" />
                        Calculated UPB
                      </div>
                      <div className="font-bold text-blue-900 text-lg">{formatCurrency(upb)}</div>
                    </div>
                  </div>

                  {client.program_type && (
                    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-purple-200">
                      <div className="text-xs text-purple-600 mb-1 font-medium">Program</div>
                      <div className="font-semibold text-purple-900 text-sm">{client.program_type}</div>
                      {client.interest_rate && (
                        <div className="text-xs text-purple-700 mt-1">{client.interest_rate}% Interest Rate</div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(client.id)}
                      className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
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
            <div className="text-white text-lg mb-2">No clients found</div>
            <div className="text-white/80 mb-4">Click "Add Demo Clients" or "Test GHL Import" to get started!</div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={addDemoClients}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
              >
                👥 Add Demo Clients
              </button>
              <button 
                onClick={() => {
                  const testData = {
                    disposition: "Next Step CRM",
                    firstName: "Test",
                    lastName: "Lead",
                    email: "testlead@email.com",
                    phone: "(555) 999-8888",
                    homeValue: 500000
                  }
                  handleGHLWebhook(testData)
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
              >
                🔗 Test GHL Import
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Add New Client</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

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
              </div>
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
