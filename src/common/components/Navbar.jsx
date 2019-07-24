import React from 'react'
import {withRouter} from 'react-router-dom'
import Menu from 'antd/es/menu'
import Icon from 'antd/es/icon'
import Layout from 'antd/es/layout'

import {useAuth} from '../../auth/hooks'
import Logo from './Logo'

const {Header} = Layout

const styles = {
  logo: {
    float: 'left',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '63px',
    marginRight: '20px',
  },
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e8e8e8',
    display: 'flex',
  },
  menu: {
    lineHeight: '61px',
    height: '64px',
  },
  main: {
    flex: 1,
  },
}

function Navbar(props) {
  const {history} = props
  const route = history.location.pathname
  const user = useAuth()

  if (!user || route === '/logout') {
    return null
  }

  return (
    <Header style={styles.header}>
      <div style={styles.logo}>
        <Logo light="#333333" dark="#000000" />
      </div>
      <div style={styles.main}>
        <Menu
          onClick={e => history.push(e.key)}
          selectedKeys={[route]}
          mode="horizontal"
          style={styles.menu}
        >
          <Menu.Item key="/">
            <Icon type="dashboard" />
            Vue d'ensemble
          </Menu.Item>
          <Menu.Item key="/clients">
            <Icon type="usergroup-add" />
            Clients
          </Menu.Item>
          <Menu.Item key="/profile">
            <Icon type="user" />
            Profil
          </Menu.Item>
        </Menu>
      </div>
      <Menu
        onClick={e => history.push(e.key)}
        selectedKeys={[route]}
        mode="horizontal"
        style={styles.menu}
      >
        <Menu.Item key="/logout">
          <Icon type="logout" />
          Déconnexion
        </Menu.Item>
      </Menu>
    </Header>
  )
}

export default withRouter(Navbar)
