import {BehaviorSubject} from 'rxjs'

import {db} from '../utils/firebase'
import {user$} from '../auth/service'

export const clients$ = new BehaviorSubject(null)

export function onClientsChanged() {
  return db(`users/${user$.value.uid}/clients`).onSnapshot((query, error) => {
    const clients = []

    if (!error) {
      query.forEach(doc => clients.push(doc.data()))
    }

    clients$.next(clients)
  })
}
