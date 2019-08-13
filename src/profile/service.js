import {BehaviorSubject} from 'rxjs'
import {DateTime} from 'luxon'
import omit from 'lodash/fp/omit'

import {db} from '../utils/firebase'
import {user$} from '../auth/service'

export const profile$ = new BehaviorSubject(null)

export async function update(profile) {
  await db('users', user$.value.uid).update(omit('expiresAt', profile))
}

export function onProfileChanged() {
  return db('users', user$.value.uid).onSnapshot((doc, error) => {
    if (error || !doc) return profile$.next({})
    const profile = doc.data() || {}

    profile$.next({
      ...profile,
      expiresAt: DateTime.fromSeconds(profile.expiresAt.seconds),
    })
  })
}

export default {update}
