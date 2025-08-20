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
  property_type?: string
  home_value: number
  desired_proceeds: number
  program_type?: string
  interest_rate?: number
  loan_officer: string
  pipeline_status: string
  lead_source?: string
  notes?: string
}

export default function NextStepCRM() {
  // Enhanced PLF calculation with all programs
  const calculateProgramComparison = (client: Client) => {
    const age = getYoungestAge(client)
    const homeValue = client.home_value
    
    const programs = [
      {
        name: 'HECM',
        description: 'Government Program',
        plf: age >= 70 ? 0.338 : age >= 65 ? 0.313 : 0.285,
        interestRate: 3.5,
        upb: 0,
        features: ['Government backed', 'Mortgage insurance', 'Lower PLF but stable']
      },
      {
        name: 'Equity Plus',
        description: 'Standard Proprietary',
        plf: age >= 70 ? 0.396 : age >= 65 ? 0.372 : 0.338,
        interestRate: 0,
        upb: 0,
        features: ['Higher loan amounts', 'No mortgage insurance', 'Proprietary product']
      },
      {
        name: 'Equity Plus Peak',
        description: 'Enhanced Proprietary',
        plf: age >= 70 ? 0.447 : age >= 65 ? 0.423 : 0.391,
        interestRate: 0,
        upb: 0,
        features: ['Highest loan amounts', 'Premium product', 'Best for high-value homes']
      },
      {
        name: 'Equity Plus LOC',
        description: 'Line of Credit',
        plf: age >= 70 ? 0.396 : age >= 65 ? 0.372 : 0.338,
        interestRate: 0,
        upb: 0,
        features: ['Flexible access', 'Growth potential', 'Line of credit structure']
      }
    ]
    
    // Calculate UPB for each program
    programs.forEach(program => {
      program.upb = homeValue * program.plf
    })
    
    // Find the best option (highest UPB)
    const bestProgram = programs.reduce((best, current) => 
      current.upb > best.upb ? current : best
    )
    
    return { programs, bestProgram, age, homeValue }
  }

  // Simple PLF calculation for individual use
  const calculateUPB = (homeValue: number, age: number, programType: string = 'HECM') => {
    let plf = 0.285 // Default HECM at age 62
    
    if (programType === 'HECM') {
      plf = age >= 70 ? 0.338 : age >= 65 ? 0.313 : 0.285
    } else if (programType === 'Equity Plus Peak') {
      plf = age >= 70 ? 0.447 : age >= 65 ? 0.423 : 0.391
    } else if (programType === 'Equity Plus') {
      plf = age >= 70 ? 0.396 : age >= 65 ? 0.372 : 0.338
    } else if (programType === 'Equity Plus LOC') {
      plf = age >= 70 ? 0.396 : age >= 65 ? 0.372 : 0.338
    }
    
    return homeValue * plf
  }
  const getYoungestAge = (client: Client) => {
    const clientAge = calculateAge(client.date_of_birth)
    const spouseAge = client.spouse_date_of_birth ? calculateAge(client.spouse_date_of_birth) : null
    return spouseAge ? Math.min(clientAge, spouseAge) : clientAge
  }

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      first_name: 'Robert',
      last_name: 'Johnson',
      email: 'robert.johnson@email.com',
      phone: '(555) 123-4567',
      date_of_birth: '1962-05-15',
      spouse_name: 'Linda Johnson',
      spouse_date_of_birth: '1963-07-22',
      spouse_is_nbs: true,
      street_address: '123 Main Street',
      city: 'Rosedale',
      state: 'MD',
      zip_code: '21237',
      property_type: 'single_family',
      home_value: 450000,
      desired_proceeds: 200000,
      program_type: 'HECM',
      interest_rate: 3.5,
      loan_officer: 'Christian Ford',
      pipeline_status: 'qualified',
      lead_source: 'referral',
      notes: 'Interested in line of credit option. Has questions about inheritance protection.'
    },
    {
      id: '2',
      first_name: 'Margaret',
      last_name: 'Williams',
      email: 'margaret.williams@email.com',
      phone: '(555) 987-6543',
      date_of_birth: '1958-11-08',
      street_address: '892 Oak Avenue',
      city: 'Baltimore',
      state: 'MD',
      zip_code: '21201',
      property_type: 'condo',
      home_value: 620000,
      desired_proceeds: 150000,
      program_type: 'Equity Plus Peak',
      interest_rate: 0,
      loan_officer: 'Ahmed Samura',
      pipeline_status: 'new_lead',
      lead_source: 'website',
      notes: 'Recently widowed, looking for additional income. Very interested in preserving equity for children.'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showAddClient, setShowAddClient] = useState(false)
  const [showAddSpouse, setShowAddSpouse] = useState<string | null>(null)
  const [showProgramComparison, setShowProgramComparison] = useState<Client | null>(null)
  const [spouseForm, setSpouseForm] = useState({
    spouse_name: '',
    spouse_date_of_birth: '',
    spouse_is_nbs: false
  })

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
    property_type: 'single_family',
    home_value: 0,
    desired_proceeds: 0,
    program_type: 'HECM',
    interest_rate: 3.5,
    loan_officer: '',
    pipeline_status: 'new_lead',
    lead_source: '',
    notes: ''
  })

  // Utility functions
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new_lead: 'bg-orange-500/80 text-white',
      qualified: 'bg-green-500/80 text-white',
      counseling: 'bg-blue-500/80 text-white',
      application: 'bg-purple-500/80 text-white',
      processing: 'bg-yellow-500/80 text-black',
      closed: 'bg-gray-500/80 text-white'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500/80 text-white'
  }

  const getZillowUrl = (address: string, city: string, state: string, zip: string) => {
    const fullAddress = `${address}, ${city}, ${state} ${zip}`
    const encodedAddress = encodeURIComponent(fullAddress)
    return `https://www.zillow.com/homes/${encodedAddress}_rb/`
  }

  // Calculate REAL pipeline using UPB instead of desired proceeds
  const totalPipeline = clients.reduce((sum, client) => {
    const age = getYoungestAge(client)
    const upb = calculateUPB(client.home_value, age, client.program_type || 'HECM')
    return sum + upb
  }, 0)

  // Filtered clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || client.pipeline_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Event handlers
  const handleAddClient = () => {
    const clientWithId = {
      ...newClient,
      id: Date.now().toString()
    }
    setClients([...clients, clientWithId])
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
      property_type: 'single_family',
      home_value: 0,
      desired_proceeds: 0,
      program_type: 'HECM',
      interest_rate: 3.5,
      loan_officer: '',
      pipeline_status: 'new_lead',
      lead_source: '',
      notes: ''
    })
    setShowAddClient(false)
  }

  const handleDeleteClient = (id: string) => {
    if (showDeleteConfirm === id) {
      setClients(clients.filter(client => client.id !== id))
      setShowDeleteConfirm(null)
    } else {
      setShowDeleteConfirm(id)
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient({...client})
  }

  const handleSaveEdit = () => {
    if (editingClient) {
      setClients(clients.map(client => 
        client.id === editingClient.id ? editingClient : client
      ))
      setEditingClient(null)
    }
  }

  const handleAddSpouse = () => {
    if (!spouseForm.spouse_name.trim() || !showAddSpouse) return

    const updatedClients = clients.map(client => {
      if (client.id === showAddSpouse) {
        return {
          ...client,
          spouse_name: spouseForm.spouse_name,
          spouse_date_of_birth: spouseForm.spouse_date_of_birth,
          spouse_is_nbs: spouseForm.spouse_is_nbs
        }
      }
      return client
    })

    setClients(updatedClients)
    setSpouseForm({
      spouse_name: '',
      spouse_date_of_birth: '',
      spouse_is_nbs: false
    })
    setShowAddSpouse(null)
  }

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedClient) return

    const updatedClients = clients.map(client => {
      if (client.id === selectedClient.id) {
        const existingNotes = client.notes || ''
        const timestamp = new Date().toLocaleString()
        const noteWithTimestamp = `[${timestamp}] ${newNote}`
        
        return {
          ...client,
          notes: existingNotes 
            ? `${existingNotes}\n\n${noteWithTimestamp}`
            : noteWithTimestamp
        }
      }
      return client
    })

    setClients(updatedClients)
    setSelectedClient(updatedClients.find(c => c.id === selectedClient.id) || null)
    setNewNote('')
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 20%, #059669 40%, #10b981 60%, #0ea5e9 80%, #1d4ed8 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite'
    }}>
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-400/10 rounded-full" style={{animation: 'float 6s ease-in-out infinite'}}></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-blue-400/10 rounded-full" style={{animation: 'float 8s ease-in-out infinite delay-2s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-white/5 rounded-full animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md shadow-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300" style={{animation: 'pulse 3s ease-in-out infinite'}}>
                  <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    Next Step
                  </h1>
                  <p className="text-blue-100 font-semibold text-lg">City First FHA Retirement CRM</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setShowAddClient(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/25 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1"
                style={{animation: 'pulse 2s ease-in-out infinite'}}
              >
                <Plus className="w-6 h-6 mr-3" />
                Add New Client
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-6 h-6" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl focus:ring-4 focus:ring-green-400/50 focus:border-white/50 shadow-xl text-white placeholder-white/70 text-lg font-medium hover:bg-white/25 transition-all duration-300"
            />
          </div>

          <div className="flex items-center bg-white/20 backdrop-blur-md px-6 py-4 rounded-xl border border-white/30 shadow-xl">
            <Filter className="w-5 h-5 mr-3 text-white/80" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-white font-semibold text-lg"
            >
              <option value="all" className="text-gray-800">All Status</option>
              <option value="new_lead" className="text-gray-800">New Lead</option>
              <option value="qualified" className="text-gray-800">Qualified</option>
              <option value="counseling" className="text-gray-800">Counseling</option>
              <option value="application" className="text-gray-800">Application</option>
              <option value="processing" className="text-gray-800">Processing</option>
              <option value="closed" className="text-gray-800">Closed</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="bg-white/15 backdrop-blur-md p-8 rounded-2xl shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:-translate-y-3 border border-white/20 hover:border-green-400/50 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-5 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-2xl" style={{animation: 'pulse 2s ease-in-out infinite'}}>
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-lg font-bold text-white/90 mb-1">Total UPB Pipeline</p>
                <p className="text-4xl font-black text-white drop-shadow-lg">
                  {formatCurrency(totalPipeline)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/15 backdrop-blur-md p-8 rounded-2xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-3 border border-white/20 hover:border-blue-400/50 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-2xl" style={{animation: 'pulse 2.5s ease-in-out infinite'}}>
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-lg font-bold text-white/90 mb-1">Active Clients</p>
                <p className="text-4xl font-black text-white drop-shadow-lg">{filteredClients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md p-8 rounded-2xl shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3 border border-white/20 hover:border-orange-400/50 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-2xl" style={{animation: 'pulse 3s ease-in-out infinite'}}>
                <Phone className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-lg font-bold text-white/90 mb-1">New Leads</p>
                <p className="text-4xl font-black text-white drop-shadow-lg">
                  {clients.filter(c => c.pipeline_status === 'new_lead').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md p-8 rounded-2xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-3 border border-white/20 hover:border-emerald-400/50 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-5 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-2xl" style={{animation: 'pulse 3.5s ease-in-out infinite'}}>
                <HomeIcon className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-lg font-bold text-white/90 mb-1">Qualified</p>
                <p className="text-4xl font-black text-white drop-shadow-lg">
                  {clients.filter(c => c.pipeline_status === 'qualified').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map(client => {
            const age = calculateAge(client.date_of_birth)
            const spouseAge = client.spouse_date_of_birth ? calculateAge(client.spouse_date_of_birth) : null
            
            return (
              <div key={client.id} className="bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl hover:shadow-white/10 hover:-translate-y-4 transition-all duration-500 ease-in-out border-l-4 border-green-400 hover:border-green-300 p-8 hover:bg-white/25 border border-white/30 transform hover:scale-105 hover:rotate-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white drop-shadow-lg hover:text-green-200 transition-all duration-300">
                      {client.first_name} {client.last_name}
                    </h3>
                    <p className="text-white/80 font-semibold text-lg">Age {age}</p>
                  </div>
                  <span className={`px-5 py-3 rounded-xl text-sm font-bold ${getStatusColor(client.pipeline_status)} shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/30 transform hover:scale-110`}>
                    {client.pipeline_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-white/90">
                      <Phone className="w-5 h-5 mr-3 text-green-300" />
                      <span className="font-medium">{client.phone}</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <Mail className="w-5 h-5 mr-3 text-blue-300" />
                      <span className="font-medium">{client.email || 'No email'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-white/90">
                      <DollarSign className="w-5 h-5 mr-3 text-green-300" />
                      <span className="font-medium">Home: {formatCurrency(client.home_value)}</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <Calculator className="w-5 h-5 mr-3 text-emerald-300" />
                      <span className="font-medium">UPB: {formatCurrency(calculateUPB(client.home_value, getYoungestAge(client), client.program_type || 'HECM'))}</span>
                    </div>
                  </div>
                </div>

                {client.street_address && (
                  <div className="mb-4 p-3 bg-emerald-500/20 backdrop-blur-sm rounded-lg border border-emerald-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-emerald-100 font-semibold text-sm">{client.street_address}</div>
                        <div className="flex items-center">
                          <HomeIcon className="w-4 h-4 mr-1" />
                          <span>
                            {client.city || 'No city'}, {client.state || 'No state'}
                          </span>
                        </div>
                      </div>
                      <a
                        href={getZillowUrl(
                          client.street_address || '',
                          client.city || '',
                          client.state || '',
                          client.zip_code || ''
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        🏠 Zillow
                      </a>
                    </div>
                  </div>
                )}

                {client.spouse_name && (
                  <div className="mb-4 p-3 bg-purple-500/20 backdrop-blur-sm rounded-lg border border-purple-400/30">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-100 font-medium">
                        Spouse: {client.spouse_name}
                        {spouseAge && `, Age: ${spouseAge}`}
                      </span>
                      {client.spouse_is_nbs && (
                        <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                          NBS
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!client.spouse_name && (
                  <button
                    onClick={() => setShowAddSpouse(client.id)}
                    className="w-full mb-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg p-3 text-purple-100 font-medium transition-all duration-200"
                  >
                    Add Spouse
                  </button>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-white/20">
                  <div className="text-white/80 font-medium">
                    <div>LO: <span className="text-green-200 font-bold">{client.loan_officer || 'Unassigned'}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => setShowProgramComparison(client)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <Calculator className="w-4 h-4 mr-1" />
                      Compare
                    </button>
                    <button
                      onClick={() => handleEditClient(client)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        showDeleteConfirm === client.id 
                          ? 'bg-red-600 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {showDeleteConfirm === client.id ? 'Confirm' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No clients found</div>
            <p className="text-gray-500 mt-2">Add your first client to get started!</p>
          </div>
        )}
      </div>

      {/* Program Comparison Modal */}
      {showProgramComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Program Comparison - {showProgramComparison.first_name} {showProgramComparison.last_name}
                </h2>
                <p className="text-gray-600">Age: {getYoungestAge(showProgramComparison)} | Home Value: {formatCurrency(showProgramComparison.home_value)}</p>
              </div>
              <button
                onClick={() => setShowProgramComparison(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {calculateProgramComparison(showProgramComparison).programs.map((program, index) => {
                const isBest = program.name === calculateProgramComparison(showProgramComparison).bestProgram.name
                return (
                  <div 
                    key={program.name}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      isBest 
                        ? 'border-green-500 bg-green-50 shadow-lg transform scale-105' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {isBest && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-4 text-center">
                        🏆 BEST OPTION
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{program.name}</h3>
                      <p className="text-gray-600 text-sm">{program.description}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Principal Limit Factor</div>
                        <div className="text-2xl font-bold text-blue-600">{(program.plf * 100).toFixed(1)}%</div>
                      </div>

                      <div className="text-center p-4 bg-emerald-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Calculated UPB</div>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(program.upb)}</div>
                      </div>

                      {program.interestRate > 0 && (
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Interest Rate</div>
                          <div className="text-lg font-semibold text-blue-600">{program.interestRate}%</div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Key Features:</div>
                        {program.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            {feature}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          const updatedClient = {
                            ...showProgramComparison,
                            program_type: program.name,
                            interest_rate: program.name === 'HECM' ? 3.5 : 0
                          }
                          setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c))
                          setShowProgramComparison(null)
                        }}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                          isBest 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {program.name === showProgramComparison.program_type ? 'Current Selection' : 'Select This Program'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">💡 Recommendation Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Best Option:</span> 
                  <span className="text-green-600 font-bold ml-1">
                    {calculateProgramComparison(showProgramComparison).bestProgram.name}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Max UPB:</span> 
                  <span className="text-emerald-600 font-bold ml-1">
                    {formatCurrency(calculateProgramComparison(showProgramComparison).bestProgram.upb)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Client Age:</span> 
                  <span className="text-blue-600 font-bold ml-1">
                    {getYoungestAge(showProgramComparison)} years
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedClient.first_name} {selectedClient.last_name}
              </h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-emerald-600" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div><span className="font-medium">Age:</span> {calculateAge(selectedClient.date_of_birth)}</div>
                    <div><span className="font-medium">Phone:</span> {selectedClient.phone}</div>
                    <div><span className="font-medium">Email:</span> {selectedClient.email}</div>
                    <div><span className="font-medium">Status:</span> {selectedClient.pipeline_status}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HomeIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    Property Information
                  </h4>
                  <div className="space-y-3">
                    <div><span className="font-medium">Home Value:</span> {formatCurrency(selectedClient.home_value)}</div>
                    <div><span className="font-medium">Program Type:</span> {selectedClient.program_type || 'HECM'}</div>
                    <div><span className="font-medium">Calculated UPB:</span> {formatCurrency(calculateUPB(selectedClient.home_value, getYoungestAge(selectedClient), selectedClient.program_type || 'HECM'))}</div>
                    <div><span className="font-medium">Address:</span> {selectedClient.street_address || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {selectedClient.spouse_name && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Spouse Information</h4>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div><span className="font-medium">Name:</span> {selectedClient.spouse_name}</div>
                    {selectedClient.spouse_date_of_birth && (
                      <div><span className="font-medium">Age:</span> {calculateAge(selectedClient.spouse_date_of_birth)}</div>
                    )}
                    {selectedClient.spouse_is_nbs && (
                      <div><span className="font-medium">Status:</span> <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm">Non-Borrowing Spouse</span></div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Sales Notes</h4>
                <div className="space-y-4">
                  {selectedClient.notes ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">{selectedClient.notes}</pre>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No notes yet.</p>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a new note..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Spouse Modal */}
      {showAddSpouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Add Spouse</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spouse Name *
                </label>
                <input
                  type="text"
                  required
                  value={spouseForm.spouse_name}
                  onChange={(e) => setSpouseForm({...spouseForm, spouse_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={spouseForm.spouse_date_of_birth}
                  onChange={(e) => setSpouseForm({...spouseForm, spouse_date_of_birth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="spouse_is_nbs"
                  checked={spouseForm.spouse_is_nbs}
                  onChange={(e) => setSpouseForm({...spouseForm, spouse_is_nbs: e.target.checked})}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="spouse_is_nbs" className="ml-2 block text-sm text-gray-700">
                  Non-Borrowing Spouse (NBS)
                </label>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddSpouse(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSpouse}
                  disabled={!spouseForm.spouse_name.trim()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Spouse
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
              <h2 className="text-2xl font-bold text-gray-800">Edit Client</h2>
              <button
                onClick={() => setEditingClient(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={editingClient.first_name}
                  onChange={(e) => setEditingClient({...editingClient, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editingClient.last_name}
                  onChange={(e) => setEditingClient({...editingClient, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                <input
                  type="number"
                  value={editingClient.home_value}
                  onChange={(e) => setEditingClient({...editingClient, home_value: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                <select
                  value={editingClient.program_type || 'HECM'}
                  onChange={(e) => setEditingClient({...editingClient, program_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="HECM">HECM</option>
                  <option value="Equity Plus">Equity Plus</option>
                  <option value="Equity Plus Peak">Equity Plus Peak</option>
                  <option value="Equity Plus LOC">Equity Plus LOC</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingClient(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Client</h2>
              <button
                onClick={() => setShowAddClient(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-emerald-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      required
                      value={newClient.first_name}
                      onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={newClient.last_name}
                      onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={newClient.date_of_birth || ''}
                      onChange={(e) => {
                        console.log('Date changed:', e.target.value)
                        setNewClient({...newClient, date_of_birth: e.target.value})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loan Officer</label>
                    <select
                      value={newClient.loan_officer}
                      onChange={(e) => setNewClient({...newClient, loan_officer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Loan Officer</option>
                      <option value="Christian Ford">Christian Ford</option>
                      <option value="Ahmed Samura">Ahmed Samura</option>
                      <option value="Jennifer Martinez">Jennifer Martinez</option>
                      <option value="David Chen">David Chen</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <HomeIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Property Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={newClient.street_address || ''}
                      onChange={(e) => {
                        console.log('Address changed:', e.target.value)
                        setNewClient({...newClient, street_address: e.target.value})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={newClient.city || ''}
                      onChange={(e) => {
                        console.log('City changed:', e.target.value)
                        setNewClient({...newClient, city: e.target.value})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={newClient.state || ''}
                      onChange={(e) => {
                        console.log('State changed:', e.target.value)
                        setNewClient({...newClient, state: e.target.value})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="MD"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={newClient.zip_code}
                      onChange={(e) => setNewClient({...newClient, zip_code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <select
                      value={newClient.property_type}
                      onChange={(e) => setNewClient({...newClient, property_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="single_family">Single Family</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="manufactured">Manufactured</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home Value *</label>
                    <input
                      type="number"
                      required
                      value={newClient.home_value || ''}
                      onChange={(e) => setNewClient({...newClient, home_value: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="450000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desired Proceeds</label>
                    <input
                      type="number"
                      value={newClient.desired_proceeds || ''}
                      onChange={(e) => setNewClient({...newClient, desired_proceeds: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="200000"
                    />
                  </div>
                </div>
              </div>

              {/* Program Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-emerald-600" />
                  Program Selection
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program Type *</label>
                    <select
                      value={newClient.program_type || 'HECM'}
                      onChange={(e) => setNewClient({...newClient, program_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="HECM">HECM (Government Program)</option>
                      <option value="Equity Plus">Equity Plus (Standard Proprietary)</option>
                      <option value="Equity Plus Peak">Equity Plus Peak (Enhanced Proprietary)</option>
                      <option value="Equity Plus LOC">Equity Plus LOC (Line of Credit)</option>
                    </select>
                  </div>

                  {newClient.program_type === 'HECM' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newClient.interest_rate || 3.5}
                        onChange={(e) => setNewClient({...newClient, interest_rate: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="3.5"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                    <select
                      value={newClient.pipeline_status}
                      onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="new_lead">New Lead</option>
                      <option value="qualified">Qualified</option>
                      <option value="counseling">Counseling</option>
                      <option value="application">Application</option>
                      <option value="processing">Processing</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
                    <select
                      value={newClient.lead_source}
                      onChange={(e) => setNewClient({...newClient, lead_source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Lead Source</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="cold_call">Cold Call</option>
                      <option value="social_media">Social Media</option>
                      <option value="direct_mail">Direct Mail</option>
                      <option value="seminar">Seminar</option>
                      <option value="walk_in">Walk In</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Initial Notes</h3>
                <textarea
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter any initial notes about the client, their situation, or preferences..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setShowAddClient(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                disabled={!newClient.first_name || !newClient.last_name || !newClient.phone || !newClient.date_of_birth || !newClient.home_value}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
