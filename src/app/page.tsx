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
  home_value?: number
  program_type?: string
  pipeline_status?: string
  created_at?: string
}

// Industry PLF Tables - Real calculations
const EQUITY_PLUS_PLF: Record<number, { "Equity Plus": number; "Equity Plus Peak": number; "Equity Plus LOC": number }> = {
  55: { "Equity Plus": 0.338, "Equity Plus Peak": 0.391, "Equity Plus LOC": 0.338 },
  56: { "Equity Plus": 0.342, "Equity Plus Peak": 0.395, "Equity Plus LOC": 0.342 },
  57: { "Equity Plus": 0.346, "Equity Plus Peak": 0.399, "Equity Plus LOC": 0.346 },
  58: { "Equity Plus": 0.350, "Equity Plus Peak": 0.403, "Equity Plus LOC": 0.350 },
  59: { "Equity Plus": 0.354, "Equity Plus Peak": 0.407, "Equity Plus LOC": 0.354 },
  60: { "Equity Plus": 0.358, "Equity Plus Peak": 0.411, "Equity Plus LOC": 0.358 },
  61: { "Equity Plus": 0.362, "Equity Plus Peak": 0.415, "Equity Plus LOC": 0.362 },
  62: { "Equity Plus": 0.366, "Equity Plus Peak": 0.419, "Equity Plus LOC": 0.366 },
  63: { "Equity Plus": 0.370, "Equity Plus Peak": 0.423, "Equity Plus LOC": 0.370 },
  64: { "Equity Plus": 0.374, "Equity Plus Peak": 0.427, "Equity Plus LOC": 0.374 },
  65: { "Equity Plus": 0.378, "Equity Plus Peak": 0.431, "Equity Plus LOC": 0.378 },
  66: { "Equity Plus": 0.382, "Equity Plus Peak": 0.435, "Equity Plus LOC": 0.382 },
  67: { "Equity Plus": 0.386, "Equity Plus Peak": 0.439, "Equity Plus LOC": 0.386 },
  68: { "Equity Plus": 0.390, "Equity Plus Peak": 0.443, "Equity Plus LOC": 0.390 },
  69: { "Equity Plus": 0.394, "Equity Plus Peak": 0.447, "Equity Plus LOC": 0.394 },
  70: { "Equity Plus": 0.396, "Equity Plus Peak": 0.447, "Equity Plus LOC": 0.396 },
  95: { "Equity Plus": 0.396, "Equity Plus Peak": 0.447, "Equity Plus LOC": 0.396 }
}

