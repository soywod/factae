import {BehaviorSubject} from 'rxjs'

import {db} from '../utils/firebase'
import {user$} from '../auth/service'

export const records$ = new BehaviorSubject(null)

export function onRecordsChanged() {
  return db(`users/${user$.value.uid}/records`).onSnapshot((query, error) => {
    const records = []

    if (!error) {
      query.forEach(ref => records.push({id: ref.id, ...ref.data()}))
    }

    records$.next(records)
  })
}

export function generateId() {
  return db(`users/${user$.value.uid}/records`).doc().id
}

export async function set(record) {
  await db(`users/${user$.value.uid}/records`, record.id).set(record, {merge: true})
}

export {_delete as delete}
async function _delete(record) {
  await db(`users/${user$.value.uid}/records`, record.id).delete()
}

export default {generateId, set, delete: _delete}
