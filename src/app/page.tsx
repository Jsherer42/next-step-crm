'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Search, Plus, Phone, Mail, Home, DollarSign, Calendar, Filter, Edit2, Eye, X, Save, Calculator, User } from 'lucide-react'

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

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    checkUser()
    getClients()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // For now, we'll create a demo mode - in production this would redirect to login
      setUser({ email: 'demo@cityfirst.com' })
    } else {
      setUser(user)
    }
  }

  const getClients = async () => {
    try {
      // Try to get from database, but fallback to demo data
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Using demo data - database not connected yet')
        // Demo data for testing
        setClients([
          {
            id: '1',
            first_name: 'Robert',
            last_name: 'Johnson',
            phone: '(555) 123-4567',
            email: 'robert.j@email.com',
            date_of_birth: '1956-03-15',
            is_married: false,
            spouse_first_name: null,
            spouse_last_name: null,
            spouse_date_of_birth: null,
            home_value: 450000,
            mortgage_balance: 125000,
            desired_proceeds: 200000,
            lead_source: 'Forward Referral',
            pipeline_status: 'qualified',
            assigned_loan_officer_id: null,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            first_name: 'Margaret',
            last_name: 'Williams',
            phone: '(555) 987-6543',
            email: 'mwilliams@email.com',
            date_of_birth: '1951-08-22',
            is_married: true,
            spouse_first_name: 'John',
            spouse_last_name: 'Williams',
            spouse_date_of_birth: '1950-12-10',
            home_value: 320000,
            mortgage_balance: 0,
            desired_proceeds: 150000,
            lead_source: 'Mailer',
            pipeline_status: 'counseling',
            assigned_loan_officer_id: null,
            created_at: new Date().toISOString()
          }
        ])
        return
      }

      setClients(data || [])
    } catch (error) {
      console.error('Error:', error)
      setClients([]) // Empty state
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'new_lead': 'bg-slate-100 text-slate-800',
      'qualified': 'bg-green-100 text-green-800',
      'counseling': 'bg-amber-100 text-amber-800',
      'application': 'bg-blue-100 text-blue-800',
      'processing': 'bg-orange-100 text-orange-800',
      'closed': 'bg-green-200 text-green-900'
    }
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-800'
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || client.pipeline_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleSaveClient = async (clientData: any) => {
    try {
      // Try to save to database, but fallback to local state
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          created_by_id: user?.id
        }])
        .select()

      if (error) {
        console.log('Adding to demo data')
        // Add to local state for demo
        const newClient = {
          ...clientData,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        }
        setClients(prev => [newClient, ...prev])
        return
      }

      if (data) {
        setClients(prev => [data[0], ...prev])
      }
  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return
    }

    try {
      // Try to delete from database
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) {
        console.log('Deleting from demo data')
      }

      // Remove from local state regardless
      setClients(prev => prev.filter(client => client.id !== clientId))

      // If a client was selected and we deleted it, close the modal
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(null)
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      // Still remove from local state
      setClients(prev => prev.filter(client => client.id !== clientId))
    }
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
    try {
      // Try to save to database, but fallback to local state
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          created_by_id: user?.id
        }])
        .select()

      if (error) {
        console.log('Adding to demo data')
        // Add to local state for demo
        const newClient = {
          ...clientData,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        }
        setClients(prev => [newClient, ...prev])
        return
      }

      if (data) {
        setClients(prev => [data[0], ...prev])
      }
    } catch (error) {
      console.error('Error:', error)
      // Fallback to local state
      const newClient = {
        ...clientData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      setClients(prev => [newClient, ...prev])
    }
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
                {/* Enhanced City First Logo */}
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300" style={{animation: 'pulse 3s ease-in-out infinite'}}>
                  <Home className="w-8 h-8 text-white" />
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
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/25 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1"
                style={{animation: 'pulse 2s ease-in-out infinite'}}
              >
                <Plus className="w-6 h-6 mr-3" />
                Add New Client
              </button>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30 shadow-xl">
                <div className="text-white font-semibold">
                  Welcome, <span className="text-green-200">{user?.email}</span>
                </div>
              </div>
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
                <p className="text-lg font-bold text-white/90 mb-1">Total Pipeline</p>
                <p className="text-4xl font-black text-white drop-shadow-lg">
                  {formatCurrency(
                    clients.reduce((sum, client) => sum + (client.desired_proceeds || 0), 0)
                  )}
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
                <Home className="w-8 h-8 text-white" />
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
                      <DollarSign className="w-5 h-5 mr-3 text-emerald-300" />
                      <span className="font-medium">Desired: {formatCurrency(client.desired_proceeds)}</span>
                    </div>
                  </div>
                </div>

                {client.is_married && client.spouse_first_name && (
                  <div className="mb-6 p-4 bg-blue-400/20 backdrop-blur-sm rounded-xl border border-blue-300/30">
                    <span className="text-blue-100 font-semibold">
                      👫 Married to {client.spouse_first_name} {client.spouse_last_name} (Age {spouseAge})
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-white/20">
                  <div className="text-white/80 font-medium">
                    <div>Source: <span className="text-green-200 font-bold">{client.lead_source || 'Unknown'}</span></div>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setSelectedClient(client)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-2xl hover:shadow-blue-500/25 hover:scale-110 transition-all duration-300 flex items-center transform hover:-translate-y-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client.id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-3 rounded-xl font-bold shadow-2xl hover:shadow-red-500/25 hover:scale-110 transition-all duration-300 flex items-center transform hover:-translate-y-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Delete
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
          onSave={handleSaveClient} 
        />
      )}
    </div>
  )
}

