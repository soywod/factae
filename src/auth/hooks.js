import {useEffect, useState} from 'react'

import {onAuthStateChanged, user$} from './service'

export function useAuth() {
  const [user, setUser] = useState(user$.value)

  useEffect(() => {
    const subscription = user$.subscribe(setUser)
    return () => subscription.unsubscribe()
  }, [])

  return user
}

export function useAuthService() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged()
    return () => unsubscribe()
  }, [])
}
