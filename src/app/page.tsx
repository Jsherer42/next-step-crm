'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Phone, Mail, Home, DollarSign, Calendar, Filter, Edit2, Eye, X, Save, Calculator, User } from 'lucide-react'

// Client interface with address fields
interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  spouse_name?: string
  spouse_date_of_birth?: string
  street_address: string
  city: string
  state: string
  zip_code: string
  property_type: 'single_family' | 'condo' | 'townhome' | 'manufactured' | 'other'
  home_value: number
  desired_proceeds: number
  loan_officer: string
  pipeline_status: 'lead' | 'qualified' | 'counseling' | 'docs' | 'underwriting' | 'closing' | 'funded'
  created_at: string
}

export default function NextStepCRM() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

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
    property_type: 'single_family' as const,
    home_value: 0,
    desired_proceeds: 0,
    loan_officer: '',
    pipeline_status: 'lead' as const
  })

  // Initialize with demo data including addresses
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
        street_address: '1247 Maple Street',
        city: 'Arlington',
        state: 'VA',
        zip_code: '22201',
        property_type: 'single_family' as const,
        home_value: 450000,
        desired_proceeds: 200000,
        loan_officer: 'Sarah Mitchell',
        pipeline_status: 'qualified' as const,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        first_name: 'Margaret',
        last_name: 'Williams',
        email: 'margaret.williams@email.com',
        phone: '(555) 987-6543',
        date_of_birth: '1959-08-22',
        spouse_name: 'William Williams',
        spouse_date_of_birth: '1957-12-10',
        street_address: '892 Oak Avenue',
        city: 'Bethesda',
        state: 'MD',
        zip_code: '20814',
        property_type: 'condo' as const,
        home_value: 620000,
        desired_proceeds: 150000,
        loan_officer: 'James Parker',
        pipeline_status: 'counseling' as const,
        created_at: new Date().toISOString()
      }
    ])
  }, [])

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
      lead: 'bg-gray-100 text-gray-800',
      qualified: 'bg-green-100 text-green-800',
      counseling: 'bg-blue-100 text-blue-800',
      docs: 'bg-yellow-100 text-yellow-800',
      underwriting: 'bg-purple-100 text-purple-800',
      closing: 'bg-orange-100 text-orange-800',
      funded: 'bg-emerald-100 text-emerald-800'
    }
    return colors[status as keyof typeof colors] || colors.lead
  }

  // Calculate stats
  const totalPipeline = clients.reduce((sum, client) => sum + client.desired_proceeds, 0)
  const activeClients = clients.length
  const newLeads = clients.filter(c => c.pipeline_status === 'lead').length
  const qualified = clients.filter(c => c.pipeline_status === 'qualified').length

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || client.pipeline_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newClient.first_name || !newClient.last_name || !newClient.email) {
      alert('Please fill in all required fields')
      return
    }

    // Age validation
    const clientAge = calculateAge(newClient.date_of_birth)
    const spouseAge = newClient.spouse_date_of_birth ? calculateAge(newClient.spouse_date_of_birth) : null
    
    if (clientAge < 62) {
      alert('Primary client must be at least 62 years old for a reverse mortgage')
      return
    }
    
    if (spouseAge && spouseAge < 62) {
      alert('Spouse must be at least 62 years old for a reverse mortgage')
      return
    }

    try {
      const clientToAdd: Client = {
        id: Date.now().toString(),
        ...newClient,
        created_at: new Date().toISOString()
      }

      setClients([...clients, clientToAdd])
      setShowAddModal(false)
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
        property_type: 'single_family' as const,
        home_value: 0,
        desired_proceeds: 0,
        loan_officer: '',
        pipeline_status: 'lead' as const
      })
      
      alert('Client added successfully!')
    } catch (error) {
      console.error('Error adding client:', error)
      alert('Error adding client. Please try again.')
    }
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(client => client.id !== clientId))
    setShowDeleteConfirm(null)
    alert('Client deleted successfully!')
  }

  const loanOfficers = [
    'Sarah Mitchell',
    'James Parker', 
    'Emily Rodriguez',
    'Michael Chen',
    'Lisa Thompson',
    'David Wilson',
    'Amanda Foster',
    'Robert Kim'
  ]

  // Floating elements for background animation
  const FloatingElement = ({ delay = 0, duration = 20, size = 100, opacity = 0.1 }) => (
    <div 
      className="absolute rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 animate-float"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        opacity,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-emerald-500 to-blue-600 animate-gradient-xy relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0} duration={25} size={120} opacity={0.08} />
        <FloatingElement delay={5} duration={30} size={80} opacity={0.06} />
        <FloatingElement delay={10} duration={35} size={150} opacity={0.04} />
        <FloatingElement delay={15} duration={28} size={90} opacity={0.07} />
        <FloatingElement delay={20} duration={32} size={110} opacity={0.05} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg animate-pulse">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Next Step CRM
                </h1>
                <p className="text-gray-600 text-lg">City First FHA Retirement Solutions</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center animate-pulse"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Client
          </button>
        </div>

        {/* Stats Cards - Enhanced Total Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-12">
          {/* FEATURED - Total Pipeline Card - Extra Large */}
          <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-emerald-500 to-blue-600 p-8 rounded-2xl shadow-2xl text-white relative overflow-hidden animate-pulse border-4 border-white">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-500/20 animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-12 h-12 text-emerald-100" />
                <span className="text-emerald-100 text-lg font-semibold">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-emerald-100 mb-2">Total Pipeline</h3>
              <p className="text-6xl font-bold mb-2">{formatCurrency(totalPipeline)}</p>
              <p className="text-emerald-100 text-xl">Active Revenue Potential</p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <User className="w-8 h-8 text-blue-600" />
              <span className="text-blue-600 text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Clients</h3>
            <p className="text-4xl font-bold text-blue-600">{activeClients}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Phone className="w-8 h-8 text-orange-600" />
              <span className="text-orange-600 text-2xl">📞</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">New Leads</h3>
            <p className="text-4xl font-bold text-orange-600">{newLeads}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Calculator className="w-8 h-8 text-green-600" />
              <span className="text-green-600 text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Qualified</h3>
            <p className="text-4xl font-bold text-green-600">{qualified}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 mb-8 shadow-lg border border-white/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm appearance-none min-w-48"
              >
                <option value="all">All Statuses</option>
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="counseling">Counseling</option>
                <option value="docs">Documents</option>
                <option value="underwriting">Underwriting</option>
                <option value="closing">Closing</option>
                <option value="funded">Funded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:scale-105 hover:rotate-1 transition-all duration-500 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                    {client.first_name} {client.last_name}
                  </h3>
                  <div className="text-sm text-gray-600 mt-2">
                    <div className="flex items-center">
                      <Home className="w-4 h-4 mr-1" />
                      {client.city}, {client.state}
                    </div>
                    <div className="mt-1">
                      {client.property_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {formatCurrency(client.home_value)}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.pipeline_status)}`}>
                  {client.pipeline_status.charAt(0).toUpperCase() + client.pipeline_status.slice(1)}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-3 text-emerald-500" />
                  <span className="text-sm">{client.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-3 text-emerald-500" />
                  <span className="text-sm">{client.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-3 text-emerald-500" />
                  <span className="text-sm">Age: {calculateAge(client.date_of_birth)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-3 text-emerald-500" />
                  <span className="text-sm">Desired: {formatCurrency(client.desired_proceeds)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedClient(client)
                    setShowDetailModal(true)
                  }}
                  className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center group-hover:scale-105 transform transition-transform duration-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(client.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center group-hover:scale-105 transform transition-transform duration-300"
                >
                  <X className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No clients found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Add New Client</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div onSubmit={handleAddClient} className="space-y-8">
              {/* Personal Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    value={newClient.first_name}
                    onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={newClient.last_name}
                    onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={newClient.date_of_birth}
                    onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spouse Name
                  </label>
                  <input
                    type="text"
                    value={newClient.spouse_name}
                    onChange={(e) => setNewClient({...newClient, spouse_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spouse Date of Birth
                  </label>
                  <input
                    type="date"
                    value={newClient.spouse_date_of_birth}
                    onChange={(e) => setNewClient({...newClient, spouse_date_of_birth: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Property Address Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Home className="w-5 h-5 mr-2 text-emerald-600" />
                    Property Information
                  </h4>
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={newClient.street_address}
                    onChange={(e) => setNewClient({...newClient, street_address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="1234 Main Street"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={newClient.city}
                    onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Washington"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={newClient.state}
                    onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
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
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={newClient.zip_code}
                    onChange={(e) => setNewClient({...newClient, zip_code: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="20001"
                    maxLength={5}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    value={newClient.property_type}
                    onChange={(e) => setNewClient({...newClient, property_type: e.target.value as any})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  >
                    <option value="single_family">Single Family Home</option>
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
                    Home Value *
                  </label>
                  <input
                    type="number"
                    value={newClient.home_value || ''}
                    onChange={(e) => setNewClient({...newClient, home_value: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Proceeds *
                  </label>
                  <input
                    type="number"
                    value={newClient.desired_proceeds || ''}
                    onChange={(e) => setNewClient({...newClient, desired_proceeds: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Officer *
                  </label>
                  <select
                    value={newClient.loan_officer}
                    onChange={(e) => setNewClient({...newClient, loan_officer: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  >
                    <option value="">Select Loan Officer</option>
                    {loanOfficers.map(officer => (
                      <option key={officer} value={officer}>{officer}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pipeline Status *
                  </label>
                  <select
                    value={newClient.pipeline_status}
                    onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value as any})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  >
                    <option value="lead">Lead</option>
                    <option value="qualified">Qualified</option>
                    <option value="counseling">Counseling</option>
                    <option value="docs">Documents</option>
                    <option value="underwriting">Underwriting</option>
                    <option value="closing">Closing</option>
                    <option value="funded">Funded</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddClient}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Add Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Detail Modal */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {selectedClient.first_name} {selectedClient.last_name}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-emerald-600" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 mr-3 text-emerald-600" />
                      <span className="font-medium text-gray-700">{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 mr-3 text-emerald-600" />
                      <span className="font-medium text-gray-700">{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 mr-3 text-emerald-600" />
                      <span className="font-medium text-gray-700">Age: {calculateAge(selectedClient.date_of_birth)}</span>
                    </div>
                    {selectedClient.spouse_name && (
                      <>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <User className="w-5 h-5 mr-3 text-emerald-600" />
                          <span className="font-medium text-gray-700">Spouse: {selectedClient.spouse_name}</span>
                        </div>
                        {selectedClient.spouse_date_of_birth && (
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Calendar className="w-5 h-5 mr-3 text-emerald-600" />
                            <span className="font-medium text-gray-700">Spouse Age: {calculateAge(selectedClient.spouse_date_of_birth)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Home className="w-5 h-5 mr-2 text-emerald-600" />
                    Property Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                      <Home className="w-5 h-5 mr-3 text-emerald-600" />
                      <div>
                        <span className="font-medium text-gray-700">Property: </span>
                        <span className="text-gray-600">
                          {selectedClient.street_address}, {selectedClient.city}, {selectedClient.state} {selectedClient.zip_code}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                      <Home className="w-5 h-5 mr-3 text-emerald-600" />
                      <span className="font-medium text-gray-700">Property Type: {selectedClient.property_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                      <DollarSign className="w-5 h-5 mr-3 text-emerald-600" />
                      <span className="font-medium text-gray-700">Home Value: {formatCurrency(selectedClient.home_value)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                    Loan Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <DollarSign className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium text-gray-700">Desired Proceeds: {formatCurrency(selectedClient.desired_proceeds)}</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <User className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium text-gray-700">Loan Officer: {selectedClient.loan_officer}</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedClient.pipeline_status)}`}>
                        Status: {selectedClient.pipeline_status.charAt(0).toUpperCase() + selectedClient.pipeline_status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium text-gray-700">
                        Added: {new Date(selectedClient.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-8 border-t mt-8">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                <Edit2 className="w-5 h-5 mr-2" />
                Edit Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Client</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this client? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteClient(showDeleteConfirm)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(120deg); }
          66% { transform: translateY(15px) rotate(240deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        @keyframes gradient-xy {
          0%, 100% {
            background: linear-gradient(45deg, #3b82f6, #10b981, #06b6d4, #8b5cf6);
            background-size: 400% 400%;
            background-position: 0% 50%;
          }
          25% {
            background: linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6, #f59e0b);
            background-size: 400% 400%;
            background-position: 100% 50%;
          }
          50% {
            background: linear-gradient(225deg, #06b6d4, #8b5cf6, #f59e0b, #ef4444);
            background-size: 400% 400%;
            background-position: 100% 100%;
          }
          75% {
            background: linear-gradient(315deg, #8b5cf6, #f59e0b, #ef4444, #3b82f6);
            background-size: 400% 400%;
            background-position: 0% 100%;
          }
        }
        .animate-gradient-xy {
          animation: gradient-xy 8s ease infinite;
        }
      `}</style>
    </div>
  )
}
