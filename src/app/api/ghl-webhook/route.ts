import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with CORRECT URL and API KEY
const supabaseUrl = 'https://nmcqlekpyqfgyzoelcsa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3FsZWtweXFmZ3l6b2VsY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzE5MjYsImV4cCI6MjA2OTUwNzkyNn0.SeBMt_beE7Dtab79PxEUW6-k_0Aprud0k79LbGVbCiA'
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  return NextResponse.json({
    message: "GHL Webhook endpoint is active",
    timestamp: new Date().toISOString(),
    status: "ready"
  })
}

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming webhook data from GHL
    const ghlData = await request.json()
    
    console.log('GHL Webhook received:', JSON.stringify(ghlData, null, 2))
    
    // Extract contact data from GHL webhook
    // GHL sends different formats, so we handle multiple possibilities
    const contactData = ghlData.contact || ghlData.data || ghlData
    
    if (!contactData) {
      console.error('No contact data found in webhook')
      return NextResponse.json({ error: 'No contact data provided' }, { status: 400 })
    }
    
    // Map GHL fields to our CRM format (matching our database structure)
    const clientData = {
      first_name: contactData.firstName || contactData.first_name || contactData.name?.split(' ')[0] || 'Unknown',
      last_name: contactData.lastName || contactData.last_name || contactData.name?.split(' ').slice(1).join(' ') || 'Unknown',
      email: contactData.email || '',
      phone: contactData.phone || contactData.phoneNumber || '',
      date_of_birth: contactData.dateOfBirth || contactData.date_of_birth || '1960-01-01',
      
      // Spouse info (usually not in GHL, but include fields)
      spouse_first_name: contactData.spouseFirstName || null,
      spouse_last_name: contactData.spouseLastName || null,
      spouse_date_of_birth: contactData.spouseDateOfBirth || null,
      
      // Property info (may come from custom fields)
      home_value: parseInt(contactData.homeValue || contactData.home_value || '500000'),
      address: contactData.address || contactData.address1 || '',
      property_type: contactData.propertyType || 'Single Family Residence',
      mortgage_balance: parseInt(contactData.mortgageBalance || contactData.mortgage_balance || '0'),
      occupancy_status: contactData.occupancyStatus || 'Primary Residence',
      
      // Program and pipeline info
      program_type: contactData.programType || 'HECM',
      pipeline_status: 'Proposal Out',
      pipeline_date: new Date().toISOString().split('T')[0],
      
      // Lead source
      lead_source: 'GHL Import',
      
      // Set default values for required fields
      is_married: false,
      desired_proceeds: 0,
      assigned_loan_officer_id: null,
      created_by_id: null
    }
    
    console.log('Mapped client data:', JSON.stringify(clientData, null, 2))
    
    // Validate required fields
    if (!clientData.first_name || !clientData.last_name) {
      console.error('Missing required fields: first_name or last_name')
      return NextResponse.json({ 
        error: 'Missing required fields: first_name and last_name are required' 
      }, { status: 400 })
    }
    
    // Insert into Supabase (without id field - let it auto-generate)
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
    
    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ 
        error: 'Database insert failed', 
        details: error.message 
      }, { status: 500 })
    }
    
    console.log('Successfully created client:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      client: data[0],
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
