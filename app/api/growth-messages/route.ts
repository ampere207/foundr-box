import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const conversation_id = searchParams.get('conversation_id')

    if (!user_id || !conversation_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('growth_messages')
      .select('*')
      .eq('user_id', user_id)
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
