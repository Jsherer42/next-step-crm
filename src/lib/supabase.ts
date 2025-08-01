import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()

export interface Client {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  date_of_birth: string
  is_married: boolean
  spouse_first_name: string | null
  spouse_last_name: string | null
  spouse_date_of_birth: string | null
  home_value: number | null
  mortgage_balance: number | null
  desired_proceeds: number | null
  lead_source: string | null
  pipeline_status: string
  assigned_loan_officer_id: string | null
  created_at: string
}
