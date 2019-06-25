import firebase from 'firebase/app'
import message from 'antd/es/message'

async function register(email, password) {
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password)
    message.success('Compte créé avec succès.')
  } catch (error) {
    message.error(error.message)
    throw error
  }
}

async function login(email, password) {
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password)
  } catch (error) {
    message.error(error.message)
    throw error
  }
}

async function resetPassword(email) {
  try {
    await firebase.auth().sendPasswordResetEmail(email)
    message.success('Un email vous a été envoyé avec la procédure à suivre.')
  } catch (error) {
    message.error(error.message)
    throw error
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
  await firebase.auth().signOut()
}

export default {register, login, resetPassword, check, logout}
