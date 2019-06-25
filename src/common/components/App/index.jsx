import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import Layout from 'antd/es/layout'

import Navbar from '../../../common/components/Navbar'
import AuthProvider from '../../../auth/provider'
import PrivateRoute from '../../../auth/components/PrivateRoute'
import Register from '../../../auth/components/Register'
import ResetPassword from '../../../auth/components/ResetPassword'
import Login from '../../../auth/components/Login'
import Logout from '../../../auth/components/Logout'
import Overview from '../../../overview/components/Overview'
import Profile from '../../../profile/components/Edit'

function App() {
  return (
    <Layout className="layout">
      <AuthProvider>
        <Router>
          <Navbar />
          <Switch>
            <Route path="/register" component={Register} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <PrivateRoute path="/profile" component={Profile} />
            <PrivateRoute path="/" component={Overview} />
          </Switch>
        </Router>
      </AuthProvider>
    </Layout>
  )
}

export default App
