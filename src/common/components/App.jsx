import React, {useState} from 'react'
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom'
import Layout from 'antd/es/layout'

import {useAuthService} from '../../auth/hooks'
import {useProfileService} from '../../profile/hooks'
import {useClientService} from '../../client/hooks'
import {useDocumentService} from '../../document/hooks'
import PrivateRoute from '../../auth/components/PrivateRoute'
import Auth from '../../auth/components/Auth'
import Profile from '../../profile/components/Edit'
import ClientList from '../../client/components/List'
import ClientEdit from '../../client/components/Edit'
import DocumentList from '../../document/components/List'
import DocumentEdit from '../../document/components/Edit'
import Dashboard from '../../dashboard/components'
import CookieConsent from './CookieConsent'
import Sider from './Sider'

import './App.styles.css'

function App() {
  const [width, setWidth] = useState(200)

  useAuthService()
  useProfileService()
  useClientService()
  useDocumentService()

  return (
    <Layout>
      <Router>
        <Layout.Sider style={{height: '100vh', left: 0, overflow: 'auto', position: 'fixed'}}>
          <Sider onCollapse={setWidth} />
        </Layout.Sider>
        <Layout style={{marginLeft: width, zIndex: 1}}>
          <Switch>
            <Route path="/auth" component={Auth} />
            <Route path="/demo" component={Auth.Demo} />
            <PrivateRoute path="/logout" component={Auth.Logout} />
            <PrivateRoute path="/documents/:id" component={DocumentEdit} />
            <PrivateRoute path="/documents" component={DocumentList} />
            <PrivateRoute path="/clients/:id" component={ClientEdit} />
            <PrivateRoute path="/clients" component={ClientList} />
            <PrivateRoute path="/profile" component={Profile} />
            <PrivateRoute expact path="/" component={Dashboard} />
            <Redirect to="/" />
          </Switch>
        </Layout>
      </Router>
      <CookieConsent />
    </Layout>
  )
}

export default App
