import firebase from 'firebase/app'

import {notify} from '../utils/notification'

export async function readAll() {
  try {
    await firebase
      .firestore()
      .collection('users/${}/clients')
      .doc(profile.id)
      .set(profile)
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

