import firebase from 'firebase/app'

import {notify} from '../utils/notification'

export async function update(profile) {
  try {
    await firebase
      .firestore()
      .collection('users')
      .doc(profile.id)
      .set(profile)

    notify.success('Profil mis à jour avec succès.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export default {update}
