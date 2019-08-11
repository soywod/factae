import React from 'react'
import {withRouter} from 'react-router-dom'
import Menu from 'antd/es/menu'
import Icon from 'antd/es/icon'
import Layout from 'antd/es/layout'

import {useAuth} from '../../auth/hooks'
import Logo from './Logo'

const styles = {
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
    <Layout.Sider breakpoint="md" onCollapse={handleCollapse}>
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
          <span>Vue d'ensemble</span>
        </Menu.Item>
        <Menu.Item key="/documents">
          <Icon type="copy" />
          <span>Documents</span>
        </Menu.Item>
        <Menu.Item key="/clients">
          <Icon type="team" />
          <span>Clients</span>
        </Menu.Item>
        <Menu.Item key="/profile">
          <Icon type="user" />
          <span>Profil</span>
        </Menu.Item>
        <Menu.Item key="/logout">
          <Icon type="logout" />
          <span>Déconnexion</span>
        </Menu.Item>
      </Menu>
    </Layout.Sider>
  )
}

export default withRouter(Sider)
