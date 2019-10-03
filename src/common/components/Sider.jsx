import React from 'react'
import {withRouter} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Icon from 'antd/lib/icon'
import Layout from 'antd/lib/layout'
import Menu from 'antd/lib/menu'

import {useOnboarding} from '../../utils/onboarding'
import {useAuth} from '../../auth/hooks'
import Link from './Link'
import Logo from './Logo'

const styles = {
  bottomNav: {
    marginTop: 30,
  },
  logout: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 25,
  },
}

function Sider(props) {
  const {history} = props
  const route = history.location.pathname
  const user = useAuth()
  const onboarding = useOnboarding()
  const {t} = useTranslation()

  if (!user || !onboarding || route === '/logout') {
    return null
  }

  const selectedKeys = (() => {
    if (route.startsWith('/documents')) {
      return ['/documents']
    } else if (route.startsWith('/clients')) {
      return ['/clients']
    } else if (route.startsWith('/records')) {
      return ['/records']
    } else if (route.startsWith('/settings')) {
      return ['/settings/account']
    } else return [route]
  })()

  const mainMenu = []

  if (onboarding.isProfileValid) {
    mainMenu.push()
  }

  if (onboarding.hasOneClient) {
    mainMenu.push()
  }

  if (onboarding.hasOneDocument) {
    mainMenu.shift()
  }

  return (
    <Layout.Sider className="ant-sider" breakpoint="md">
      <Link to="/" className="ant-sider-logo">
        <Logo light="#ffffff" dark="hsla(0, 0%, 100%, .65)" />
      </Link>
      <Menu
        theme="dark"
        onClick={event => history.push(event.key)}
        selectedKeys={selectedKeys}
        mode="inline"
      >
        <Menu.Item key="/" disabled={!onboarding.isDone}>
          <Icon type="dashboard" />
          <span>{t('dashboard')}</span>
        </Menu.Item>
        <Menu.Item key="/clients" disabled={!onboarding.hasValidProfile}>
          <Icon type="team" />
          <span>{t('clients')}</span>
        </Menu.Item>
        <Menu.Item key="/documents" disabled={!onboarding.hasOneClient}>
          <Icon type="file-text" />
          <span>{t('quotations-and-invoices')}</span>
        </Menu.Item>
        <Menu.Item key="/records" disabled={!onboarding.isDone}>
          <Icon type="read" />
          <span>{t('records')}</span>
        </Menu.Item>

        <Menu.Item key="/settings/account" style={styles.bottomNav}>
          <Icon type="setting" />
          <span>{t('settings')}</span>
        </Menu.Item>
        <Menu.Item key="/support">
          <Icon type="question-circle" />
          <span>{t('support')}</span>
        </Menu.Item>
      </Menu>

      <div style={styles.logout}>
        <Menu
          theme="dark"
          onClick={event => history.push(event.key)}
          selectedKeys={selectedKeys}
          mode="inline"
        >
          <Menu.Item key="/logout">
            <Icon type="logout" />
            <span>{t('logout')}</span>
          </Menu.Item>
        </Menu>
      </div>
    </Layout.Sider>
  )
}

export default withRouter(Sider)