export default function NextStepCRM() {
  const [clients, setClients] = useState<Client[]>([])
  const [showAddClient, setShowAddClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showProgramComparison, setShowProgramComparison] = useState<Client | null>(null)
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
    return Math.max(age, 55) // Minimum age 55 for reverse mortgages
  }

  // Enhanced PLF calculation with all programs
  const calculateProgramComparison = (client: Client) => {
    const age = calculateAge(client.date_of_birth)
    const homeValue = client.home_value || 0
    const ageKey = Math.min(age, 95) as keyof typeof EQUITY_PLUS_PLF
    
    const programs = [
      {
        name: 'HECM',
        description: 'Government Program',
        plf: age >= 70 ? 0.338 : age >= 65 ? 0.310 : 0.285,
        upb: homeValue * (age >= 70 ? 0.338 : age >= 65 ? 0.310 : 0.285),
        features: ['Lower Loan Limits', 'Mortgage Insurance Required', 'Government Backed', 'Lower Costs']
      },
      {
        name: 'Equity Plus',
        description: 'Standard Proprietary Program',
        plf: EQUITY_PLUS_PLF[ageKey]?.["Equity Plus"] || 0.338,
        upb: homeValue * (EQUITY_PLUS_PLF[ageKey]?.["Equity Plus"] || 0.338),
        features: ['Higher Loan Limits', 'No Mortgage Insurance', 'Faster Processing', 'Flexible Terms']
      },
      {
        name: 'Equity Plus Peak',
        description: 'Enhanced Proprietary Program',
        plf: EQUITY_PLUS_PLF[ageKey]?.["Equity Plus Peak"] || 0.391,
        upb: homeValue * (EQUITY_PLUS_PLF[ageKey]?.["Equity Plus Peak"] || 0.391),
        features: ['Highest Loan Amount', 'Premium Features', 'Best Rate Options', 'Maximum Benefits']
      },
      {
        name: 'Equity Plus LOC',
        description: 'Line of Credit Program',
        plf: EQUITY_PLUS_PLF[ageKey]?.["Equity Plus LOC"] || 0.338,
        upb: homeValue * (EQUITY_PLUS_PLF[ageKey]?.["Equity Plus LOC"] || 0.338),
        features: ['Flexible Access', 'Growth Feature', 'Pay as You Go', 'Reserve for Future']
      }
    ]

    const bestProgram = programs.reduce((best, current) => 
      current.upb > best.upb ? current : best
    )

    return { programs, bestProgram }
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

  const updateClient = () => {
    if (editingClient) {
      const updated = clients.map(c => c.id === editingClient.id ? editingClient : c)
      saveClients(updated)
      setEditingClient(null)
      alert('Client updated successfully!')
    }
  }

  const deleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id)
    saveClients(updated)
  }

  const calculateUPB = (homeValue: number, programType: string, age?: number) => {
    if (programType === 'HECM') {
      return homeValue * (age && age >= 70 ? 0.338 : age && age >= 65 ? 0.310 : 0.285)
    }
    const ageKey = Math.min(age || 62, 95) as keyof typeof EQUITY_PLUS_PLF
    const plfData = EQUITY_PLUS_PLF[ageKey]
    
    if (programType === 'Equity Plus Peak') return homeValue * (plfData?.["Equity Plus Peak"] || 0.391)
    if (programType === 'Equity Plus LOC') return homeValue * (plfData?.["Equity Plus LOC"] || 0.338)
    return homeValue * (plfData?.["Equity Plus"] || 0.338)
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
    const age = calculateAge(client.date_of_birth)
    return sum + calculateUPB(client.home_value || 0, client.program_type || 'HECM', age)
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
          {filteredClients.map((client) => {
            const age = calculateAge(client.date_of_birth)
            const upb = calculateUPB(client.home_value || 0, client.program_type || 'HECM', age)
            return (
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
                    <div className="font-bold text-blue-900">{formatCurrency(upb)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => setShowProgramComparison(client)}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Compare
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEditingClient(client)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteClient(client.id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
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

      {/* Program Comparison Modal */}
      {showProgramComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Program Comparison - {showProgramComparison.first_name} {showProgramComparison.last_name}
                </h2>
                <p className="text-gray-600">Age: {calculateAge(showProgramComparison.date_of_birth)} | Home Value: {formatCurrency(showProgramComparison.home_value || 0)}</p>
              </div>
              <button
                onClick={() => setShowProgramComparison(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {calculateProgramComparison(showProgramComparison).programs.map((program) => {
                const isBest = program.name === calculateProgramComparison(showProgramComparison).bestProgram.name
                return (
                  <div 
                    key={program.name}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      isBest 
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    {isBest && (
                      <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 text-center">
                        🏆 BEST OPTION
                      </div>
                    )}
                    
                    <h3 className="font-bold text-lg mb-2 text-gray-800">{program.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-600 mb-1">PLF Rate</div>
                        <div className="font-bold text-blue-900">{(program.plf * 100).toFixed(1)}%</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-xs text-green-600 mb-1">Max UPB</div>
                        <div className="font-bold text-green-900">{formatCurrency(program.upb)}</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {program.features.map((feature, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const updatedClient = { ...showProgramComparison, program_type: program.name }
                        const updated = clients.map(c => c.id === updatedClient.id ? updatedClient : c)
                        saveClients(updated)
                        setShowProgramComparison(null)
                        alert(`Updated ${updatedClient.first_name}'s program to ${program.name}`)
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
                )
              })}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
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
                    {calculateAge(showProgramComparison.date_of_birth)} years
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Client</h2>
            
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
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Client</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editingClient.first_name}
                    onChange={(e) => setEditingClient({...editingClient, first_name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={editingClient.date_of_birth}
                  onChange={(e) => setEditingClient({...editingClient, date_of_birth: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                  value={editingClient.program_type}
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

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setEditingClient(null)}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateClient}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Update Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-2xl p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{selectedClient.first_name} {selectedClient.last_name}</h2>
              <button onClick={() => setSelectedClient(null)}>
                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-semibold text-gray-800">{selectedClient.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-semibold text-gray-800">{selectedClient.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Home Value</div>
                  <div className="font-semibold text-gray-800">{formatCurrency(selectedClient.home_value || 0)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Program</div>
                  <div className="font-semibold text-gray-800">{selectedClient.program_type}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
