import firebase from 'firebase/app'

import {notify} from '../utils/notification'

export async function register(email, password) {
  try {
    const {user} = await firebase.auth().createUserWithEmailAndPassword(email, password)
    const profile = {id: user.uid, email: user.email}
    await firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .set(profile)

    notify.success('Compte créé avec succès.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export async function login(email, password) {
  try {
    return await firebase.auth().signInWithEmailAndPassword(email, password)
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export async function resetPassword(email) {
  try {
    await firebase.auth().sendPasswordResetEmail(email)
    notify.success('Un email vous a été envoyé avec la procédure à suivre.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export function check(callback) {
  try {
    firebase.auth().onAuthStateChanged(async (user, error) => {
      if (error || !user) {
        return callback(false)
      }

      const ref = await firebase
        .firestore()
        .collection('users')
        .doc(user.uid)
        .get()

      callback(ref.data() || false)
    })
  } catch (error) {
    callback(false)
  }
}

export async function logout() {
  await firebase.auth().signOut()
}

export default {register, login, resetPassword, check, logout}
