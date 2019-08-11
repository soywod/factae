import React, {useEffect, useState} from 'react'
import {withRouter} from 'react-router-dom'
import isNull from 'lodash/fp/isNull'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Spin from 'antd/es/spin'

import Logo from '../../common/components/Logo'
import {notify} from '../../utils/notification'
import $auth from '../service'
import {useAuth} from '../hooks'

const styles = {
  container: {
    alignItems: 'center',
    background: '#f0f2f5',
    bottom: 0,
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    left: 0,
    position: 'fixed',
    right: 0,
    top: 0,
    width: '100%',
    zIndex: 1,
  },
  card: {
    maxWidth: 350,
    width: '100%',
  },
  title: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
}

const withHOCs = Auth => Form.create()(withRouter(Auth))
const Auth = withHOCs(props => {
  const {email = '', password = ''} = props
  const {getFieldDecorator} = props.form
  const [loading, setLoading] = useState(false)
  const user = useAuth()

  const doAsyncTask = action => async event => {
    event.preventDefault()
    setLoading(true)

    try {
      await action()
    } catch (error) {
      if (error.message) notify.error(error.message)
      setLoading(false)
    }
  }

  async function login() {
    const {email, password} = await props.form.validateFields()
    await $auth.login(email, password)
  }

  async function register() {
    const {email, password} = await props.form.validateFields()
    await $auth.register(email, password)
    notify.success('Compte créé avec succès.')
  }

  async function resetPassword() {
    const {email} = await props.form.validateFields(['email'])
    await $auth.resetPassword(email)
    props.form.resetFields()
    notify.success('Un email vous a été envoyé avec la procédure à suivre.')
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      props.history.push('/')
    }
  }, [user, props.history])

  return (
    <div style={styles.container}>
      <Spin size="large" spinning={loading || isNull(user)}>
        <Card
          title={
            <div style={styles.title}>
              <Logo />
            </div>
          }
          style={styles.card}
        >
          <Form onSubmit={doAsyncTask(login)}>
            <Form.Item>
              {getFieldDecorator('email', {
                initialValue: email,
                rules: [
                  {type: 'email', message: 'Adresse email invalide.'},
                  {required: true, message: 'Adresse email requise.'},
                ],
              })(
                <Input
                  prefix={<Icon type="user" style={{color: 'rgba(0, 0, 0, .25)'}} />}
                  placeholder="Email"
                  autoComplete="email"
                  autoFocus
                />,
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                initialValue: password,
                rules: [
                  {min: 6, message: 'Mot de passe trop court.'},
                  {required: true, message: 'Mot de passe requis.'},
                ],
              })(
                <Input
                  prefix={<Icon type="lock" style={{color: 'rgba(0, 0, 0, .25)'}} />}
                  type="password"
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                />,
              )}
            </Form.Item>
            <div>
              <Button block type="primary" htmlType="submit" style={{marginBottom: 8}}>
                Se connecter
              </Button>
              <Button block type="dashed" onClick={doAsyncTask(register)} style={{marginBottom: 8}}>
                Créer un compte
              </Button>
              <Button block type="link" to="/reset-password" onClick={doAsyncTask(resetPassword)}>
                Mot de passe oublié
              </Button>
            </div>
          </Form>
        </Card>
      </Spin>
    </div>
  )
})

function Logout() {
  useEffect(() => {
    $auth.logout()
  }, [])

  return null
}

function Demo(props) {
  return <Auth email="demo@factae.fr" password="factae" {...props} />
}

Auth.Logout = Logout
Auth.Demo = Demo

export default Auth
