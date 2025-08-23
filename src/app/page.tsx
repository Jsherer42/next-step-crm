'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Plus, Phone, Mail, Home as HomeIcon, DollarSign, Calculator, Filter, Edit2, Eye, X, User, BarChart3 } from 'lucide-react'

// Initialize Supabase client - ONLY THE API KEY WAS CHANGED
const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'

const supabase = createClient(supabaseUrl, supabaseKey)

export default function NextStepCRM() {
  const [clients, setClients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    spouse_first_name: '',
    spouse_last_name: '',
    spouse_date_of_birth: '',
    home_value: '',
    address: '',
    property_type: 'Single Family Residence',
    mortgage_balance: '',
    occupancy_status: 'Primary Residence',
    program_type: 'HECM',
    pipeline_status: 'Proposal Out',
    is_married: false,
    desired_proceeds: ''
  })

  // UPDATED PLF Tables with CORRECT values from your tables
  const HECM_PLF = {
    62: 0.339, 63: 0.346, 64: 0.353, 65: 0.361, 66: 0.368, 67: 0.376, 68: 0.384, 69: 0.392, 70: 0.397,
    71: 0.397, 72: 0.399, 73: 0.408, 74: 0.416, 75: 0.426, 76: 0.433, 77: 0.441, 78: 0.449, 79: 0.457,
    80: 0.466, 81: 0.474, 82: 0.483, 83: 0.491, 84: 0.500, 85: 0.508, 86: 0.517, 87: 0.525, 88: 0.534,
    89: 0.542, 90: 0.551, 91: 0.559, 92: 0.568, 93: 0.576, 94: 0.585, 95: 0.593
  }

  const EQUITY_PLUS_PLF = {
    62: 0.339, 63: 0.346, 64: 0.353, 65: 0.361, 66: 0.368, 67: 0.376, 68: 0.384, 69: 0.392, 70: 0.397,
    71: 0.397, 72: 0.426, 73: 0.434, 74: 0.442, 75: 0.451, 76: 0.459, 77: 0.467, 78: 0.476, 79: 0.484,
    80: 0.492, 81: 0.501, 82: 0.509, 83: 0.517, 84: 0.526, 85: 0.534, 86: 0.542, 87: 0.551, 88: 0.559,
    89: 0.567, 90: 0.576, 91: 0.584, 92: 0.592, 93: 0.601, 94: 0.609, 95: 0.617
  }

  const PEAK_PLF = {
    62: 0.379, 63: 0.387, 64: 0.394, 65: 0.403, 66: 0.411, 67: 0.420, 68: 0.428, 69: 0.437, 70: 0.445,
    71: 0.445, 72: 0.477, 73: 0.486, 74: 0.495, 75: 0.504, 76: 0.513, 77: 0.522, 78: 0.532, 79: 0.541,
    80: 0.550, 81: 0.560, 82: 0.569, 83: 0.578, 84: 0.588, 85: 0.597, 86: 0.606, 87: 0.616, 88: 0.625,
    89: 0.634, 90: 0.644, 91: 0.653, 92: 0.662, 93: 0.672, 94: 0.681, 95: 0.690
  }

  const LOC_PLF = {
    62: 0.339, 63: 0.346, 64: 0.353, 65: 0.361, 66: 0.368, 67: 0.376, 68: 0.384, 69: 0.392, 70: 0.397,
    71: 0.397, 72: 0.426, 73: 0.434, 74: 0.442, 75: 0.451, 76: 0.459, 77: 0.467, 78: 0.476, 79: 0.484,
    80: 0.492, 81: 0.501, 82: 0.509, 83: 0.517, 84: 0.526, 85: 0.534, 86: 0.542, 87: 0.551, 88: 0.559,
    89: 0.567, 90: 0.576, 91: 0.584, 92: 0.592, 93: 0.601, 94: 0.609, 95: 0.617
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 65 // Default age
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Get youngest age (client or spouse)
  const getYoungestAge = (client: any): number => {
    const clientAge = calculateAge(client.date_of_birth)
    if (!client.is_married || !client.spouse_date_of_birth) {
      return clientAge
    }
    const spouseAge = calculateAge(client.spouse_date_of_birth)
    return Math.min(clientAge, spouseAge)
  }

  // Calculate UPB based on program type and age
  const calculateUPB = (homeValue: number, programType: string, age: number): number => {
    const ageKey = Math.min(age, 95) as keyof typeof HECM_PLF
    
    let plf = 0
    if (programType === 'HECM') {
      plf = HECM_PLF[ageKey] || 0.4
    } else if (programType === 'Equity Plus') {
      plf = EQUITY_PLUS_PLF[ageKey] || 0.4
    } else if (programType === 'Peak') {
      plf = PEAK_PLF[ageKey] || 0.4
    } else if (programType === 'LOC') {
      plf = LOC_PLF[ageKey] || 0.4
    }
    
    return Math.round(homeValue * plf)
  }

  // Calculate net proceeds (what client actually receives)
  const calculateNetProceeds = (upb: number, currentMortgage: number, programType: string): number => {
    const estimatedCosts = {
      'HECM': 8000,
      'Equity Plus': 12000,
      'Peak': 12000,
      'LOC': 12000
    }
    
    const costs = estimatedCosts[programType as keyof typeof estimatedCosts] || 10000
    return Math.max(0, upb - currentMortgage - costs)
  }

  // Enhanced PLF calculation with all programs (WITH $450K MINIMUM VALIDATION)
  const calculateProgramComparison = (client: any) => {
    const age = getYoungestAge(client)
    const homeValue = client.home_value || 0
    const ageKey = Math.min(age, 95) as keyof typeof HECM_PLF
    const mortgageBalance = client.mortgage_balance || 0

    const programs = []

    // HECM is always available
    const hecmPLF = HECM_PLF[ageKey] || 0.4
    const hecmUPB = Math.round(homeValue * hecmPLF)
    const hecmNetProceeds = calculateNetProceeds(hecmUPB, mortgageBalance, 'HECM')
    
    programs.push({
      name: 'HECM',
      plf: (hecmPLF * 100).toFixed(1) + '%',
      upb: hecmUPB.toLocaleString(),
      netProceeds: hecmNetProceeds.toLocaleString(),
      description: 'FHA-insured reverse mortgage',
      rawNetProceeds: hecmNetProceeds
    })

    // Equity Plus programs only available for homes $450K+
    if (homeValue >= 450000) {
      // Equity Plus
      const equityPlusPLF = EQUITY_PLUS_PLF[ageKey] || 0.4
      const equityPlusUPB = Math.round(homeValue * equityPlusPLF)
      const equityPlusNetProceeds = calculateNetProceeds(equityPlusUPB, mortgageBalance, 'Equity Plus')
      
      programs.push({
        name: 'Equity Plus',
        plf: (equityPlusPLF * 100).toFixed(1) + '%',
        upb: equityPlusUPB.toLocaleString(),
        netProceeds: equityPlusNetProceeds.toLocaleString(),
        description: 'Jumbo reverse mortgage program',
        rawNetProceeds: equityPlusNetProceeds
      })

      // Peak
      const peakPLF = PEAK_PLF[ageKey] || 0.4
      const peakUPB = Math.round(homeValue * peakPLF)
      const peakNetProceeds = calculateNetProceeds(peakUPB, mortgageBalance, 'Peak')
      
      programs.push({
        name: 'Peak',
        plf: (peakPLF * 100).toFixed(1) + '%',
        upb: peakUPB.toLocaleString(),
        netProceeds: peakNetProceeds.toLocaleString(),
        description: 'Premium jumbo program with higher PLF',
        rawNetProceeds: peakNetProceeds
      })

      // LOC
      const locPLF = LOC_PLF[ageKey] || 0.4
      const locUPB = Math.round(homeValue * locPLF)
      const locNetProceeds = calculateNetProceeds(locUPB, mortgageBalance, 'LOC')
      
      programs.push({
        name: 'LOC',
        plf: (locPLF * 100).toFixed(1) + '%',
        upb: locUPB.toLocaleString(),
        netProceeds: locNetProceeds.toLocaleString(),
        description: 'Line of credit option',
        rawNetProceeds: locNetProceeds
      })
    }

    return programs
  }

  // Load clients from Supabase
  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading clients:', error)
      return
    }

    setClients(data || [])
  }

  // Add new client to Supabase (MATCH GHL WEBHOOK FORMAT)
  const addClient = async () => {
    if (newClient.first_name && newClient.last_name) {
      try {
        // Format data to match exactly what GHL webhook sends successfully
        const clientData = {
          first_name: newClient.first_name,
          last_name: newClient.last_name,
          email: newClient.email || '',
          phone: newClient.phone || '',
          date_of_birth: newClient.date_of_birth || '1960-01-01',
          spouse_first_name: newClient.is_married ? newClient.spouse_first_name : null,
          spouse_last_name: newClient.is_married ? newClient.spouse_last_name : null,
          spouse_date_of_birth: newClient.is_married ? newClient.spouse_date_of_birth : null,
          home_value: parseInt(newClient.home_value) || 500000,
          address: newClient.address || '',
          property_type: newClient.property_type,
          mortgage_balance: parseInt(newClient.mortgage_balance) || 0,
          occupancy_status: newClient.occupancy_status,
          program_type: newClient.program_type,
          pipeline_status: newClient.pipeline_status,
          pipeline_date: new Date().toISOString().split('T')[0],
          lead_source: 'Manual Entry',
          is_married: newClient.is_married,
          desired_proceeds: parseInt(newClient.desired_proceeds) || 0,
          assigned_loan_officer_id: null,
          created_by_id: null
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

        setClients([data[0], ...clients])
        setShowAddModal(false)
        setNewClient({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          date_of_birth: '',
          spouse_first_name: '',
          spouse_last_name: '',
          spouse_date_of_birth: '',
          home_value: '',
          address: '',
          property_type: 'Single Family Residence',
          mortgage_balance: '',
          occupancy_status: 'Primary Residence',
          program_type: 'HECM',
          pipeline_status: 'Proposal Out',
          is_married: false,
          desired_proceeds: ''
        })
      } catch (error) {
        console.error('Error adding client:', error)
        alert('Error adding client. Please try again.')
      }
    }
  }

  // Update client
  const updateClient = async (clientData: any) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', selectedClient.id)
        .select()

      if (error) {
        console.error('Error updating client:', error)
        alert('Error updating client. Please try again.')
        return
      }

      // Update local state
      setClients(clients.map(client => 
        client.id === selectedClient.id ? data[0] : client
      ))

      setShowEditModal(false)
      setSelectedClient(null)
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Error updating client. Please try again.')
    }
  }

  // Delete client
  const deleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) {
        console.error('Error deleting client:', error)
        alert('Error deleting client. Please try again.')
        return
      }

      setClients(clients.filter(client => client.id !== clientId))
    }
  }

  // Calculate days in current status
  const getDaysInStatus = (pipelineDate: string): number => {
    if (!pipelineDate) return 0
    const statusDate = new Date(pipelineDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - statusDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Pipeline status options
  const pipelineStatuses = [
    'Proposal Out', 'Pitched', 'Application Submitted', 'In Processing', 
    'Conditional Approval', 'Clear to Close', 'Scheduled to Fund', 'Funded',
    'Cancelled', 'Declined', 'On Hold', 'Follow Up'
  ]

  // Get status color
  const getStatusColor = (status: string): string => {
    const colors: {[key: string]: string} = {
      'Proposal Out': 'bg-blue-100 text-blue-800',
      'Pitched': 'bg-indigo-100 text-indigo-800',
      'Application Submitted': 'bg-purple-100 text-purple-800',
      'In Processing': 'bg-yellow-100 text-yellow-800',
      'Conditional Approval': 'bg-orange-100 text-orange-800',
      'Clear to Close': 'bg-green-100 text-green-800',
      'Scheduled to Fund': 'bg-emerald-100 text-emerald-800',
      'Funded': 'bg-green-200 text-green-900',
      'Cancelled': 'bg-red-100 text-red-800',
      'Declined': 'bg-red-100 text-red-800',
      'On Hold': 'bg-gray-100 text-gray-800',
      'Follow Up': 'bg-cyan-100 text-cyan-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Filter clients based on search term and status filter
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === '' || client.pipeline_status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  // Load clients when component mounts
  useEffect(() => {
    loadClients()
  }, [])

  // Calculate statistics
  const totalClients = clients.length
  const activeClients = clients.filter(c => !['Funded', 'Cancelled', 'Declined'].includes(c.pipeline_status)).length
  const fundedClients = clients.filter(c => c.pipeline_status === 'Funded').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <HomeIcon className="w-8 h-8" />
                Next Step CRM
              </h1>
              <p className="text-blue-100 mt-1">Reverse Mortgage Pipeline Management</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Welcome back</div>
              <div className="font-semibold">Admin User</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Clients</p>
                <p className="text-3xl font-bold text-blue-600">{totalClients}</p>
              </div>
              <User className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Pipeline</p>
                <p className="text-3xl font-bold text-green-600">{activeClients}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Funded Loans</p>
                <p className="text-3xl font-bold text-emerald-600">{fundedClients}</p>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                >
                  <option value="">All Status</option>
                  {pipelineStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Client
            </button>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Property</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Program</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Pipeline</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">UPB</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const age = getYoungestAge(client)
                  const upb = calculateUPB(client.home_value, client.program_type, age)
                  const netProceeds = calculateNetProceeds(upb, client.mortgage_balance || 0, client.program_type)
                  const daysInStatus = getDaysInStatus(client.pipeline_date)

                  return (
                    <tr key={client.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {client.first_name} {client.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Age: {age} {client.is_married && client.spouse_first_name && (
                              <span>& {client.spouse_first_name}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {client.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">${client.home_value?.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{client.property_type}</div>
                          {client.address && (
                            <a
                              href={`https://www.zillow.com/homes/${encodeURIComponent(client.address)}_rb/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View on Zillow
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{client.program_type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.pipeline_status)}`}>
                            {client.pipeline_status}
                          </span>
                          <div className="text-xs text-gray-500">{daysInStatus} days</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-green-600">${upb.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Net: ${netProceeds.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedClient(client)
                              setShowViewModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Client"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClient(client)
                              setShowCompareModal(true)
                            }}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Compare Programs"
                          >
                            <Calculator className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClient(client)
                              setShowEditModal(true)
                            }}
                            className="text-amber-600 hover:text-amber-800 transition-colors"
                            title="Edit Client"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteClient(client.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Client"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">Add New Client</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={newClient.first_name}
                      onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={newClient.last_name}
                      onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={newClient.date_of_birth}
                      onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Spouse Information */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="is_married"
                      checked={newClient.is_married}
                      onChange={(e) => setNewClient({...newClient, is_married: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="is_married" className="text-sm font-medium text-gray-700">
                      Client is married
                    </label>
                  </div>

                  {newClient.is_married && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spouse First Name</label>
                        <input
                          type="text"
                          value={newClient.spouse_first_name}
                          onChange={(e) => setNewClient({...newClient, spouse_first_name: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Last Name</label>
                        <input
                          type="text"
                          value={newClient.spouse_last_name}
                          onChange={(e) => setNewClient({...newClient, spouse_last_name: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                        <input
                          type="date"
                          value={newClient.spouse_date_of_birth}
                          onChange={(e) => setNewClient({...newClient, spouse_date_of_birth: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold mb-4">Property Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                      <input
                        type="number"
                        value={newClient.home_value}
                        onChange={(e) => setNewClient({...newClient, home_value: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                      <input
                        type="number"
                        value={newClient.mortgage_balance}
                        onChange={(e) => setNewClient({...newClient, mortgage_balance: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Address</label>
                      <input
                        type="text"
                        value={newClient.address}
                        onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                      <select
                        value={newClient.property_type}
                        onChange={(e) => setNewClient({...newClient, property_type: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Single Family Residence">Single Family Residence</option>
                        <option value="Condominium">Condominium</option>
                        <option value="Townhome">Townhome</option>
                        <option value="Manufactured Home">Manufactured Home</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occupancy Status</label>
                      <select
                        value={newClient.occupancy_status}
                        onChange={(e) => setNewClient({...newClient, occupancy_status: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Primary Residence">Primary Residence</option>
                        <option value="Second Home">Second Home</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Loan Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold mb-4">Loan Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                      <select
                        value={newClient.program_type}
                        onChange={(e) => setNewClient({...newClient, program_type: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="HECM">HECM</option>
                        <option value="Equity Plus">Equity Plus</option>
                        <option value="Peak">Peak</option>
                        <option value="LOC">LOC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                      <select
                        value={newClient.pipeline_status}
                        onChange={(e) => setNewClient({...newClient, pipeline_status: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {pipelineStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Desired Proceeds</label>
                      <input
                        type="number"
                        value={newClient.desired_proceeds}
                        onChange={(e) => setNewClient({...newClient, desired_proceeds: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addClient}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 font-medium"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Client Modal - COMPLETE VERSION WITH ALL FIELDS */}
        {showEditModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Edit Client: {selectedClient.first_name} {selectedClient.last_name}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue={selectedClient.first_name || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, first_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue={selectedClient.last_name || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, last_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={selectedClient.email || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue={selectedClient.phone || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      defaultValue={selectedClient.date_of_birth || ''}
                      onChange={(e) => setSelectedClient({...selectedClient, date_of_birth: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Spouse Information */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="edit_is_married"
                      checked={selectedClient.is_married || false}
                      onChange={(e) => setSelectedClient({...selectedClient, is_married: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="edit_is_married" className="text-sm font-medium text-gray-700">
                      Client is married
                    </label>
                  </div>

                  {selectedClient.is_married && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spouse First Name</label>
                        <input
                          type="text"
                          defaultValue={selectedClient.spouse_first_name || ''}
                          onChange={(e) => setSelectedClient({...selectedClient, spouse_first_name: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Last Name</label>
                        <input
                          type="text"
                          defaultValue={selectedClient.spouse_last_name || ''}
                          onChange={(e) => setSelectedClient({...selectedClient, spouse_last_name: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Date of Birth</label>
                        <input
                          type="date"
                          defaultValue={selectedClient.spouse_date_of_birth || ''}
                          onChange={(e) => setSelectedClient({...selectedClient, spouse_date_of_birth: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold mb-4">Property Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Home Value</label>
                      <input
                        type="number"
                        defaultValue={selectedClient.home_value || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, home_value: parseInt(e.target.value) || 0})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Mortgage Balance</label>
                      <input
                        type="number"
                        defaultValue={selectedClient.mortgage_balance || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, mortgage_balance: parseInt(e.target.value) || 0})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Address</label>
                      <input
                        type="text"
                        defaultValue={selectedClient.address || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, address: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                      <select
                        defaultValue={selectedClient.property_type || 'Single Family Residence'}
                        onChange={(e) => setSelectedClient({...selectedClient, property_type: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Single Family Residence">Single Family Residence</option>
                        <option value="Condominium">Condominium</option>
                        <option value="Townhome">Townhome</option>
                        <option value="Manufactured Home">Manufactured Home</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occupancy Status</label>
                      <select
                        defaultValue={selectedClient.occupancy_status || 'Primary Residence'}
                        onChange={(e) => setSelectedClient({...selectedClient, occupancy_status: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Primary Residence">Primary Residence</option>
                        <option value="Second Home">Second Home</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Loan Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold mb-4">Loan Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                      <select
                        defaultValue={selectedClient.program_type || 'HECM'}
                        onChange={(e) => setSelectedClient({...selectedClient, program_type: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="HECM">HECM</option>
                        <option value="Equity Plus">Equity Plus</option>
                        <option value="Peak">Peak</option>
                        <option value="LOC">LOC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
                      <select
                        defaultValue={selectedClient.pipeline_status || 'Proposal Out'}
                        onChange={(e) => setSelectedClient({...selectedClient, pipeline_status: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {pipelineStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Desired Proceeds</label>
                      <input
                        type="number"
                        defaultValue={selectedClient.desired_proceeds || ''}
                        onChange={(e) => setSelectedClient({...selectedClient, desired_proceeds: parseInt(e.target.value) || 0})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateClient(selectedClient)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 font-medium"
                >
                  Update Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Client Modal */}
        {showViewModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Client Details: {selectedClient.first_name} {selectedClient.last_name}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-blue-600">Personal Information</h4>
                    <div className="space-y-2">
                      <div><span className="font-medium">Name:</span> {selectedClient.first_name} {selectedClient.last_name}</div>
                      <div><span className="font-medium">Age:</span> {calculateAge(selectedClient.date_of_birth)}</div>
                      <div><span className="font-medium">DOB:</span> {selectedClient.date_of_birth}</div>
                      <div><span className="font-medium">Email:</span> {selectedClient.email || 'Not provided'}</div>
                      <div><span className="font-medium">Phone:</span> {selectedClient.phone || 'Not provided'}</div>
                      <div><span className="font-medium">Married:</span> {selectedClient.is_married ? 'Yes' : 'No'}</div>
                      {selectedClient.is_married && selectedClient.spouse_first_name && (
                        <>
                          <div><span className="font-medium">Spouse:</span> {selectedClient.spouse_first_name} {selectedClient.spouse_last_name}</div>
                          <div><span className="font-medium">Spouse Age:</span> {calculateAge(selectedClient.spouse_date_of_birth)}</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-green-600">Property Information</h4>
                    <div className="space-y-2">
                      <div><span className="font-medium">Value:</span> ${selectedClient.home_value?.toLocaleString()}</div>
                      <div><span className="font-medium">Address:</span> {selectedClient.address || 'Not provided'}</div>
                      <div><span className="font-medium">Type:</span> {selectedClient.property_type}</div>
                      <div><span className="font-medium">Occupancy:</span> {selectedClient.occupancy_status}</div>
                      <div><span className="font-medium">Current Mortgage:</span> ${selectedClient.mortgage_balance?.toLocaleString() || '0'}</div>
                      {selectedClient.address && (
                        <div>
                          <a
                            href={`https://www.zillow.com/homes/${encodeURIComponent(selectedClient.address)}_rb/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View on Zillow →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Loan Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold mb-3 text-purple-600">Loan Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div><span className="font-medium">Program:</span> {selectedClient.program_type}</div>
                      <div><span className="font-medium">Pipeline Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedClient.pipeline_status)}`}>
                          {selectedClient.pipeline_status}
                        </span>
                      </div>
                      <div><span className="font-medium">Days in Status:</span> {getDaysInStatus(selectedClient.pipeline_date)}</div>
                      <div><span className="font-medium">Lead Source:</span> {selectedClient.lead_source || 'Not specified'}</div>
                    </div>
                    <div className="space-y-2">
                      <div><span className="font-medium">UPB:</span> ${calculateUPB(selectedClient.home_value, selectedClient.program_type, getYoungestAge(selectedClient)).toLocaleString()}</div>
                      <div><span className="font-medium">Net Proceeds:</span> ${calculateNetProceeds(calculateUPB(selectedClient.home_value, selectedClient.program_type, getYoungestAge(selectedClient)), selectedClient.mortgage_balance || 0, selectedClient.program_type).toLocaleString()}</div>
                      <div><span className="font-medium">Desired Proceeds:</span> ${selectedClient.desired_proceeds?.toLocaleString() || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setShowEditModal(true)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 font-medium"
                >
                  Edit Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Program Comparison Modal */}
        {showCompareModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Program Comparison: {selectedClient.first_name} {selectedClient.last_name}
                </h3>
                <p className="text-gray-600 mt-2">
                  Age: {getYoungestAge(selectedClient)} | Home Value: ${selectedClient.home_value?.toLocaleString()}
                </p>
              </div>
              <div className="p-6">
                {(() => {
                  const programs = calculateProgramComparison(selectedClient)
                  const bestProgram = programs.reduce((best, current) => 
                    current.rawNetProceeds > best.rawNetProceeds ? current : best
                  )
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {programs.map((program, index) => (
                        <div key={index} className={`rounded-2xl p-6 border-2 ${program.name === bestProgram.name ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'} relative`}>
                          {program.name === bestProgram.name && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                              Best Option
                            </div>
                          )}
                          
                          <h4 className="text-xl font-bold mb-4 text-center">{program.name}</h4>
                          <div className="text-xs text-gray-600 mb-3">{program.description}</div>
                          
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Principal Limit Factor</div>
                              <div className="text-2xl font-bold text-blue-600">{program.plf}</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Maximum Loan Amount</div>
                              <div className="text-xl font-semibold">${program.upb}</div>
                            </div>
                            
                            <div className="text-center border-t pt-3">
                              <div className="text-sm text-gray-600">Estimated Net Proceeds</div>
                              <div className="text-2xl font-bold text-green-600">${program.netProceeds}</div>
                            </div>
                          </div>
                          
                          <button
                            onClick={async () => {
                              const updatedClient = {...selectedClient, program_type: program.name}
                              await updateClient(updatedClient)
                              setShowCompareModal(false)
                            }}
                            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 px-4 rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 font-medium"
                          >
                            Select {program.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })()}
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Net proceeds are estimates and include approximate closing costs. 
                    Actual amounts may vary based on specific loan terms, property appraisal, and closing costs.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
