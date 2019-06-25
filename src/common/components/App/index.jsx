import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'

import PrivateRoute from '../../../auth/components/PrivateRoute'
import Register from '../../../auth/components/Register'
import ResetPassword from '../../../auth/components/ResetPassword'
import Login from '../../../auth/components/Login'
import Logout from '../../../auth/components/Logout'
import Home from '../../../home/components/Home'
import AuthProvider from '../../../auth/provider'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route path="/register" component={Register} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <PrivateRoute path="/" component={Home}></PrivateRoute>
        </Switch>
      </Router>
    </AuthProvider>
  )
}

export default App
