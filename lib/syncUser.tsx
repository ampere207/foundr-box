
// lib/syncUser.ts

'use client'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export function useSyncUser() {
  const { user } = useUser()
  const supabase = createPagesBrowserClient()

 useEffect(() => {
  const sync = async () => {
    if (!user) {
     // console.log('No Clerk user found')
      return
    }

    //console.log('Syncing user:', user)

    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    //console.log('Existing user check:', data, error)

    if (!data) {
      const { error: insertError } = await supabase.from('users').upsert([{
  id: user.id,
  email: user.primaryEmailAddress?.emailAddress,
  full_name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
}], {
    onConflict: 'id',
    ignoreDuplicates: true,  // This makes it skip instead of updating
  })

if (insertError) {
 // console.error('❌ Failed to insert user:', JSON.stringify(insertError, null, 2))
  //alert(`Insert failed: ${insertError.message || 'Unknown Supabase error'}`)
}
else {
      //  console.log('User inserted successfully')
      }
    }
  }

  sync()
}, [user])
}