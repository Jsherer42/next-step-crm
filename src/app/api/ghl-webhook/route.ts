import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with correct credentials
const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    console.log('GHL Webhook received')
    const data = await request.json()
    console.log('GHL Webhook received:', JSON.stringify(data, null, 2))
    
    // Extract and map the correct fields from GHL data
    const phoneNumber = data.phone || ''
    const fullName = data.full_name || ''
    const fullAddress = data.full_address || ''
    
    // Parse the full name into first and last name
    let firstName = 'Unknown'
    let lastName = 'Unknown'
    
    if (fullName && fullName.trim() !== '') {
      const nameParts = fullName.trim().split(' ')
      firstName = nameParts[0] || 'Unknown'
      lastName = nameParts.slice(1).join(' ') || 'Unknown'
    }
    
    // Look for email in various possible locations
    let email = ''
    if (data.email) {
      email = data.email
    } else if (data.contact && data.contact.email) {
      email = data.contact.email
    } else if (data.customData && data.customData.email) {
      email = data.customData.email
    }
    
    // Look for Date of Birth in various possible field names - CHECK ROOT DATA FIRST
    let dateOfBirth = '1960-01-01' // Default fallback
    
    // Check root data first (where GHL actually sends the data)
    if (data['Birthday DD/MM/YYYY']) {
      dateOfBirth = formatDate(data['Birthday DD/MM/YYYY'])
    } else if (data.birthday) {
      dateOfBirth = formatDate(data.birthday)
    } else if (data.date_of_birth) {
      dateOfBirth = formatDate(data.date_of_birth)
    } else if (data.dob) {
      dateOfBirth = formatDate(data.dob)
    } else if (data.customData) {
      // Fallback to check customData
      if (data.customData.date_of_birth) {
        dateOfBirth = formatDate(data.customData.date_of_birth)
      } else if (data.customData.dateOfBirth) {
        dateOfBirth = formatDate(data.customData.dateOfBirth)
      } else if (data.customData.birthday) {
        dateOfBirth = formatDate(data.customData.birthday)
      } else if (data.customData['Birthday DD/MM/YYYY']) {
        dateOfBirth = formatDate(data.customData['Birthday DD/MM/YYYY'])
      }
    }
    
    // Helper function to convert various date formats to YYYY-MM-DD
    function formatDate(dateString) {
      if (!dateString || dateString.trim() === '') return '1960-01-01'
      
      try {
        // Handle MM/DD/YYYY or DD/MM/YYYY format
        if (dateString.includes('/')) {
          const parts = dateString.split('/')
          if (parts.length === 3) {
            // Assume MM/DD/YYYY format first
            let month = parts[0].padStart(2, '0')
            let day = parts[1].padStart(2, '0')
            let year = parts[2]
            
            // If month > 12, probably DD/MM/YYYY format
            if (parseInt(parts[0]) > 12) {
              day = parts[0].padStart(2, '0')
              month = parts[1].padStart(2, '0')
            }
            
            return `${year}-${month}-${day}`
          }
        }
        
        // Try to parse as a regular date
        const date = new Date(dateString)
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]
        }
      } catch (error) {
        console.log('Date parsing error:', error)
      }
      
      return '1960-01-01' // Fallback
    }
    
    // Look for custom fields that might contain property information
    let homeValue = 500000 // Default value
    let address = fullAddress
    let propertyType = 'Single Family Residence'
    let mortgageBalance = 0
    
    // Look for property data in ROOT fields (where GHL actually sends it)
    let homeValue = 500000 // Default value
    let address = fullAddress
    let propertyType = 'Single Family Residence'
    let mortgageBalance = 0
    
    // Check ROOT data first (where GHL actually sends the data)
    if (data['Property Value']) homeValue = parseInt(data['Property Value']) || homeValue
    if (data['Estimated Home Value']) homeValue = parseInt(data['Estimated Home Value']) || homeValue
    if (data['Mortgage Balance']) mortgageBalance = parseInt(data['Mortgage Balance']) || 0
    if (data['Current  Mortgage Balance']) mortgageBalance = parseInt(data['Current  Mortgage Balance']) || mortgageBalance
    if (data['Property Address']) address = data['Property Address'] || address
    
    // Fallback to check customData
    if (data.customData) {
      if (data.customData.home_value) homeValue = parseInt(data.customData.home_value) || homeValue
      if (data.customData.homeValue) homeValue = parseInt(data.customData.homeValue) || homeValue
      if (data.customData.property_value) homeValue = parseInt(data.customData.property_value) || homeValue
      if (data.customData.propertyValue) homeValue = parseInt(data.customData.propertyValue) || homeValue
      
      if (data.customData.property_type) propertyType = data.customData.property_type
      if (data.customData.propertyType) propertyType = data.customData.propertyType
      
      if (data.customData.mortgage_balance) mortgageBalance = parseInt(data.customData.mortgage_balance) || mortgageBalance
      if (data.customData.mortgageBalance) mortgageBalance = parseInt(data.customData.mortgageBalance) || mortgageBalance
      if (data.customData.current_mortgage) mortgageBalance = parseInt(data.customData.current_mortgage) || mortgageBalance
    }
    
    // Create client data object with correct field mapping
    const clientData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phoneNumber,
      date_of_birth: dateOfBirth,
      spouse_first_name: null,
      spouse_last_name: null,
      spouse_date_of_birth: null,
      home_value: homeValue,
      address: address,
      property_type: propertyType,
      mortgage_balance: mortgageBalance,
      occupancy_status: 'Primary Residence',
      program_type: 'HECM',
      pipeline_status: 'Proposal Out',
      pipeline_date: new Date().toISOString().split('T')[0],
      lead_source: 'GHL Import',
      is_married: false,
      desired_proceeds: 0,
      assigned_loan_officer_id: null,
      created_by_id: null
    }

    console.log('Mapped client data:', clientData)

    // Insert into Supabase (don't include 'id' field - let it auto-generate)
    const { data: insertedData, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()

    if (error) {
      console.error('Error inserting client:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    console.log('Successfully created client:', insertedData)

    return NextResponse.json({ 
      success: true, 
      message: 'Client created successfully',
      client: insertedData[0]
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'GHL Webhook endpoint is active',
    timestamp: new Date().toISOString(),
    status: 'ready'
  })
}
