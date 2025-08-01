'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export function useSyncUser() {
  const { user, isLoaded } = useUser()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const sync = async () => {
      if (!isLoaded || !user) {
        return
      }

      try {
        // Fetch returns a Response, need to await and parse it
        const response = await fetch('/api/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            full_name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
          }),
        })

        // Parse the JSON response
        const result = await response.json()

        if (!response.ok) {
          console.error('Error syncing user:', result.error)
        } else {
          console.log('User synced successfully:', result)
        }
      } catch (error) {
        console.error('Sync error:', error)
      }
    }

    sync()
  }, [user, isLoaded])
}
