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
  },
  flags: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    marginBottom: 25,
  },
  logo: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 63,
    padding: 10,
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
        <Menu.Item key="/documents">
          <Icon type="copy" />
          <span>{t('documents')}</span>
        </Menu.Item>
        <Menu.Item key="/clients">
          <Icon type="team" />
          <span>{t('clients')}</span>
        </Menu.Item>
        <Menu.Item key="/profile">
          <Icon type="user" />
          <span>{t('profile')}</span>
        </Menu.Item>
        <Menu.Item key="/logout">
          <Icon type="logout" />
          <span>{t('logout')}</span>
        </Menu.Item>
      </Menu>
      <div style={styles.flags}>
        <SelectLanguage />
      </div>
    </Layout.Sider>
  )
}

export default withRouter(Sider)
