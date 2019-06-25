import React from 'react'
import {Route, Redirect} from 'react-router-dom'

import useAuthContext from '../context'

function PrivateRoute(props) {
  const user = useAuthContext()

  if (user === null) return null
  return user ? <Route {...props} /> : <Redirect to="/login" />
}

export default PrivateRoute
