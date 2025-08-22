'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3 } from 'lucide-react'

// Initialize Supabase client
const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'
const supabase = createClient(supabaseUrl, supabaseKey)

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
  address?: string
  property_type?: string
  mortgage_balance?: number
  occupancy_status?: string
  program_type?: string
  pipeline_status?: string
  pipeline_date?: string
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

// UPDATED PLF Tables with CORRECT R3/PLF3 values from your HECM table
const HECM_PLF = {
  62: 0.339, 63: 0.346, 64: 0.353, 65: 0.361, 66: 0.368, 67: 0.376, 68: 0.384, 69: 0.392, 70: 0.397,
  71: 0.397, 72: 0.399, 73: 0.408, 74: 0.416, 75: 0.426, 76: 0.433, 77: 0.443, 78: 0.454, 79: 0.460,
  80: 0.472, 81: 0.483, 82: 0.496, 83: 0.508, 84: 0.521, 85: 0.535, 86: 0.548, 87: 0.563, 88: 0.575,
  89: 0.590, 90: 0.606, 91: 0.622, 92: 0.639, 93: 0.656, 94: 0.674, 95: 0.691
}

const EQUITY_PLUS_PLF = {
  55: 0.350, 56: 0.355, 57: 0.360, 58: 0.365, 59: 0.370, 60: 0.375, 61: 0.380, 62: 0.555, 63: 0.560,
  64: 0.565, 65: 0.570, 66: 0.575, 67: 0.580, 68: 0.585, 69: 0.590, 70: 0.595, 71: 0.600, 72: 0.605,
  73: 0.610, 74: 0.615, 75: 0.620, 76: 0.625, 77: 0.630, 78: 0.635, 79: 0.640, 80: 0.645, 81: 0.650,
  82: 0.655, 83: 0.660, 84: 0.665, 85: 0.670, 86: 0.675, 87: 0.680, 88: 0.685, 89: 0.690, 90: 0.695,
  91: 0.700, 92: 0.705, 93: 0.710, 94: 0.715, 95: 0.720
}

