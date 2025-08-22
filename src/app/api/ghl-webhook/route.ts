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
    
    // Look for custom fields that might contain property information
    let homeValue = 500000 // Default value
    let address = fullAddress
    let propertyType = 'Single Family Residence'
    let mortgageBalance = 0
    
    // Check for custom fields
    if (data.customData) {
      if (data.customData.home_value) homeValue = parseInt(data.customData.home_value)
      if (data.customData.homeValue) homeValue = parseInt(data.customData.homeValue)
      if (data.customData.property_value) homeValue = parseInt(data.customData.property_value)
      if (data.customData.propertyValue) homeValue = parseInt(data.customData.propertyValue)
      
      if (data.customData.property_type) propertyType = data.customData.property_type
      if (data.customData.propertyType) propertyType = data.customData.propertyType
      
      if (data.customData.mortgage_balance) mortgageBalance = parseInt(data.customData.mortgage_balance)
      if (data.customData.mortgageBalance) mortgageBalance = parseInt(data.customData.mortgageBalance)
      if (data.customData.current_mortgage) mortgageBalance = parseInt(data.customData.current_mortgage)
    }
    
    // Create client data object with correct field mapping
    const clientData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phoneNumber,
      date_of_birth: '1960-01-01', // Default - can be updated later
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
