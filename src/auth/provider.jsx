import React, {useEffect, useState} from 'react'

import {AuthContext} from './context'
import service from './service'

function AuthProvider(props) {
  const [user, setUser] = useState(null)
  console.debug('auth: ', user)

  useEffect(() => {
    try {
      service.check(setUser)
    } catch (error) {
      setUser(false)
    }
  }, [])

  if (user === null) {
    return null
  }

  return <AuthContext.Provider value={user}>{props.children}</AuthContext.Provider>
}

export default AuthProvider
