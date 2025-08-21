'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calculator, Filter, Edit2, Eye, X, User } from 'lucide-react'

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  home_value?: number
  program_type?: string
  pipeline_status?: string
  created_at?: string
}

export default function NextStepCRM() {
  const [clients, setClients] = useState<Client[]>([])
  const [showAddClient, setShowAddClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [newClient, setNewClient] = useState<Client>({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    home_value: 0,
    program_type: 'HECM',
    pipeline_status: 'New Lead'
  })

  // GUARANTEED SAVING - Load on start
  useEffect(() => {
    const saved = localStorage.getItem('crm_clients')
    if (saved) {
      try {
        setClients(JSON.parse(saved))
      } catch (e) {
        console.log('Error loading:', e)
      }
    }
  }, [])

  // GUARANTEED SAVING - Save every change
  const saveClients = (clientList: Client[]) => {
    localStorage.setItem('crm_clients', JSON.stringify(clientList))
    setClients(clientList)
  }

  const addClient = () => {
    if (newClient.first_name && newClient.last_name) {
      const client = {
        ...newClient,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      
      const updated = [...clients, client]
      saveClients(updated)
      
      setNewClient({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        home_value: 0,
        program_type: 'HECM',
        pipeline_status: 'New Lead'
      })
      setShowAddClient(false)
      alert('Client saved successfully!')
    }
  }

  const deleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id)
    saveClients(updated)
  }

  const testImport = () => {
    const testClient = {
      id: Date.now().toString(),
      first_name: 'Test',
      last_name: 'Lead',
      email: 'test@example.com',
      phone: '(555) 999-8888',
      date_of_birth: '1970-01-01',
      home_value: 500000,
      program_type: 'HECM',
      pipeline_status: 'GHL Import',
      created_at: new Date().toISOString()
    }
    
    const updated = [...clients, testClient]
    saveClients(updated)
    alert('Test lead imported and saved!')
  }

  const calculateUPB = (homeValue: number, programType: string) => {
    const plf = programType === 'HECM' ? 0.285 : 0.338
    return homeValue * plf
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalPipeline = clients.reduce((sum, client) => {
    return sum + calculateUPB(client.home_value || 0, client.program_type || 'HECM')
  }, 0)

  const filteredClients = clients.filter(client =>
    client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-500 to-teal-600">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Next Step CRM</h1>
                  <p className="text-blue-100">City First FHA Retirement</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <p className="text-lg font-bold text-white mb-1">Total UPB Pipeline</p>
                <p className="text-4xl font-black text-white">{formatCurrency(totalPipeline)}</p>
                <p className="text-sm text-blue-100 mt-2">{clients.length} Clients</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={testImport}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl transition-all"
              >
                🔗 Test Import
              </button>
              <button 
                onClick={() => setShowAddClient(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center gap-3"
              >
                <Plus className="w-6 h-6" />
                Add Client
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">Total Clients</p>
                <p className="text-3xl font-bold">{clients.length}</p>
              </div>
              <User className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">Pipeline Value</p>
                <p className="text-3xl font-bold">{formatCurrency(totalPipeline)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">New Leads</p>
                <p className="text-3xl font-bold">{clients.filter(c => c.pipeline_status?.includes('Lead')).length}</p>
              </div>
              <Phone className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/60" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {client.first_name} {client.last_name}
                  </h3>
                  <p className="text-gray-600 text-sm">{client.pipeline_status}</p>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Home Value</div>
                  <div className="font-bold text-gray-900">{formatCurrency(client.home_value || 0)}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-blue-600 mb-1">UPB</div>
                  <div className="font-bold text-blue-900">{formatCurrency(calculateUPB(client.home_value || 0, client.program_type || 'HECM'))}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => deleteClient(client.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white text-lg mb-4">No clients yet</div>
            <button 
              onClick={() => setShowAddClient(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
            >
              Add Your First Client
            </button>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Add New Client</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newClient.first_name}
                    onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newClient.last_name}
                    onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={newClient.date_of_birth}
                  onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  value={newClient.program_type}
                  onChange={(e) => setNewClient({...newClient, program_type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HECM">HECM</option>
                  <option value="Equity Plus">Equity Plus</option>
                  <option value="Equity Plus Peak">Equity Plus Peak</option>
                  <option value="Equity Plus LOC">Equity Plus LOC</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowAddClient(false)}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{selectedClient.first_name} {selectedClient.last_name}</h2>
              <button onClick={() => setSelectedClient(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
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
                  <div className="text-sm text-gray-600">Home Value</div>
                  <div className="font-semibold">{formatCurrency(selectedClient.home_value || 0)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Program</div>
                  <div className="font-semibold">{selectedClient.program_type}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
