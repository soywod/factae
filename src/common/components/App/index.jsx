import React from 'react'
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom'
import Layout from 'antd/es/layout'

import {useAuthService} from '../../../auth/hooks'
import {useProfileService} from '../../../profile/hooks'
import {useClientService} from '../../../client/hooks'
import {useDocumentService} from '../../../document/hooks'
import Navbar from '../../../common/components/Navbar'
import PrivateRoute from '../../../auth/components/PrivateRoute'
import Auth from '../../../auth/components/Auth'
import Logout from '../../../auth/components/Logout'
import Profile from '../../../profile/components/Edit'
import ClientList from '../../../client/components/List'
import ClientEdit from '../../../client/components/Edit'
import DocumentList from '../../../document/components/List'
import DocumentEdit from '../../../document/components/Edit'

import './styles.css'

function App() {
  useAuthService()
  useProfileService()
  useClientService()
  useDocumentService()

  return (
    <Layout className="layout">
      <Router>
        <Navbar />
        <Switch>
          <Route path="/auth" component={Auth} />
          <PrivateRoute path="/logout" component={Logout} />
          <PrivateRoute path="/documents/:id" component={DocumentEdit} />
          <PrivateRoute path="/documents" component={DocumentList} />
          <PrivateRoute path="/clients/:id" component={ClientEdit} />
          <PrivateRoute path="/clients" component={ClientList} />
          <PrivateRoute path="/profile" component={Profile} />
          <Redirect to="/documents" />
        </Switch>
      </Router>
    </Layout>
  )
}

export default App
