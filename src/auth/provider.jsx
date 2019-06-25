import React, {useEffect, useState} from 'react'

import {AuthContext} from './context'
import {check} from './service'

function AuthProvider(props) {
  const state = useState(null)
  const [user, setUser] = state

  console.debug('auth: ', user)

  useEffect(() => {
    try {
      check(setUser)
    } catch (error) {
      setUser(false)
    }
  }, [])

  if (user === null) {
    return null
  }

  return <AuthContext.Provider value={state}>{props.children}</AuthContext.Provider>
}

export default AuthProvider
