import {BehaviorSubject} from 'rxjs'

import {auth, db} from '../utils/firebase'

export const user$ = new BehaviorSubject(null)

export async function login(email, password) {
  await auth.signInWithEmailAndPassword(email, password)
}

export async function register(email, password) {
  const {user} = await auth.createUserWithEmailAndPassword(email, password)
  const profile = {id: user.uid, email: user.email}
  await db('users', profile.id).set(profile)
}

export async function resetPassword(email) {
  await auth.sendPasswordResetEmail(email)
}

export async function logout() {
  await auth.signOut()
}

export function onAuthStateChanged() {
  return auth.onAuthStateChanged((user, error) => user$.next(error || !user ? false : user))
}

export default {login, register, resetPassword, logout}
