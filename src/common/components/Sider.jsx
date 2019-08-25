import React from 'react'
import {withRouter} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Icon from 'antd/es/icon'
import Layout from 'antd/es/layout'
import Menu from 'antd/es/menu'

import SelectLanguage from './SelectLanguage'
import {useAuth} from '../../auth/hooks'
import Logo from './Logo'

const styles = {
  container: {
    height: '100%',
    minHeight: '100%',
  },
  logo: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 63,
    padding: 10,
  },
  logout: {
    marginTop: 30,
  },
  lang: {
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
  const {t} = useTranslation()

  if (!user || route === '/logout') {
    return null
  }

  const selectedKeys = (() => {
    if (route.startsWith('/documents')) {
      return ['/documents']
    } else if (route.startsWith('/clients')) {
      return ['/clients']
    } else if (route.startsWith('/records')) {
      return ['/records']
    } else return [route]
  })()

  function handleCollapse(collapsed) {
    props.onCollapse(collapsed ? 80 : 200)
  }

  return (
    <Layout.Sider breakpoint="md" onCollapse={handleCollapse} style={styles.container}>
      <div style={styles.logo}>
        <Logo light="#ffffff" dark="hsla(0, 0%, 100%, .65)" />
      </div>
      <Menu
        theme="dark"
        onClick={event => history.push(event.key)}
        selectedKeys={selectedKeys}
        mode="inline"
      >
        <Menu.Item key="/">
          <Icon type="dashboard" />
          <span>{t('overview')}</span>
        </Menu.Item>
        <Menu.Item key="/profile">
          <Icon type="user" />
          <span>{t('profile')}</span>
        </Menu.Item>
        <Menu.Item key="/clients">
          <Icon type="team" />
          <span>{t('clients')}</span>
        </Menu.Item>
        <Menu.Item key="/documents">
          <Icon type="form" />
          <span>{t('documents')}</span>
        </Menu.Item>
        <Menu.Item key="/records">
          <Icon type="read" />
          <span>{t('records')}</span>
        </Menu.Item>
        <Menu.Item key="/logout" style={styles.logout}>
          <Icon type="logout" />
          <span>{t('logout')}</span>
        </Menu.Item>
      </Menu>
      <div style={styles.lang}>
        <SelectLanguage placement="topCenter" />
      </div>
    </Layout.Sider>
  )
}

export default withRouter(Sider)