export default function NextStepCRM() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showProgramComparison, setShowProgramComparison] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client>({
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
    address: '',
    property_type: 'Single Family Residence',
    mortgage_balance: 0,
    occupancy_status: 'Primary Residence',
    program_type: 'HECM',
    pipeline_status: 'Proposal Out',
    pipeline_date: new Date().toISOString().split('T')[0]
  })

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
    address: '',
    property_type: 'Single Family Residence',
    mortgage_balance: 0,
    occupancy_status: 'Primary Residence',
    program_type: 'HECM',
    pipeline_status: 'Proposal Out',
    pipeline_date: new Date().toISOString().split('T')[0]
  })

  // Load clients from Supabase
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching clients:', error)
        return
      }

      setClients(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
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
    return age
  }

  // Get youngest borrower age (required for PLF calculations)
  const getYoungestAge = (client: Client): number => {
    const primaryAge = calculateAge(client.date_of_birth)
    if (!client.spouse_date_of_birth) return primaryAge
    const spouseAge = calculateAge(client.spouse_date_of_birth)
    return Math.min(primaryAge, spouseAge)
  }

  // Validate program eligibility based on age
  const validateProgramEligibility = (age: number, programType: string): { eligible: boolean; message?: string } => {
    if (programType === 'HECM' && age < 62) {
      return { eligible: false, message: `HECM requires minimum age 62. Current youngest borrower is ${age}.` }
    }
    if ((programType === 'Equity Plus Standard' || programType === 'Equity Plus Extra') && age < 55) {
      return { eligible: false, message: `Equity Plus requires minimum age 55. Current youngest borrower is ${age}.` }
    }
    return { eligible: true }
  }

  // Validate property eligibility
  const validatePropertyEligibility = (propertyType: string, occupancyStatus: string): { eligible: boolean; message?: string } => {
    if (occupancyStatus !== 'Primary Residence') {
      return { eligible: false, message: 'Reverse mortgages require primary residence occupancy.' }
    }
    if (propertyType === 'Investment Property') {
      return { eligible: false, message: 'Investment properties are not eligible for reverse mortgages.' }
    }
    return { eligible: true }
  }

  // Calculate net proceeds (what client actually receives)
  const calculateNetProceeds = (upb: number, currentMortgage: number, programType: string): number => {
    const estimatedCosts = {
      'HECM': 8000,
      'Equity Plus Standard': 12000,
      'Equity Plus Extra': 12000,
      'Equity Plus Select': 12000
    }
    
    const closingCosts = estimatedCosts[programType as keyof typeof estimatedCosts] || 8000
    return Math.max(0, upb - currentMortgage - closingCosts)
  }

  // Calculate days in current stage
  const calculateDaysInStage = (pipelineDate?: string): number => {
    if (!pipelineDate) return 0
    const stageDate = new Date(pipelineDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - stageDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Get pipeline stage color
  const getPipelineStageColor = (status?: string): string => {
    const stage = PIPELINE_STAGES.find(s => s.value === status)
    return stage?.color || 'bg-gray-100 border-gray-300 text-gray-800'
  }

  // Get pipeline stage label
  const getPipelineStageLabel = (status?: string): string => {
    const stage = PIPELINE_STAGES.find(s => s.value === status)
    return stage?.label || status || 'Unknown'
  }

  // Calculate UPB based on program type and age
  const calculateUPB = (homeValue: number, programType: string, age: number): number => {
    const ageKey = Math.min(age, 95) as keyof typeof HECM_PLF
    
    let plf = 0
    if (programType === 'HECM') {
      plf = HECM_PLF[ageKey] || 0.339
    } else {
      plf = EQUITY_PLUS_PLF[ageKey] || 0.350
    }
    
    const lendingLimit = programType === 'HECM' ? 1149825 : 4000000
    const effectiveValue = Math.min(homeValue, lendingLimit)
    
    return effectiveValue * plf
  }

  // Enhanced PLF calculation with all programs
  const calculateProgramComparison = (client: Client) => {
    const age = getYoungestAge(client)
    const homeValue = client.home_value || 0
    const ageKey = Math.min(age, 95) as keyof typeof EQUITY_PLUS_PLF
    const currentMortgage = client.mortgage_balance || 0

    const programs = [
      {
        name: 'HECM',
        plf: HECM_PLF[ageKey as keyof typeof HECM_PLF] || 0.339,
        lendingLimit: 1149825,
        description: 'FHA-insured reverse mortgage'
      },
      {
        name: 'Equity Plus Standard',
        plf: EQUITY_PLUS_PLF[ageKey] || 0.350,
        lendingLimit: 4000000,
        description: 'Standard proprietary reverse mortgage'
      },
      {
        name: 'Equity Plus Extra',
        plf: (EQUITY_PLUS_PLF[ageKey] || 0.350) * 1.1,
        lendingLimit: 4000000,
        description: 'Enhanced proprietary option'
      },
      {
        name: 'Equity Plus Select',
        plf: (EQUITY_PLUS_PLF[ageKey] || 0.350) * 1.05,
        lendingLimit: 4000000,
        description: 'Premium proprietary option'
      }
    ]

    return programs.map(program => {
      const effectiveValue = Math.min(homeValue, program.lendingLimit)
      const upb = effectiveValue * program.plf
      const netProceeds = calculateNetProceeds(upb, currentMortgage, program.name)
      
      return {
        ...program,
        upb,
        netProceeds,
        effectiveValue
      }
    })
  }

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Add new client to Supabase
  const addClient = async () => {
    if (newClient.first_name && newClient.last_name) {
      try {
        const clientData = {
          ...newClient,
          pipeline_date: newClient.pipeline_date || new Date().toISOString().split('T')[0]
        }

        const { data, error } = await supabase
          .from('clients')
          .insert([clientData])
          .select()

        if (error) {
          console.error('Error adding client:', error)
          alert('Error adding client. Please try again.')
          return
        }

        // Refresh the clients list
        await fetchClients()
        
        // Reset form
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
          address: '',
          property_type: 'Single Family Residence',
          mortgage_balance: 0,
          occupancy_status: 'Primary Residence',
          program_type: 'HECM',
          pipeline_status: 'Proposal Out',
          pipeline_date: new Date().toISOString().split('T')[0]
        })
        setShowAddModal(false)
      } catch (error) {
        console.error('Error:', error)
        alert('Error adding client. Please try again.')
      }
    }
  }

  // Update client in Supabase
  const updateClient = async () => {
    try {
      const updateData = {
        ...editingClient,
        pipeline_date: editingClient.pipeline_date || new Date().toISOString().split('T')[0]
      }

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', editingClient.id)

      if (error) {
        console.error('Error updating client:', error)
        alert('Error updating client. Please try again.')
        return
      }

      // Refresh the clients list
      await fetchClients()
      setShowEditModal(false)
    } catch (error) {
      console.error('Error:', error)
      alert('Error updating client. Please try again.')
    }
  }

  // Delete client from Supabase
  const deleteClient = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting client:', error)
          alert('Error deleting client. Please try again.')
          return
        }

        // Refresh the clients list
        await fetchClients()
      } catch (error) {
        console.error('Error:', error)
        alert('Error deleting client. Please try again.')
      }
    }
  }

  // Filter clients
  const filteredClients = clients.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  )

  // Calculate stats
  const totalPipeline = clients.reduce((sum, client) => {
    const age = getYoungestAge(client)
    return sum + calculateUPB(client.home_value || 0, client.program_type || 'HECM', age)
  }, 0)

  const activePipeline = clients.filter(c => c.pipeline_status !== 'Funded').length
  const fundedLoans = clients.filter(c => c.pipeline_status === 'Funded').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-green-400 flex items-center justify-center">
        <div className="text-white text-2xl">Loading your CRM...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-green-400">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Next Step CRM</h1>
          <p className="text-blue-100">Professional Reverse Mortgage Management</p>
          <p className="text-blue-200 text-sm">💎 Database-Powered</p>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Clients</p>
                <p className="text-3xl font-bold">{clients.length}</p>
              </div>
              <User className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Active Pipeline</p>
                <p className="text-3xl font-bold">{activePipeline}</p>
              </div>
              <Calculator className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Funded Loans</p>
                <p className="text-3xl font-bold">{fundedLoans}</p>
              </div>
              <DollarSign className="w-12 h-12 text-yellow-200" />
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Pipeline</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPipeline)}</p>
              </div>
              <HomeIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-0 bg-white bg-opacity-20 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:bg-opacity-30"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-2xl transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const age = getYoungestAge(client)
            const upb = calculateUPB(client.home_value || 0, client.program_type || 'HECM', age)
            const netProceeds = calculateNetProceeds(upb, client.mortgage_balance || 0, client.program_type || 'HECM')
            const ageEligibility = validateProgramEligibility(age, client.program_type || 'HECM')
            const propertyEligibility = validatePropertyEligibility(client.property_type || 'Single Family Residence', client.occupancy_status || 'Primary Residence')
            const daysInStage = calculateDaysInStage(client.pipeline_date)
            const stageColor = getPipelineStageColor(client.pipeline_status)

            return (
              <div key={client.id} className={`bg-white bg-opacity-20 rounded-2xl p-6 text-white backdrop-blur-lg border-l-4 ${stageColor}`}>
                {/* Pipeline Status Header */}
                <div className={`-mx-6 -mt-6 mb-4 px-6 py-3 rounded-t-2xl ${stageColor.replace('border-l-4', '')}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{getPipelineStageLabel(client.pipeline_status)}</span>
                    <span className="text-xs">{daysInStage} days in stage</span>
                  </div>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {client.first_name} {client.last_name}
                      {client.spouse_first_name && (
                        <span className="text-sm font-normal"> & {client.spouse_first_name}</span>
                      )}
                    </h3>
                    <p className="text-gray-200 text-sm">
                      Youngest Borrower: <span className="font-semibold">{age} years</span>
                    </p>
                    {client.address && (
                      <p className="text-gray-200 text-sm mt-1">{client.address}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-300">💰 {formatCurrency(netProceeds)}</p>
                    <p className="text-xs text-gray-300">Est. Net Proceeds</p>
                    <p className="text-sm text-gray-200">Max UPB: {formatCurrency(upb)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-200 mb-4">
                  <span className="flex items-center">
                    <HomeIcon className="w-4 h-4 mr-1" />
                    {client.property_type} • {client.occupancy_status}
                  </span>
                  <span>{formatCurrency(client.home_value || 0)}</span>
                </div>

                {/* Property and Eligibility Warnings */}
                {(!ageEligibility.eligible || !propertyEligibility.eligible) && (
                  <div className="mb-4 space-y-2">
                    {!ageEligibility.eligible && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                        ⚠️ Eligibility Issues<br/>{ageEligibility.message}
                      </div>
                    )}
                    {!propertyEligibility.eligible && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                        ⚠️ {propertyEligibility.message}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => setShowProgramComparison(client)}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Compare
                  </button>
                  <button
                    onClick={() => {
                      setEditingClient(client)
                      setShowEditModal(true)
                    }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteClient(client.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                  {client.address && (
                    <a
                      href={`https://www.zillow.com/homes/${encodeURIComponent(client.address)}_rb/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center text-sm"
                      title="View on Zillow"
                    >
                      🏠
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Client</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={newClient.first_name}
                      onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={newClient.last_name}
                      onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={newClient.date_of_birth}
                    onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home Value *</label>
                    <input
                      type="number"
                      value={newClient.home_value || ''}
                      onChange={(e) => setNewClient({...newClient, home_value: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter home value"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                    <input
                      type="number"
                      value={newClient.mortgage_balance || ''}
                      onChange={(e) => setNewClient({...newClient, mortgage_balance: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current mortgage balance"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={addClient}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  Add Client
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Client</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={editingClient.first_name}
                      onChange={(e) => setEditingClient({...editingClient, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={editingClient.last_name}
                      onChange={(e) => setEditingClient({...editingClient, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home Value *</label>
                    <input
                      type="number"
                      value={editingClient.home_value || ''}
                      onChange={(e) => setEditingClient({...editingClient, home_value: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter home value"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                    <input
                      type="number"
                      value={editingClient.mortgage_balance || ''}
                      onChange={(e) => setEditingClient({...editingClient, mortgage_balance: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current mortgage balance"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                  <select
                    value={editingClient.pipeline_status}
                    onChange={(e) => setEditingClient({...editingClient, pipeline_status: e.target.value, pipeline_date: new Date().toISOString().split('T')[0]})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PIPELINE_STAGES.map(stage => (
                      <option key={stage.value} value={stage.value}>{stage.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={updateClient}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  Update Client
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Client Modal */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedClient.first_name} {selectedClient.last_name}</h2>
                  {selectedClient.spouse_first_name && (
                    <p className="text-gray-600">& {selectedClient.spouse_first_name} {selectedClient.spouse_last_name}</p>
                  )}
                </div>
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
                    <div className="font-semibold text-gray-800">{selectedClient.email || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="font-semibold text-gray-800">{selectedClient.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Date of Birth</div>
                    <div className="font-semibold text-gray-800">{selectedClient.date_of_birth} (Age: {calculateAge(selectedClient.date_of_birth)})</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Program Type</div>
                    <div className="font-semibold text-gray-800">{selectedClient.program_type}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Client Age</div>
                    <div className="font-semibold text-blue-600">{getYoungestAge(selectedClient)} years</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Home Value</div>
                    <div className="font-semibold text-green-600">{formatCurrency(selectedClient.home_value || 0)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Current Mortgage</div>
                    <div className="font-semibold text-red-600">{formatCurrency(selectedClient.mortgage_balance || 0)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Est. Net Proceeds</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(calculateNetProceeds(
                        calculateUPB(selectedClient.home_value || 0, selectedClient.program_type || 'HECM', getYoungestAge(selectedClient)),
                        selectedClient.mortgage_balance || 0,
                        selectedClient.program_type || 'HECM'
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Estimated UPB</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(calculateUPB(selectedClient.home_value || 0, selectedClient.program_type || 'HECM', getYoungestAge(selectedClient)))}
                  </div>
                  <div className="text-sm text-gray-500">Based on {selectedClient.program_type} program for youngest borrower age {getYoungestAge(selectedClient)}</div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Program Comparison Modal */}
        {showProgramComparison && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Program Comparison</h2>
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
                {calculateProgramComparison(showProgramComparison).map((program, index) => {
                  const isCurrentProgram = program.name === showProgramComparison.program_type
                  const isBestProgram = index === calculateProgramComparison(showProgramComparison).reduce((bestIndex, current, currentIndex, array) => 
                    current.netProceeds > array[bestIndex].netProceeds ? currentIndex : bestIndex, 0)
                  
                  return (
                    <div key={program.name} className={`p-4 rounded-lg border-2 ${
                      isBestProgram ? 'border-green-500 bg-green-50' : 
                      isCurrentProgram ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800">{program.name}</h3>
                        {isBestProgram && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">🏆 BEST OPTION</span>}
                        {isCurrentProgram && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">CURRENT</span>}
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-xs text-blue-600 mb-1">PLF Rate</div>
                          <div className="font-bold text-blue-800">{(program.plf * 100).toFixed(2)}%</div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="text-xs text-purple-600 mb-1">Gross UPB</div>
                          <div className="font-bold text-purple-800">{formatCurrency(program.upb)}</div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-xs text-green-600 mb-1">Net Proceeds</div>
                          <div className="font-bold text-green-800">{formatCurrency(program.netProceeds)}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-3">{program.description}</div>
                      
                      <button
                        onClick={async () => {
                          const updatedClient = {...showProgramComparison, program_type: program.name}
                          try {
                            const { error } = await supabase
                              .from('clients')
                              .update({ program_type: program.name })
                              .eq('id', updatedClient.id)

                            if (error) {
                              console.error('Error updating program:', error)
                              return
                            }

                            await fetchClients()
                            setShowProgramComparison(null)
                          } catch (error) {
                            console.error('Error:', error)
                          }
                        }}
                        className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                          isCurrentProgram 
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                        disabled={isCurrentProgram}
                      >
                        {isCurrentProgram ? 'Current Program' : 'Select Program'}
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowProgramComparison(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-lg transition-colors font-medium"
                >
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
