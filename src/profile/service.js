import {BehaviorSubject} from 'rxjs'

import {db} from '../utils/firebase'
import {notify} from '../utils/notification'
import {user$} from '../auth/service'

export const profile$ = new BehaviorSubject(null)

export async function update(profile) {
  try {
    await db('users', user$.value.uid).set(profile)
    notify.success('Profil mis à jour avec succès.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export function onProfileChanged() {
  return db('users', user$.value.uid).onSnapshot((doc, error) => {
    if (error || !doc) profile$.next({})
    else profile$.next(doc.data() || {})
  })
}
