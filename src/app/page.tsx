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
  property_type?: string
  current_mortgage_balance?: number
  occupancy_status?: string
  program_type?: string
  pipeline_status?: string
  pipeline_date?: string
  days_in_stage?: number
  created_at?: string
}

// Pipeline stages with colors
const PIPELINE_STAGES = [
  { value: 'Proposal Out', label: 'Proposal Out/Pitched', color: 'bg-sky-100 border-sky-300 text-sky-800' },
  { value: 'Counseling Scheduled', label: 'Counseling Scheduled', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { value: 'Counseling In', label: 'Counseling In', color: 'bg-teal-100 border-teal-300 text-teal-800' },
  { value: 'Docs Out', label: 'Docs Out', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { value: 'Docs In', label: 'Docs In', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { value: 'Submitted to Processing', label: 'Submitted to Processing', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { value: 'Appraisal Ordered', label: 'Appraisal Ordered', color: 'bg-pink-100 border-pink-300 text-pink-800' },
  { value: 'Appraisal In', label: 'Appraisal In', color: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800' },
  { value: 'Submit to UW', label: 'Submit to UW', color: 'bg-red-100 border-red-300 text-red-800' },
  { value: 'Conditional Approval', label: 'Conditional Approval', color: 'bg-lime-100 border-lime-300 text-lime-800' },
  { value: 'CTC', label: 'CTC', color: 'bg-green-100 border-green-300 text-green-800' },
  { value: 'Funded', label: 'Funded', color: 'bg-gray-100 border-gray-300 text-gray-800' }
]
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
    spouse_first_name: '',
    spouse_last_name: '',
    spouse_date_of_birth: '',
    home_value: 0,
    property_type: 'Single Family Residence',
    current_mortgage_balance: 0,
    occupancy_status: 'Primary Residence',
    program_type: 'HECM',
    pipeline_status: 'Proposal Out',
    pipeline_date: new Date().toISOString().split('T')[0]
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

  // Get youngest borrower age (critical for PLF calculations)
  const getYoungestAge = (client: Client): number => {
    const primaryAge = calculateAge(client.date_of_birth)
    if (!client.spouse_date_of_birth) return primaryAge
    
    const spouseAge = calculateAge(client.spouse_date_of_birth)
    return Math.min(primaryAge, spouseAge)
  }

  // Validate program eligibility based on age
  const validateProgramEligibility = (age: number, programType: string): { eligible: boolean; message?: string } => {
    if (programType === 'HECM' && age < 62) {
      return { eligible: false, message: 'HECM requires minimum age 62' }
    }
    if (programType !== 'HECM' && age < 55) {
      return { eligible: false, message: 'Proprietary programs require minimum age 55' }
    }
    return { eligible: true }
  }

  // Calculate net proceeds (what client actually receives)
  const calculateNetProceeds = (upb: number, currentMortgage: number, programType: string): number => {
    // Estimated closing costs by program type
    const estimatedCosts = {
      'HECM': upb * 0.025 + 2500, // 2.5% + $2500 (FHA MIP, origination, etc.)
      'Equity Plus': upb * 0.02 + 3000, // 2% + $3000 (title, appraisal, etc.)
      'Equity Plus Peak': upb * 0.025 + 3500, // 2.5% + $3500 (premium program costs)
      'Equity Plus LOC': upb * 0.02 + 3000, // 2% + $3000 (similar to standard)
    }
    
    const costs = estimatedCosts[programType as keyof typeof estimatedCosts] || estimatedCosts['HECM']
    return Math.max(0, upb - currentMortgage - costs)
  }

  // Validate property eligibility
  const validatePropertyEligibility = (propertyType: string, occupancyStatus: string): { eligible: boolean; message?: string } => {
    if (occupancyStatus !== 'Primary Residence') {
      return { eligible: false, message: 'Must be primary residence for reverse mortgage' }
    }
    if (propertyType === 'Investment Property' || propertyType === 'Second Home') {
      return { eligible: false, message: 'Investment/second homes not eligible' }
    }
    return { eligible: true }
  }

  // Enhanced PLF calculation with all programs
  const calculateProgramComparison = (client: Client) => {
    const age = getYoungestAge(client)
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
        created_at: new Date().toISOString(),
        pipeline_date: newClient.pipeline_date || new Date().toISOString().split('T')[0]
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
        spouse_first_name: '',
        spouse_last_name: '',
        spouse_date_of_birth: '',
        home_value: 0,
        property_type: 'Single Family Residence',
        current_mortgage_balance: 0,
        occupancy_status: 'Primary Residence',
        program_type: 'HECM',
        pipeline_status: 'Proposal Out',
        pipeline_date: new Date().toISOString().split('T')[0]
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
    const age = getYoungestAge(client)
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
        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-white/80">Active Pipeline</p>
                <p className="text-3xl font-bold">{clients.filter(c => c.pipeline_status !== 'Funded').length}</p>
              </div>
              <Phone className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">Funded This Month</p>
                <p className="text-3xl font-bold">{clients.filter(c => c.pipeline_status === 'Funded').length}</p>
              </div>
              <Calculator className="w-8 h-8 text-white/60" />
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
            const age = getYoungestAge(client)
            const upb = calculateUPB(client.home_value || 0, client.program_type || 'HECM', age)
            const netProceeds = calculateNetProceeds(upb, client.current_mortgage_balance || 0, client.program_type || 'HECM')
            const ageEligibility = validateProgramEligibility(age, client.program_type || 'HECM')
            const propertyEligibility = validatePropertyEligibility(client.property_type || 'Single Family Residence', client.occupancy_status || 'Primary Residence')
            const daysInStage = calculateDaysInStage(client.pipeline_date)
            const stageColor = getPipelineStageColor(client.pipeline_status)
            
            return (
              <div key={client.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                {/* Color-coded pipeline status header */}
                <div className={`p-4 border-l-4 ${stageColor}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm">{getPipelineStageLabel(client.pipeline_status)}</div>
                      <div className="text-xs opacity-75">
                        {daysInStage} days in stage
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium">Youngest Borrower</div>
                      <div className="text-lg font-bold">{age} years</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {client.first_name} {client.last_name}
                    </h3>
                    {client.spouse_first_name && (
                      <p className="text-sm text-gray-600">
                        & {client.spouse_first_name} {client.spouse_last_name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">{client.property_type} • {client.occupancy_status}</p>
                  </div>

                  {(!ageEligibility.eligible || !propertyEligibility.eligible) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="text-red-700 text-sm font-medium">⚠️ Eligibility Issues</div>
                      {!ageEligibility.eligible && <div className="text-red-600 text-xs">{ageEligibility.message}</div>}
                      {!propertyEligibility.eligible && <div className="text-red-600 text-xs">{propertyEligibility.message}</div>}
                    </div>
                  )}

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
                      <div className="text-xs text-blue-600 mb-1">Max UPB</div>
                      <div className="font-bold text-blue-900">{formatCurrency(upb)}</div>
                    </div>
                  </div>

                  {/* Enhanced Financial Display */}
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-green-600 mb-1">💰 Est. Net Proceeds</div>
                    <div className="font-bold text-green-900 text-lg">{formatCurrency(netProceeds)}</div>
                    {client.current_mortgage_balance && client.current_mortgage_balance > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        After paying off ${formatCurrency(client.current_mortgage_balance)} mortgage
                      </div>
                    )}
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
                <p className="text-gray-600">Age: {getYoungestAge(showProgramComparison)} | Home Value: {formatCurrency(showProgramComparison.home_value || 0)}</p>
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
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Max UPB</div>
                        <div className="font-bold text-gray-900">{formatCurrency(program.upb)}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-xs text-green-600 mb-1">💰 Net Proceeds</div>
                        <div className="font-bold text-green-900">
                          {formatCurrency(calculateNetProceeds(program.upb, showProgramComparison.current_mortgage_balance || 0, program.name))}
                        </div>
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
                    {getYoungestAge(showProgramComparison)} years
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={newClient.date_of_birth}
                  onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Spouse Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spouse Information (Optional)</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spouse First Name</label>
                    <input
                      type="text"
                      value={newClient.spouse_first_name || ''}
                      onChange={(e) => setNewClient({...newClient, spouse_first_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Last Name</label>
                    <input
                      type="text"
                      value={newClient.spouse_last_name || ''}
                      onChange={(e) => setNewClient({...newClient, spouse_last_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                  <input
                    type="date"
                    value={newClient.spouse_date_of_birth || ''}
                    onChange={(e) => setNewClient({...newClient, spouse_date_of_birth: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Youngest borrower age determines PLF calculation
                  </p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Value *</label>
                <input
                  type="number"
                  value={newClient.home_value || ''}
                  onChange={(e) => setNewClient({...newClient, home_value: Number(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Property Details Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Property & Loan Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                    <select
                      value={newClient.property_type || 'Single Family Residence'}
                      onChange={(e) => setNewClient({...newClient, property_type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Single Family Residence">Single Family Residence</option>
                      <option value="Condominium">Condominium</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Manufactured Home">Manufactured Home</option>
                      <option value="2-4 Unit Property">2-4 Unit Property</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupancy Status *</label>
                    <select
                      value={newClient.occupancy_status || 'Primary Residence'}
                      onChange={(e) => setNewClient({...newClient, occupancy_status: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Primary Residence">Primary Residence</option>
                      <option value="Second Home">Second Home</option>
                      <option value="Investment Property">Investment Property</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={newClient.current_mortgage_balance || ''}
                    onChange={(e) => setNewClient({...newClient, current_mortgage_balance: Number(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 0 if no existing mortgage"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Used to calculate net proceeds (amount client receives)
                  </p>
                </div>
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
                {newClient.date_of_birth && (() => {
                  const age = getYoungestAge(newClient)
                  const eligibility = validateProgramEligibility(age, newClient.program_type || 'HECM')
                  return !eligibility.eligible ? (
                    <p className="text-red-600 text-xs mt-1">⚠️ {eligibility.message}</p>
                  ) : null
                })()}
              </div>

              {/* Pipeline Stage Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Stage *</label>
                    <select
                      value={newClient.pipeline_status}
                      onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PIPELINE_STAGES.map(stage => (
                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stage Date</label>
                    <input
                      type="date"
                      value={newClient.pipeline_date || ''}
                      onChange={(e) => setNewClient({...newClient, pipeline_date: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      📊 Used to track days in current stage
                    </p>
                  </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={editingClient.date_of_birth}
                  onChange={(e) => setEditingClient({...editingClient, date_of_birth: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Spouse Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spouse Information (Optional)</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spouse First Name</label>
                    <input
                      type="text"
                      value={editingClient.spouse_first_name || ''}
                      onChange={(e) => setEditingClient({...editingClient, spouse_first_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Last Name</label>
                    <input
                      type="text"
                      value={editingClient.spouse_last_name || ''}
                      onChange={(e) => setEditingClient({...editingClient, spouse_last_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                  <input
                    type="date"
                    value={editingClient.spouse_date_of_birth || ''}
                    onChange={(e) => setEditingClient({...editingClient, spouse_date_of_birth: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Youngest borrower age determines PLF calculation
                  </p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Value *</label>
                <input
                  type="number"
                  value={editingClient.home_value || ''}
                  onChange={(e) => setEditingClient({...editingClient, home_value: Number(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Property Details Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Property & Loan Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                    <select
                      value={editingClient.property_type || 'Single Family Residence'}
                      onChange={(e) => setEditingClient({...editingClient, property_type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Single Family Residence">Single Family Residence</option>
                      <option value="Condominium">Condominium</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Manufactured Home">Manufactured Home</option>
                      <option value="2-4 Unit Property">2-4 Unit Property</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupancy Status *</label>
                    <select
                      value={editingClient.occupancy_status || 'Primary Residence'}
                      onChange={(e) => setEditingClient({...editingClient, occupancy_status: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Primary Residence">Primary Residence</option>
                      <option value="Second Home">Second Home</option>
                      <option value="Investment Property">Investment Property</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                  <input
                    type="number"
                    value={editingClient.current_mortgage_balance || ''}
                    onChange={(e) => setEditingClient({...editingClient, current_mortgage_balance: Number(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 0 if no existing mortgage"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Used to calculate net proceeds (amount client receives)
                  </p>
                </div>
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
                {(() => {
                  const age = getYoungestAge(editingClient)
                  const eligibility = validateProgramEligibility(age, editingClient.program_type || 'HECM')
                  return !eligibility.eligible ? (
                    <p className="text-red-600 text-xs mt-1">⚠️ {eligibility.message}</p>
                  ) : null
                })()}
              </div>

              {/* Pipeline Stage Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Stage *</label>
                    <select
                      value={editingClient.pipeline_status}
                      onChange={(e) => setEditingClient({...editingClient, pipeline_status: e.target.value, pipeline_date: new Date().toISOString().split('T')[0]})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PIPELINE_STAGES.map(stage => (
                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stage Date</label>
                    <input
                      type="date"
                      value={editingClient.pipeline_date || ''}
                      onChange={(e) => setEditingClient({...editingClient, pipeline_date: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      📊 Auto-updates when stage changes
                    </p>
                  </div>
                </div>
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
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedClient.first_name} {selectedClient.last_name}</h2>
                {selectedClient.spouse_first_name && (
                  <p className="text-lg text-gray-600">& {selectedClient.spouse_first_name} {selectedClient.spouse_last_name}</p>
                )}
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Youngest Borrower: {getYoungestAge(selectedClient)} years
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)}>
                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Pipeline Status Section */}
              <div className={`p-4 rounded-lg border-l-4 ${getPipelineStageColor(selectedClient.pipeline_status)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Current Pipeline Stage</h3>
                    <p className="text-lg font-bold">{getPipelineStageLabel(selectedClient.pipeline_status)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-75">Days in Stage</div>
                    <div className="text-2xl font-bold">{calculateDaysInStage(selectedClient.pipeline_date)}</div>
                  </div>
                </div>
                {selectedClient.pipeline_date && (
                  <p className="text-sm opacity-75 mt-2">
                    Stage entered: {new Date(selectedClient.pipeline_date).toLocaleDateString()}
                  </p>
                )}
              </div>

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
                  <div className="text-sm text-gray-600">Property Type</div>
                  <div className="font-semibold text-gray-800">{selectedClient.property_type || 'Single Family Residence'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Occupancy</div>
                  <div className="font-semibold text-gray-800">{selectedClient.occupancy_status || 'Primary Residence'}</div>
                </div>
              </div>

              {/* Financial Breakdown Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Analysis</h3>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Home Value</div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(selectedClient.home_value || 0)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Current Mortgage</div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(selectedClient.current_mortgage_balance || 0)}</div>
                    </div>
                  </div>
                  
                  {(() => {
                    const age = getYoungestAge(selectedClient)
                    const upb = calculateUPB(selectedClient.home_value || 0, selectedClient.program_type || 'HECM', age)
                    const netProceeds = calculateNetProceeds(upb, selectedClient.current_mortgage_balance || 0, selectedClient.program_type || 'HECM')
                    const estimatedCosts = upb - netProceeds - (selectedClient.current_mortgage_balance || 0)
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Maximum UPB ({selectedClient.program_type})</span>
                          <span className="font-semibold">{formatCurrency(upb)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Less: Current Mortgage</span>
                          <span className="font-semibold text-red-600">-{formatCurrency(selectedClient.current_mortgage_balance || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Less: Est. Closing Costs</span>
                          <span className="font-semibold text-red-600">-{formatCurrency(estimatedCosts)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 bg-green-100 rounded-lg px-3">
                          <span className="font-semibold text-green-800">💰 Net Proceeds to Client</span>
                          <span className="text-xl font-bold text-green-900">{formatCurrency(netProceeds)}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Borrower Ages Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Borrower Ages</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600">Primary Borrower</div>
                    <div className="font-bold text-blue-900">{calculateAge(selectedClient.date_of_birth)} years</div>
                  </div>
                  {selectedClient.spouse_date_of_birth && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-sm text-green-600">Spouse</div>
                      <div className="font-bold text-green-900">{calculateAge(selectedClient.spouse_date_of_birth)} years</div>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  💡 PLF calculation uses youngest borrower age: <span className="font-semibold">{getYoungestAge(selectedClient)} years</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
