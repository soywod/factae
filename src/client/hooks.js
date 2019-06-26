import {useEffect, useState} from 'react'

import {useAuth} from '../auth/hooks'
import {onClientsChanged, clients$} from './service'

export function useClients() {
  const [clients, setClients] = useState(clients$.value)

  useEffect(() => {
    const subscription = clients$.subscribe(setClients)
    return () => subscription.unsubscribe()
  }, [])

  return clients
}

export function useClientService() {
  const user = useAuth()

  useEffect(() => {
    if (user) {
      const unsubscribe = onClientsChanged()
      return () => unsubscribe()
    }
  }, [user])
}
