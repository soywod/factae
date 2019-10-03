import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom'
import moment from 'moment'
import AntdProvider from 'antd/lib/config-provider'
import Button from 'antd/lib/button'
import Icon from 'antd/lib/icon'
import Layout from 'antd/lib/layout'
import en from 'antd/lib/locale-provider/en_GB'
import fr from 'antd/lib/locale-provider/fr_FR'

import {useAuthService} from '../../auth/hooks'
import {useProfileService} from '../../profile/hooks'
import {useClientService} from '../../client/hooks'
import {useDocumentService} from '../../document/hooks'
import {useRecordService} from '../../record/hooks'
import PrivateRoute from '../../auth/components/PrivateRoute'
import Auth from '../../auth/components/Auth'
import ClientList from '../../client/components/List'
import ClientEdit from '../../client/components/Edit'
import RecordList from '../../record/components/List'
import RecordEdit from '../../record/components/Edit'
import DocumentList from '../../document/components/List'
import DocumentEdit from '../../document/components/Edit'
import Dashboard from '../../dashboard/components'
import CookieConsent from './CookieConsent'
import Settings from './Settings'
import Support from './Support'
import Sider from './Sider'

import 'moment/locale/fr'
import 'moment/locale/en-gb'

import './App.styles.less'

const locales = {en, fr}

function App() {
  const [siderVisible, setSiderVisible] = useState(false)
  const {i18n} = useTranslation()

  useAuthService()
  useProfileService()
  useClientService()
  useDocumentService()
  useRecordService()

  useEffect(() => {
    moment.locale(i18n.language)
  }, [i18n.language])

  return (
    <AntdProvider locale={locales[i18n.language]}>
      <Layout>
        <Router>
          <Button
            className="ant-sider-burger"
            type="link"
            size="large"
            onClick={() => setSiderVisible(!siderVisible)}
          >
            <Icon type="menu" />
          </Button>
          <Layout.Sider
            className={`ant-layout-sider-container ant-layout-sider-${siderVisible ? 'on' : 'off'}`}
          >
            <Sider />
          </Layout.Sider>
          <Layout className="ant-layout-content">
            <Switch>
              <Route path="/auth" component={Auth} />
              <Route path="/demo" component={Auth.Demo} />
              <PrivateRoute path="/logout" component={Auth.Logout} />
              <PrivateRoute path="/support" component={Support} />
              <PrivateRoute path="/clients/:id" component={ClientEdit} />
              <PrivateRoute path="/clients" component={ClientList} />
              <PrivateRoute path="/records/:id" component={RecordEdit} />
              <PrivateRoute path="/records" component={RecordList} />
              <PrivateRoute path="/documents/:id" component={DocumentEdit} />
              <PrivateRoute path="/documents" component={DocumentList} />
              <PrivateRoute path="/settings/:tab?" component={Settings} />
              <PrivateRoute expact path="/" component={Dashboard} />
              <Redirect to="/" />
            </Switch>
          </Layout>
        </Router>
        <CookieConsent />
      </Layout>
    </AntdProvider>
  )
}

export default App
