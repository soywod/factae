import React, {useEffect, useState} from 'react'
import {withRouter} from 'react-router-dom'
import Menu from 'antd/es/menu'
import Icon from 'antd/es/icon'
import Layout from 'antd/es/layout'

import Logo from './Logo'

const {Header} = Layout

const styles = {
  logo: {
    float: 'left',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '64px',
    marginRight: '20px',
  },
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e8e8e8',
  },
  menu: {
    lineHeight: '61px',
    height: '64px',
  },
}

function Navbar(props) {
  const [route, setRoute] = useState(props.history.location.pathname)

  function changeRoute(e) {
    setRoute(e.key)
    props.history.push(e.key)
  }

  useEffect(() => {
    changeRoute({key: props.history.location.pathname})
  }, [props.history.location.pathname])

  if (['/register', '/login', '/logout'].includes(route)) {
    return null
  }

  return (
    <Header style={styles.header}>
      <div style={styles.logo}>
        <Logo light="#333333" dark="#000000" />
      </div>
      <Menu onClick={changeRoute} selectedKeys={[route]} mode="horizontal" style={styles.menu}>
        <Menu.Item key="/">
          <Icon type="dashboard" />
          Vue d'ensemble
        </Menu.Item>
        <Menu.Item key="/profile">
          <Icon type="user" />
          Profil
        </Menu.Item>
      </Menu>
    </Header>
  )
}

export default withRouter(Navbar)
