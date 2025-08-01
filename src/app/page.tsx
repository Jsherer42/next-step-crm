'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Search, Plus, Phone, Mail, Home, DollarSign, Calendar, Filter, Eye, User } from 'lucide-react'

// Client interface
interface Client {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  date_of_birth: string
  is_married: boolean
  spouse_first_name: string | null
  spouse_last_name: string | null
  spouse_date_of_birth: string | null
  home_value: number | null
  mortgage_balance: number | null
  desired_proceeds: number | null
  lead_source: string | null
  pipeline_status: string
  assigned_loan_officer_id: string | null
  created_at: string
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  // Demo data for immediate functionality
  const demoClients: Client[] = [
    {
      id: '1',
      first_name: 'Robert',
      last_name: 'Johnson',
      phone: '(555) 123-4567',
      email: 'robert.johnson@email.com',
      date_of_birth: '1961-03-15',
      is_married: false,
      spouse_first_name: null,
      spouse_last_name: null,
      spouse_date_of_birth: null,
      home_value: 450000,
      mortgage_balance: 125000,
      desired_proceeds: 200000,
      lead_source: 'Forward Referral',
      pipeline_status: 'qualified',
      assigned_loan_officer_id: 'jeremiah_sherer',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      first_name: 'Margaret',
      last_name: 'Williams',
      phone: '(555) 987-6543',
      email: 'margaret.williams@email.com',
      date_of_birth: '1959-08-22',
      is_married: true,
      spouse_first_name: 'William',
      spouse_last_name: 'Williams',
      spouse_date_of_birth: '1957-12-10',
      home_value: 620000,
      mortgage_balance: 0,
      desired_proceeds: 150000,
      lead_source: 'Mailer',
      pipeline_status: 'counseling',
      assigned_loan_officer_id: 'christian_ford',
      created_at: '2024-01-20T14:15:00Z'
    }
  ]

  // Load clients on component mount
  useEffect(() => {
    loadClients()
  }, [])

