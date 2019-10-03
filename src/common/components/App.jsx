import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom'
import moment from 'moment'
import AntdProvider from 'antd/lib/config-provider'
import Icon from 'antd/lib/icon'
import Layout from 'antd/lib/layout'
import Menu from 'antd/lib/menu'
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
import Logo from './Logo'
import Link from './Link'

import 'moment/locale/fr'
import 'moment/locale/en-gb'

import './App.styles.less'

const locales = {en, fr}

function App() {
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
      <Router>
        <Switch>
          <Route path="/auth" component={Auth} />
          <Route path="/demo" component={Auth.Demo} />
          <PrivateRoute path="/logout" component={Auth.Logout} />
          <PrivateRoute path="/support" component={withLayout(Support)} />
          <PrivateRoute path="/clients/:id" component={withLayout(ClientEdit)} />
          <PrivateRoute path="/clients" component={withLayout(ClientList)} />
          <PrivateRoute path="/records/:id" component={withLayout(RecordEdit)} />
          <PrivateRoute path="/records" component={withLayout(RecordList)} />
          <PrivateRoute path="/documents/:id" component={withLayout(DocumentEdit)} />
          <PrivateRoute path="/documents" component={withLayout(DocumentList)} />
          <PrivateRoute path="/settings/:tab?" component={withLayout(Settings)} />
          <PrivateRoute expact path="/" component={withLayout(Dashboard)} />
          <Redirect to="/" />
        </Switch>
      </Router>
      <CookieConsent />
    </AntdProvider>
  )
}

const withLayout = Component => props => {
  const [siderVisible, setSiderVisible] = useState(false)

  return (
    <Layout>
      <Layout.Header>
        <Link className="ant-layout-header-logo" to="/">
          <Logo light="#ffffff" dark="hsla(0, 0%, 100%, .65)" width={75} />
        </Link>
        <div style={{flex: 1}}>
          <Menu className="ant-layout-header-menu" mode="horizontal" theme="dark" selectedKeys={[]}>
            <Menu.Item key="burger" onClick={() => setSiderVisible(!siderVisible)}>
              <Icon type="menu" />
            </Menu.Item>
          </Menu>
        </div>
      </Layout.Header>
      <Layout.Sider breakpoint="md" className={`ant-layout-sider-${siderVisible ? 'on' : 'off'}`}>
        <Sider />
      </Layout.Sider>
      <Layout.Content>
        <Component {...props} />
      </Layout.Content>
    </Layout>
  )
}

export default App
