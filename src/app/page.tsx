'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calendar, Filter, Edit2, Eye, X, Save, Calculator, User } from 'lucide-react'

// Client interface with address fields and notes
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
  loan_officer: string
  pipeline_status: 'lead' | 'qualified' | 'counseling' | 'processing' | 'closed'
  created_at: string
  notes?: string[]
}

export default function NextStepCRM() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddClient, setShowAddClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editForm, setEditForm] = useState<Partial<Client>>({})
  const [showAddSpouse, setShowAddSpouse] = useState<string | null>(null)
  const [spouseForm, setSpouseForm] = useState({
    spouse_name: '',
    spouse_date_of_birth: '',
    spouse_is_nbs: false
  })

  const [newClient, setNewClient] = useState({
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
    loan_officer: '',
    pipeline_status: 'lead' as const
  })

  // Initialize with demo data including addresses and notes
  useEffect(() => {
    setClients([
      {
        id: '1',
        first_name: 'Robert',
        last_name: 'Johnson',
        email: 'robert.johnson@email.com',
        phone: '(555) 123-4567',
        date_of_birth: '1961-03-15',
        spouse_name: 'Linda Johnson',
        spouse_date_of_birth: '1963-07-22',
        spouse_is_nbs: false,
        street_address: '1247 Maple Street',
        city: 'Arlington',
        state: 'VA',
        zip_code: '22201',
        property_type: 'single_family',
        home_value: 450000,
        desired_proceeds: 200000,
        loan_officer: 'Christian Ford',
        pipeline_status: 'qualified' as const,
        created_at: '2024-01-15T10:30:00Z',
        notes: ['Initial consultation completed - client interested in reverse mortgage for debt consolidation', 'Appraisal scheduled for next week']
      },
      {
        id: '2',
        first_name: 'Margaret',
        last_name: 'Williams',
        email: 'margaret.williams@email.com',
        phone: '(555) 987-6543',
        date_of_birth: '1958-11-08',
        street_address: '892 Oak Avenue',
        city: 'Bethesda',
        state: 'MD',
        zip_code: '20814',
        property_type: 'condo',
        home_value: 620000,
        desired_proceeds: 150000,
        loan_officer: 'Ahmed Samura',
        pipeline_status: 'counseling' as const,
        created_at: '2024-01-18T14:15:00Z',
        notes: ['Referred by financial advisor', 'Interested in reverse mortgage options']
      }
    ])
  }, [])

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
    setShowAddSpouse(null)
    setSpouseForm({ spouse_name: '', spouse_date_of_birth: '', spouse_is_nbs: false })
    alert('Spouse added successfully!')
  }
    if (!newNote.trim() || !selectedClient) return
    
    const updatedClients = clients.map(client => {
      if (client.id === selectedClient.id) {
        const updatedClient = {
          ...client,
          notes: [...(client.notes || []), `${new Date().toLocaleDateString()}: ${newNote.trim()}`]
        }
        setSelectedClient(updatedClient)
        return updatedClient
      }
      return client
    })
    
    setClients(updatedClients)
    setNewNote('')
  }

  const handleAddNote = () => {
    setEditingClient(client)
    setEditForm({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
      date_of_birth: client.date_of_birth,
      spouse_name: client.spouse_name || '',
      spouse_date_of_birth: client.spouse_date_of_birth || '',
      street_address: client.street_address || '',
      city: client.city || '',
      state: client.state || '',
      zip_code: client.zip_code || '',
      property_type: client.property_type || 'single_family',
      home_value: client.home_value,
      desired_proceeds: client.desired_proceeds,
      loan_officer: client.loan_officer,
      pipeline_status: client.pipeline_status
    })
  }

  const handleSaveEdit = () => {
    if (!editingClient) return

    const updatedClients = clients.map(client => {
      if (client.id === editingClient.id) {
        return {
          ...client,
          ...editForm
        }
      }
      return client
    })

    setClients(updatedClients)
    setEditingClient(null)
    setEditForm({})
    alert('Client updated successfully!')
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(client => client.id !== clientId))
    setShowDeleteConfirm(null)
    alert('Client deleted successfully!')
  }

  const teamMembers = [
    'Christian Ford',
    'Ahmed Samura', 
    'Joe Catanzaro',
    'Josh Bovee',
    'Danielle Stepp',
    'Ryan Sterling',
    'Spencer Kline'
  ]

  const handleAddClient = () => {
    if (newClient.first_name && newClient.last_name && newClient.email && newClient.phone) {
      const clientToAdd: Client = {
        id: Date.now().toString(),
        ...newClient,
        created_at: new Date().toISOString(),
        notes: []
      }

      setClients([...clients, clientToAdd])
      setNewClient({
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
        loan_officer: '',
        pipeline_status: 'lead' as const
      })
      setShowAddClient(false)
      alert('Client added successfully!')
    } else {
      alert('Please fill in all required fields')
    }
  }

  // Utility function to create Zillow URL
  const getZillowUrl = (address: string, city: string, state: string, zip: string) => {
    const fullAddress = `${address}, ${city}, ${state} ${zip}`
    const encodedAddress = encodeURIComponent(fullAddress)
    return `https://www.zillow.com/homes/${encodedAddress}_rb/`
  }

  // Utility functions
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
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
    switch (status) {
      case 'lead': return 'bg-gray-100 text-gray-800'
      case 'qualified': return 'bg-blue-100 text-blue-800'
      case 'counseling': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-orange-100 text-orange-800'
      case 'closed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm)
    const matchesFilter = filterStatus === 'all' || client.pipeline_status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalPipeline = clients.reduce((sum, client) => sum + client.desired_proceeds, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-emerald-400 to-blue-500 animate-gradient relative overflow-hidden">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white bg-opacity-10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white bg-opacity-10 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Next Step CRM</h1>
          <p className="text-blue-100">City First FHA Retirement - Reverse Mortgage Pipeline</p>
        </div>

        {/* Stats Card */}
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white border-opacity-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{clients.length}</div>
              <div className="text-blue-100">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(totalPipeline)}</div>
              <div className="text-blue-100">Total Pipeline</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{clients.filter(c => c.pipeline_status === 'processing').length}</div>
              <div className="text-blue-100">In Processing</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white border-opacity-20">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-50 rounded-xl border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="pl-10 pr-8 py-3 bg-white bg-opacity-50 rounded-xl border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent appearance-none min-w-[200px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="counseling">Counseling</option>
                <option value="processing">Processing</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddClient(true)}
              className="flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Client
            </button>
          </div>
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-30 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                    {client.first_name} {client.last_name}
                  </h3>
                  <div className="text-sm text-gray-600 mt-2">
                    <div className="flex items-center">
                      <Home className="w-4 h-4 mr-1" />
                      <span>
                        {client.city || 'No city'}, {client.state || 'No state'}
                      </span>
                      {client.street_address && client.city && client.state && client.zip_code && (
                        <a
                          href={getZillowUrl(client.street_address, client.city, client.state, client.zip_code)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs bg-blue-100 px-2 py-1 rounded-full"
                        >
                          🏠 Zillow
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.pipeline_status)}`}>
                  {client.pipeline_status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">{client.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">{client.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm">{client.loan_officer}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white bg-opacity-40 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Home Value</div>
                  <div className="font-semibold text-gray-800">{formatCurrency(client.home_value)}</div>
                </div>
                <div className="bg-white bg-opacity-40 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Desired Proceeds</div>
                  <div className="font-semibold text-emerald-600">{formatCurrency(client.desired_proceeds)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleEditClient(client)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(client.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Add Spouse Button */}
              {!client.spouse_name && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowAddSpouse(client.id)}
                    className="w-full flex items-center justify-center px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Spouse
                  </button>
                </div>
              )}

              {/* Spouse Info Display */}
              {client.spouse_name && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-purple-700">
                      Spouse: {client.spouse_name}
                      {client.spouse_is_nbs && (
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          NBS
                        </span>
                      )}
                    </div>
                    {client.spouse_date_of_birth && (
                      <div className="text-purple-600 text-xs">
                        Age: {calculateAge(client.spouse_date_of_birth)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Client Modal */}
        {showAddClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Client</h2>
                <button
                  onClick={() => setShowAddClient(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddClient(); }}>
                {/* Personal Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <HomeIcon className="w-5 h-5 mr-2 text-emerald-600" />
                      Personal Information
                    </h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.first_name}
                      onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.last_name}
                      onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.date_of_birth}
                      onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spouse Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.spouse_name}
                      onChange={(e) => setNewClient({...newClient, spouse_name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spouse Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.spouse_date_of_birth}
                      onChange={(e) => setNewClient({...newClient, spouse_date_of_birth: e.target.value})}
                    />
                  </div>
                </div>

                {/* Property Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <HomeIcon className="w-5 h-5 mr-2 text-emerald-600" />
                      Property Information
                    </h4>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.street_address}
                      onChange={(e) => setNewClient({...newClient, street_address: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.city}
                      onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.state}
                      onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                    >
                      <option value="">Select State</option>
                      <option value="VA">Virginia</option>
                      <option value="MD">Maryland</option>
                      <option value="DC">Washington DC</option>
                      <option value="WV">West Virginia</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="DE">Delaware</option>
                      <option value="NC">North Carolina</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.zip_code}
                      onChange={(e) => setNewClient({...newClient, zip_code: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.property_type}
                      onChange={(e) => setNewClient({...newClient, property_type: e.target.value})}
                    >
                      <option value="single_family">Single Family</option>
                      <option value="condo">Condominium</option>
                      <option value="townhome">Townhome</option>
                      <option value="manufactured">Manufactured Home</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                      Financial Details
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Value
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.home_value}
                      onChange={(e) => setNewClient({...newClient, home_value: Number(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desired Proceeds
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.desired_proceeds}
                      onChange={(e) => setNewClient({...newClient, desired_proceeds: Number(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Member *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.loan_officer}
                      onChange={(e) => setNewClient({...newClient, loan_officer: e.target.value})}
                    >
                      <option value="">Select Team Member</option>
                      {teamMembers.map(member => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pipeline Status
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newClient.pipeline_status}
                      onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value as any})}
                    >
                      <option value="lead">Lead</option>
                      <option value="qualified">Qualified</option>
                      <option value="counseling">Counseling</option>
                      <option value="processing">Processing</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddClient(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-semibold"
                  >
                    Add Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Spouse Modal */}
        {showAddSpouse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add Spouse</h2>
                <button
                  onClick={() => {setShowAddSpouse(null); setSpouseForm({ spouse_name: '', spouse_date_of_birth: '', spouse_is_nbs: false })}}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddSpouse(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spouse Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={spouseForm.spouse_name}
                      onChange={(e) => setSpouseForm({...spouseForm, spouse_name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={spouseForm.spouse_date_of_birth}
                      onChange={(e) => setSpouseForm({...spouseForm, spouse_date_of_birth: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="spouse_nbs"
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      checked={spouseForm.spouse_is_nbs}
                      onChange={(e) => setSpouseForm({...spouseForm, spouse_is_nbs: e.target.checked})}
                    />
                    <label htmlFor="spouse_nbs" className="ml-2 text-sm font-medium text-gray-700">
                      Spouse is Non-Borrowing Spouse (NBS)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {setShowAddSpouse(null); setSpouseForm({ spouse_name: '', spouse_date_of_birth: '', spouse_is_nbs: false })}}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold"
                  >
                    Add Spouse
                  </button>
                </div>
              </form>
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
                  onClick={() => {setEditingClient(null); setEditForm({})}}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                {/* Personal Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-emerald-600" />
                      Personal Information
                    </h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.first_name || ''}
                      onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.last_name || ''}
                      onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.date_of_birth || ''}
                      onChange={(e) => setEditForm({...editForm, date_of_birth: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spouse Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.spouse_name || ''}
                      onChange={(e) => setEditForm({...editForm, spouse_name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spouse Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.spouse_date_of_birth || ''}
                      onChange={(e) => setEditForm({...editForm, spouse_date_of_birth: e.target.value})}
                    />
                  </div>
                </div>

                {/* Property Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Home className="w-5 h-5 mr-2 text-emerald-600" />
                      Property Information
                    </h4>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.street_address || ''}
                      onChange={(e) => setEditForm({...editForm, street_address: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.state || ''}
                      onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                    >
                      <option value="">Select State</option>
                      <option value="VA">Virginia</option>
                      <option value="MD">Maryland</option>
                      <option value="DC">Washington DC</option>
                      <option value="WV">West Virginia</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="DE">Delaware</option>
                      <option value="NC">North Carolina</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.zip_code || ''}
                      onChange={(e) => setEditForm({...editForm, zip_code: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.property_type || ''}
                      onChange={(e) => setEditForm({...editForm, property_type: e.target.value})}
                    >
                      <option value="single_family">Single Family</option>
                      <option value="condo">Condominium</option>
                      <option value="townhome">Townhome</option>
                      <option value="manufactured">Manufactured Home</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                      Financial Details
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Value
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.home_value || 0}
                      onChange={(e) => setEditForm({...editForm, home_value: Number(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desired Proceeds
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.desired_proceeds || 0}
                      onChange={(e) => setEditForm({...editForm, desired_proceeds: Number(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Member *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.loan_officer || ''}
                      onChange={(e) => setEditForm({...editForm, loan_officer: e.target.value})}
                    >
                      <option value="">Select Team Member</option>
                      {teamMembers.map(member => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pipeline Status
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={editForm.pipeline_status || ''}
                      onChange={(e) => setEditForm({...editForm, pipeline_status: e.target.value as any})}
                    >
                      <option value="lead">Lead</option>
                      <option value="qualified">Qualified</option>
                      <option value="counseling">Counseling</option>
                      <option value="processing">Processing</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {setEditingClient(null); setEditForm({})}}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Client Detail Modal */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Client Details</h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{selectedClient.first_name} {selectedClient.last_name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Phone className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium text-gray-700">{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Mail className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium text-gray-700">{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium text-gray-700">Age: {calculateAge(selectedClient.date_of_birth)}</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <User className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium text-gray-700">Team Member: {selectedClient.loan_officer}</span>
                    </div>
                  </div>
                </div>

                {/* Property Details Section - ALWAYS SHOW */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HomeIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    Property Details
                  </h4>
                  <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <HomeIcon className="w-5 h-5 mr-3 text-emerald-600" />
                      <div>
                        <span className="font-medium text-gray-700">Property: </span>
                        <span className="text-gray-600">
                          {selectedClient.street_address || 'No street address'}, {selectedClient.city || 'No city'}, {selectedClient.state || 'No state'} {selectedClient.zip_code || ''}
                        </span>
                        {selectedClient.street_address && selectedClient.city && selectedClient.state && selectedClient.zip_code && (
                          <a
                            href={getZillowUrl(selectedClient.street_address, selectedClient.city, selectedClient.state, selectedClient.zip_code)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full transition-colors"
                          >
                            🏠 View on Zillow
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-white rounded-lg">
                      <HomeIcon className="w-5 h-5 mr-3 text-emerald-600" />
                      <span className="font-medium text-gray-700">Property Type: {selectedClient.property_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                    Financial Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                      <HomeIcon className="w-5 h-5 mr-3 text-emerald-600" />
                      <div>
                        <span className="font-medium text-gray-700">Property: </span>
                        <span className="text-gray-600">{formatCurrency(selectedClient.home_value)}</span>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                      <DollarSign className="w-5 h-5 mr-3 text-emerald-600" />
                      <span className="font-medium text-gray-700">Desired: {formatCurrency(selectedClient.desired_proceeds)}</span>
                    </div>
                  </div>
                </div>

                {/* Sales Notes Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Edit2 className="w-5 h-5 mr-2 text-emerald-600" />
                    Sales Notes
                  </h4>
                  <div className="space-y-3 mb-4">
                    {selectedClient.notes?.map((note, index) => (
                      <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                        <p className="text-gray-700 text-sm">{note}</p>
                      </div>
                    )) || <p className="text-gray-500 italic">No notes yet</p>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a note..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
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
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this client? This action cannot be undone.</p>
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
        )}
      </div>
    </div>
  )
}
