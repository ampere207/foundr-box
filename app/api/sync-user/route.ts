import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase client with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { id, email, full_name } = await request.json()

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (!existingUser) {
      // Insert new user
      const { error } = await supabase
        .from('users')
        .upsert({
          id,
          email,
          full_name,
        })

      if (error) {
       // console.error('Database error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      //console.log('User inserted successfully:', id)
    } else {
      console.log('User already exists:', id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