  // Filter clients based on search and status
  useEffect(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = searchTerm === '' || 
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || client.pipeline_status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    setFilteredClients(filtered)
  }, [clients, searchTerm, statusFilter])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Using demo data:', error.message)
        setClients(demoClients)
      } else {
        setClients(data || demoClients)
      }
    } catch (error) {
      console.log('Using demo data due to connection error')
      setClients(demoClients)
    } finally {
      setLoading(false)
    }
  }

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

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'new_lead': 'bg-blue-500 text-white',
      'qualified': 'bg-green-500 text-white',
      'counseling': 'bg-amber-500 text-white',
      'application': 'bg-purple-500 text-white',
      'processing': 'bg-orange-500 text-white',
      'closed': 'bg-gray-500 text-white'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500 text-white'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Next Step CRM...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Next Step</h1>
                <p className="text-blue-600 font-semibold">City First FHA Retirement CRM</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Client
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="new_lead">New Lead</option>
              <option value="qualified">Qualified</option>
              <option value="counseling">Counseling</option>
              <option value="application">Application</option>
              <option value="processing">Processing</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md border border-gray-200 min-w-0">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1 truncate">Total Pipeline</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {formatCurrency(
                    clients.reduce((sum, client) => sum + (client.desired_proceeds || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md border border-gray-200 min-w-0">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1 truncate">Active Clients</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{filteredClients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md border border-gray-200 min-w-0">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
                <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1 truncate">New Leads</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.pipeline_status === 'new_lead').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md border border-gray-200 min-w-0">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg flex-shrink-0">
                <Home className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1 truncate">Qualified</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
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
              <div key={client.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {client.first_name} {client.last_name}
                    </h3>
                    <p className="text-gray-600">Age {age}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.pipeline_status)}`}>
                    {client.pipeline_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">{client.email || 'No email'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="text-sm">Home: {formatCurrency(client.home_value)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="text-sm">Desired: {formatCurrency(client.desired_proceeds)}</span>
                    </div>
                  </div>
                </div>

                {client.is_married && client.spouse_first_name && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <span className="text-blue-800 text-sm font-medium">
                      👫 Married to {client.spouse_first_name} {client.spouse_last_name} (Age {spouseAge})
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-gray-600 text-sm">
                    <div>Source: <span className="font-medium">{client.lead_source || 'Unknown'}</span></div>
                  </div>
                  <button 
                    onClick={() => setSelectedClient(client)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
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

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal 
          client={selectedClient} 
          onClose={() => setSelectedClient(null)} 
        />
      )}

      {/* Add Client Form */}
      {showAddForm && (
        <AddClientForm 
          onClose={() => setShowAddForm(false)} 
          onSave={(clientData) => {
            const newClient = {
              ...clientData,
              id: Date.now().toString(),
              created_at: new Date().toISOString()
            }
            setClients(prev => [newClient, ...prev])
            setShowAddForm(false)
          }} 
        />
      )}
    </div>
  )
}

// Simple Client Detail Modal
function ClientDetailModal({ client, onClose }: { client: Client, onClose: () => void }) {
  const age = new Date().getFullYear() - new Date(client.date_of_birth).getFullYear()
  const spouseAge = client.spouse_date_of_birth ? 
    new Date().getFullYear() - new Date(client.spouse_date_of_birth).getFullYear() : null

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {client.first_name} {client.last_name}
              </h2>
              <p className="text-gray-600">Age {age} • {client.pipeline_status.replace('_', ' ').toUpperCase()}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Phone className="w-5 h-5 mr-3 text-blue-600" />
                <span className="font-medium text-gray-700">{client.phone}</span>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <Mail className="w-5 h-5 mr-3 text-green-600" />
                <span className="font-medium text-gray-700">{client.email || 'No email provided'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                <Home className="w-5 h-5 mr-3 text-emerald-600" />
                <span className="font-medium text-gray-700">Home Value: {formatCurrency(client.home_value)}</span>
              </div>
              
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <DollarSign className="w-5 h-5 mr-3 text-purple-600" />
                <span className="font-medium text-gray-700">Desired: {formatCurrency(client.desired_proceeds)}</span>
              </div>
            </div>
          </div>

          {client.is_married && client.spouse_first_name && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">👫 Spouse Information</h3>
              <p className="text-gray-700">
                <strong>{client.spouse_first_name} {client.spouse_last_name}</strong> (Age {spouseAge})
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Lead Source</h4>
              <p className="text-gray-600">{client.lead_source || 'Unknown'}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Mortgage Balance</h4>
              <p className="text-gray-600">{formatCurrency(client.mortgage_balance)}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Add Client Form
function AddClientForm({ onClose, onSave }: { onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    is_married: false,
    spouse_first_name: '',
    spouse_last_name: '',
    spouse_date_of_birth: '',
    home_value: '',
    mortgage_balance: '',
    desired_proceeds: '',
    lead_source: '',
    pipeline_status: 'new_lead',
    assigned_loan_officer_id: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const clientData = {
      ...formData,
      home_value: formData.home_value ? parseInt(formData.home_value) : null,
      mortgage_balance: formData.mortgage_balance ? parseInt(formData.mortgage_balance) : null,
      desired_proceeds: formData.desired_proceeds ? parseInt(formData.desired_proceeds) : null,
      email: formData.email || null,
      spouse_first_name: formData.is_married ? formData.spouse_first_name : null,
      spouse_last_name: formData.is_married ? formData.spouse_last_name : null,
      spouse_date_of_birth: formData.is_married ? formData.spouse_date_of_birth : null,
    }

    onSave(clientData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.is_married}
                  onChange={(e) => setFormData({...formData, is_married: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Married</span>
              </label>
            </div>

            {formData.is_married && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spouse Information</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spouse First Name</label>
                    <input
                      type="text"
                      value={formData.spouse_first_name}
                      onChange={(e) => setFormData({...formData, spouse_first_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Last Name</label>
                    <input
                      type="text"
                      value={formData.spouse_last_name}
                      onChange={(e) => setFormData({...formData, spouse_last_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Date of Birth</label>
                  <input
                    type="date"
                    value={formData.spouse_date_of_birth}
                    onChange={(e) => setFormData({...formData, spouse_date_of_birth: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Value</label>
                <input
                  type="number"
                  value={formData.home_value}
                  onChange={(e) => setFormData({...formData, home_value: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="450000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Balance</label>
                <input
                  type="number"
                  value={formData.mortgage_balance}
                  onChange={(e) => setFormData({...formData, mortgage_balance: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="125000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desired Proceeds</label>
                <input
                  type="number"
                  value={formData.desired_proceeds}
                  onChange={(e) => setFormData({...formData, desired_proceeds: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="200000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
              <select
                value={formData.lead_source}
                onChange={(e) => setFormData({...formData, lead_source: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select lead source...</option>
                <option value="Forward Referral">Forward Referral</option>
                <option value="Realtor Referral">Realtor Referral</option>
                <option value="Mailer">Mailer</option>
                <option value="Website">Website</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Social Media">Social Media</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Client
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
