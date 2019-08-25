import {DateTime} from 'luxon'
import {BehaviorSubject} from 'rxjs'

import {auth, db} from '../utils/firebase'

export const user$ = new BehaviorSubject(null)

export async function login(email, password) {
  await auth.signInWithEmailAndPassword(email, password)
}

export async function register(email, password) {
  const {user} = await auth.createUserWithEmailAndPassword(email, password)
  const now = DateTime.local()
  await db('users', user.uid).set({
    id: user.uid,
    email: user.email,
    documentsTheme: 'default',
    quotationConditions: 'Dispensé d’immatriculation au registre du commerce et des sociétés (RCS)',
    invoiceConditions:
      'En cas de retard de paiement, une pénalité de 3 fois le taux d’intérêt légal sera appliquée, à laquelle s’ajoutera une indemnité forfaitaire pour frais de recouvrement de 40€\nDispensé d’immatriculation au registre du commerce et des sociétés (RCS)',
    createdAt: now.toISO(),
    expiresAt: now.plus({days: 30}).toJSDate(),
  })
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
