import {BehaviorSubject} from 'rxjs'

import {auth, db} from '../utils/firebase'
import {notify} from '../utils/notification'

export const user$ = new BehaviorSubject(null)

export async function register(email, password) {
  try {
    const {user} = await auth().createUserWithEmailAndPassword(email, password)
    const profile = {id: user.uid, email: user.email}
    await db('users', user.id).set(profile)

    notify.success('Compte créé avec succès.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export async function login(email, password) {
  try {
    await auth().signInWithEmailAndPassword(email, password)
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export async function resetPassword(email) {
  try {
    await auth().sendPasswordResetEmail(email)
    notify.success('Un email vous a été envoyé avec la procédure à suivre.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export async function logout() {
  await auth().signOut()
}

export function onAuthStateChanged() {
  return auth().onAuthStateChanged((user, error) => user$.next(error || !user ? false : user))
}
