import firebase from 'firebase/app'
import message from 'antd/es/message'

import 'firebase/auth'
import 'firebase/firestore'

firebase.initializeApp({
  apiKey: 'AIzaSyBJD1hGI6mhYJwOhb6Fk0kGvuJiqYO-Lr8',
  authDomain: 'factae-53dad.firebaseapp.com',
  databaseURL: 'https://factae-53dad.firebaseio.com',
  projectId: 'factae-53dad',
  storageBucket: '',
  messagingSenderId: '81874227248',
  appId: '1:81874227248:web:a3d61ab135d51532',
})

export async function login(email, password) {
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password)
  } catch (error) {
    message.error(error.message)
  }
}

export async function register(email, password) {
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password)
  } catch (error) {
    message.error(error.message)
  }
}
