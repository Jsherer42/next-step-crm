'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Phone, Mail, DollarSign, Eye, X } from 'lucide-react'

export default function NextStepCRM() {
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setClients([
      {
        id: '1',
        first_name: 'Robert',
        last_name: 'Johnson',
        email: 'robert.johnson@email.com',
        phone: '(555) 123-4567',
        home_value: 450000,
        desired_proceeds: 200000,
        loan_officer: 'Christian Ford'
      },
      {
        id: '2',
        first_name: 'Margaret',
        last_name: 'Williams',
        email: 'margaret.williams@email.com',
        phone: '(555) 987-6543',
        home_value: 620000,
        desired_proceeds: 150000,
        loan_officer: 'Ahmed Samura'
      }
    ])
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalPipeline = clients.reduce((sum, client) => sum + client.desired_proceeds, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-emerald-400 to-blue-500">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Next Step CRM</h1>
          <p className="text-blue-100">City First FHA Retirement - Reverse Mortgage Pipeline</p>
        </div>

        {/* Stats */}
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 mb-8">
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
              <div className="text-3xl font-bold text-white mb-1">2</div>
              <div className="text-blue-100">Active Clients</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-50 rounded-xl border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {client.first_name} {client.last_name}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">{client.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">{client.email}</span>
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

              <div className="text-sm text-gray-600 mb-4">
                Team Member: {client.loan_officer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
