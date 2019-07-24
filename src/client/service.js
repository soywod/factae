import {BehaviorSubject} from 'rxjs'

import {db} from '../utils/firebase'
import {notify} from '../utils/notification'
import {user$} from '../auth/service'

export const clients$ = new BehaviorSubject(null)

export function onClientsChanged() {
  return db(`users/${user$.value.uid}/clients`).onSnapshot((query, error) => {
    const clients = []

    if (!error) {
      query.forEach(doc => clients.push({id: doc.id, ...doc.data()}))
    }

    clients$.next(clients)
  })
}

export async function create() {
  try {
    const {id} = await db(`users/${user$.value.uid}/clients`).add({})
    notify.success('Client créé avec succès.')
    return id
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export async function update(client) {
  try {
    await db(`users/${user$.value.uid}/clients`, client.id).set(client)
    notify.success('Client mis à jour avec succès.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export {_delete as delete}
async function _delete(client) {
  try {
    await db(`users/${user$.value.uid}/clients`, client.id).delete()
    notify.success('Client supprimé avec succès.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export default {create, update, delete: _delete}
