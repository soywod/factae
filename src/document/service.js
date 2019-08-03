import {BehaviorSubject} from 'rxjs'

import {db} from '../utils/firebase'
import {notify} from '../utils/notification'
import {user$} from '../auth/service'

export const documents$ = new BehaviorSubject(null)

export function onDocumentsChanged() {
  return db(`users/${user$.value.uid}/documents`).onSnapshot((query, error) => {
    const documents = []

    if (!error) {
      query.forEach(doc => documents.push({id: doc.id, ...doc.data()}))
    }

    documents$.next(documents)
  })
}

export async function create() {
  try {
    const {id} = await db(`users/${user$.value.uid}/documents`).add({})
    notify.success('Document créé avec succès.')
    return id
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export async function update(document) {
  try {
    await db(`users/${user$.value.uid}/documents`, document.id).set(document)
    notify.success('Document mis à jour avec succès.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export {_delete as delete}
async function _delete(document) {
  try {
    await db(`users/${user$.value.uid}/documents`, document.id).delete()
    notify.success('Document supprimé avec succès.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export default {create, update, delete: _delete}
