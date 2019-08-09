import React, {useEffect, useState} from 'react'
import {withRouter} from 'react-router-dom'
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
    width: '100%',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    maxWidth: 350,
    width: '100%',
  },
  title: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}

function Auth(props) {
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

  if (user === null) {
    return null
  }

  return (
    <div style={styles.container}>
      <Spin size="large" spinning={loading}>
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
}

export default Form.create()(withRouter(Auth))