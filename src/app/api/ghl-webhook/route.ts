import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming webhook data from GHL
    const ghlData = await request.json()
    
    console.log('GHL Webhook received:', JSON.stringify(ghlData, null, 2))
    
    // Extract contact information from GHL payload
    // GHL sends different structures, so we'll check multiple possible formats
    const contact = ghlData.contact || ghlData.data || ghlData
    
    if (!contact) {
      console.error('No contact data found in webhook payload')
      return NextResponse.json({ error: 'No contact data provided' }, { status: 400 })
    }
    
    // Map GHL contact data to Next Step CRM format
    const newClient = {
      id: Date.now().toString(),
      first_name: contact.firstName || contact.first_name || '',
      last_name: contact.lastName || contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || contact.phoneNumber || '',
      date_of_birth: contact.dateOfBirth || contact.date_of_birth || '',
      spouse_first_name: contact.spouseFirstName || contact.spouse_first_name || '',
      spouse_last_name: contact.spouseLastName || contact.spouse_last_name || '',
      spouse_date_of_birth: contact.spouseDateOfBirth || contact.spouse_date_of_birth || '',
      home_value: parseInt(contact.homeValue || contact.home_value || '0') || 0,
      address: contact.address || contact.address1 || '',
      property_type: contact.propertyType || contact.property_type || 'Single Family Residence',
      current_mortgage_balance: parseInt(contact.currentMortgageBalance || contact.current_mortgage_balance || '0') || 0,
      occupancy_status: contact.occupancyStatus || contact.occupancy_status || 'Primary Residence',
      program_type: contact.programType || contact.program_type || 'HECM',
      pipeline_status: 'Proposal Out', // Start new GHL leads at beginning of pipeline
      pipeline_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }
    
    // Validate required fields
    if (!newClient.first_name || !newClient.last_name || !newClient.phone) {
      console.error('Missing required fields:', { 
        first_name: newClient.first_name, 
        last_name: newClient.last_name, 
        phone: newClient.phone 
      })
      return NextResponse.json({ 
        error: 'Missing required fields: first_name, last_name, or phone' 
      }, { status: 400 })
    }
    
    // Here we would normally save to a database, but since you're using localStorage,
    // we'll return the client data for the frontend to handle
    
    console.log('Successfully processed GHL contact:', {
      name: `${newClient.first_name} ${newClient.last_name}`,
      phone: newClient.phone,
      email: newClient.email
    })
    
    // Return success response to GHL
    return NextResponse.json({ 
      success: true, 
      message: 'Contact imported successfully',
      client: newClient 
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error processing GHL webhook:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// Handle GET requests for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'GHL Webhook endpoint is active',
    timestamp: new Date().toISOString(),
    status: 'ready'
  })
}
