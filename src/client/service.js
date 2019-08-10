import {BehaviorSubject} from 'rxjs'

import {db} from '../utils/firebase'
import {user$} from '../auth/service'

export const clients$ = new BehaviorSubject(null)

export function onClientsChanged() {
  return db(`users/${user$.value.uid}/clients`).onSnapshot((query, error) => {
    const clients = []

    if (!error) {
      query.forEach(ref => clients.push({id: ref.id, ...ref.data()}))
    }

    clients$.next(clients)
  })
}

export async function create() {
  const {id} = await db(`users/${user$.value.uid}/clients`).add({})
  return id
}

export async function update(client) {
  await db(`users/${user$.value.uid}/clients`, client.id).set(client)
}

export {_delete as delete}
async function _delete(client) {
  await db(`users/${user$.value.uid}/clients`, client.id).delete()
}

export default {create, update, delete: _delete}
