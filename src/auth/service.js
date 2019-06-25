import firebase from 'firebase/app'
import message from 'antd/es/message'

async function register(email, password) {
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password)
  } catch (error) {
    message.error(error.message)
  }
}

async function login(email, password) {
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password)
  } catch (error) {
    message.error(error.message)
  }
}

async function check(callback) {
  try {
    firebase.auth().onAuthStateChanged((user, error) => {
      if (error) callback(false)
      else if (user) callback(user)
      else callback(false)
    })
  } catch (error) {
    callback(false)
  }
}

async function logout() {
  firebase.auth().signOut()
}

export default {register, login, check, logout}