// Client Detail Modal Component
function ClientDetailModal({ client, onClose }: { client: Client, onClose: () => void }) {
  const age = client.date_of_birth ? new Date().getFullYear() - new Date(client.date_of_birth).getFullYear() : 0
  const spouseAge = client.spouse_date_of_birth ? new Date().getFullYear() - new Date(client.spouse_date_of_birth).getFullYear() : null

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {client.first_name} {client.last_name}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Phone:</strong> {client.phone}</p>
                <p><strong>Email:</strong> {client.email || 'Not provided'}</p>
                <p><strong>Age:</strong> {age}</p>
                {client.is_married && (
                  <>
                    <p><strong>Married to:</strong> {client.spouse_first_name} {client.spouse_last_name}</p>
                    <p><strong>Spouse Age:</strong> {spouseAge}</p>
                  </>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Financial Details</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Home Value:</strong> {formatCurrency(client.home_value)}</p>
                <p><strong>Mortgage Balance:</strong> {formatCurrency(client.mortgage_balance)}</p>
                <p><strong>Desired Proceeds:</strong> {formatCurrency(client.desired_proceeds)}</p>
                <p><strong>Available Equity:</strong> {formatCurrency((client.home_value || 0) - (client.mortgage_balance || 0))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Client Form Component  
function AddClientForm({ onClose, onSave }: { onClose: () => void, onSave: (client: any) => void }) {
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
    assigned_loan_officer_id: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  const checkEligibility = () => {
    const primaryAge = calculateAge(formData.date_of_birth)
    const spouseAge = formData.is_married ? calculateAge(formData.spouse_date_of_birth) : null
    
    if (formData.is_married) {
      return primaryAge >= 62 && (spouseAge !== null ? spouseAge >= 62 : false)
    } else {
      return primaryAge >= 62
    }
  }

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.date_of_birth) {
      alert('Please fill in required fields (Name, Phone, Date of Birth)')
      return
    }
    
    if (formData.is_married && (!formData.spouse_first_name || !formData.spouse_date_of_birth)) {
      alert('Please provide spouse information for married borrowers')
      return
    }

    const isEligible = checkEligibility()
    if (!isEligible) {
      alert('Borrower(s) must be 62 or older to qualify for FHA Retirement')
      return
    }

    setIsSubmitting(true)

    try {
      const clientData = {
        ...formData,
        home_value: parseFloat(formData.home_value) || null,
        mortgage_balance: parseFloat(formData.mortgage_balance) || null,
        desired_proceeds: parseFloat(formData.desired_proceeds) || null,
        pipeline_status: 'qualified'
      }

      await onSave(clientData)
      onClose()
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Error saving client. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentAge = calculateAge(formData.date_of_birth)
  const spouseAge = calculateAge(formData.spouse_date_of_birth)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Add New Client</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Primary Borrower */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth *</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {formData.date_of_birth && (
                <p className={`text-sm mt-1 ${currentAge >= 62 ? 'text-green-600' : 'text-red-500'}`}>
                  Age: {currentAge} {currentAge >= 62 ? '✓ Qualified' : '✗ Must be 62+'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          {/* Marital Status */}
          <div className="border-t pt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="is_married"
                checked={formData.is_married}
                onChange={(e) => setFormData({
                  ...formData, 
                  is_married: e.target.checked,
                  spouse_first_name: '',
                  spouse_last_name: '',
                  spouse_date_of_birth: ''
                })}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_married" className="text-sm font-medium text-gray-700">
                Married (Both spouses must be on title and 62+)
              </label>
            </div>

            {formData.is_married && (
              <div className="bg-blue-50 p-4 rounded-md space-y-4">
                <h4 className="font-medium text-blue-900">Spouse Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Spouse First Name *</label>
                    <input
                      type="text"
                      value={formData.spouse_first_name}
                      onChange={(e) => setFormData({...formData, spouse_first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter spouse first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Spouse Last Name *</label>
                    <input
                      type="text"
                      value={formData.spouse_last_name}
                      onChange={(e) => setFormData({...formData, spouse_last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter spouse last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Spouse Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.spouse_date_of_birth}
                    onChange={(e) => setFormData({...formData, spouse_date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.spouse_date_of_birth && (
                    <p className={`text-sm mt-1 ${spouseAge >= 62 ? 'text-green-600' : 'text-red-500'}`}>
                      Spouse Age: {spouseAge} {spouseAge >= 62 ? '✓ Qualified' : '✗ Must be 62+'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Home Value</label>
              <input
                type="number"
                value={formData.home_value}
                onChange={(e) => setFormData({...formData, home_value: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="450000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mortgage Balance</label>
              <input
                type="number"
                value={formData.mortgage_balance}
                onChange={(e) => setFormData({...formData, mortgage_balance: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="125000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Desired Proceeds</label>
              <input
                type="number"
                value={formData.desired_proceeds}
                onChange={(e) => setFormData({...formData, desired_proceeds: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="200000"
              />
            </div>
          </div>

          {/* Lead Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lead Source</label>
              <select
                value={formData.lead_source}
                onChange={(e) => setFormData({...formData, lead_source: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select source</option>
                <option value="Forward Referral">Forward Referral</option>
                <option value="Referral">Referral</option>
                <option value="Mailer">Mailer</option>
                <option value="Cold Call">Cold Call</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assign to Loan Officer</label>
              <select
                value={formData.assigned_loan_officer_id}
                onChange={(e) => setFormData({...formData, assigned_loan_officer_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select loan officer</option>
                <option value="jeremiah_sherer">Jeremiah Sherer</option>
                <option value="christian_ford">Christian Ford</option>
                <option value="jon_ford">Jon Ford</option>
                <option value="ahmed_samura">Ahmed Samura</option>
                <option value="ryan_sterling">Ryan Sterling</option>
                <option value="spencer_kline">Spencer Kline</option>
              </select>
            </div>
          </div>

          {/* Qualification Status */}
          {(formData.date_of_birth || formData.spouse_date_of_birth) && (
            <div className={`p-3 rounded-md ${checkEligibility() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <span className={`text-sm font-medium ${checkEligibility() ? 'text-green-800' : 'text-red-800'}`}>
                {checkEligibility() ? '✓ QUALIFIED - All borrowers meet age requirement' : '✗ NOT QUALIFIED - All borrowers must be 62 or older'}
              </span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Client
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
