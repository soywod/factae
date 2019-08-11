import React, {useState} from 'react'
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom'
import Layout from 'antd/es/layout'

import {useAuthService} from '../../../auth/hooks'
import {useProfileService} from '../../../profile/hooks'
import {useClientService} from '../../../client/hooks'
import {useDocumentService} from '../../../document/hooks'
import Sider from '../../../common/components/Sider'
import PrivateRoute from '../../../auth/components/PrivateRoute'
import Auth from '../../../auth/components/Auth'
import Profile from '../../../profile/components/Edit'
import ClientList from '../../../client/components/List'
import ClientEdit from '../../../client/components/Edit'
import DocumentList from '../../../document/components/List'
import DocumentEdit from '../../../document/components/Edit'

import './styles.css'

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
            <Redirect to="/documents" />
          </Switch>
        </Layout>
      </Router>
    </Layout>
  )
}

export default App
