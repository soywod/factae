import firebase from 'firebase/app'

import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

firebase.initializeApp({
  apiKey: 'AIzaSyBJD1hGI6mhYJwOhb6Fk0kGvuJiqYO-Lr8',
  authDomain: 'factae-53dad.firebaseapp.com',
  databaseURL: 'https://factae-53dad.firebaseio.com',
  projectId: 'factae-53dad',
  storageBucket: 'factae-53dad.appspot.com',
  messagingSenderId: '81874227248',
  appId: '1:81874227248:web:a3d61ab135d51532',
})

export const auth = firebase.auth

export function db(collection, doc) {
  const firestore = firebase.firestore()
  const db = firestore.collection(collection)

  return doc ? db.doc(doc) : db
}

export default firebase
