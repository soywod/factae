import React, {useCallback, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {withRouter} from 'react-router-dom'
import isNull from 'lodash/fp/isNull'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Spin from 'antd/es/spin'

import Loader from '../../common/components/Loader'
import SelectLanguage from '../../common/components/SelectLanguage'
import Logo from '../../common/components/Logo'
import Link from '../../common/components/Link'
import {notify} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import $auth from '../service'
import {useAuth} from '../hooks'

import background from './background.jpeg'

const styles = {
  container: {
    alignItems: 'center',
    backgroundSize: 'cover',
    background: `url(${background}) no-repeat center center`,
    bottom: 0,
    padding: 15,
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
    maxWidth: 450,
    width: '100%',
  },
  title: {
    position: 'relative',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  subtitle: {
    margin: '8px 0 0 0',
    opacity: 0.3,
    fontSize: '.9em',
    fontStyle: 'italic',
  },
  selectLanguage: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
}

const withHOCs = Auth => Form.create()(withRouter(Auth))
const Auth = withHOCs(props => {
  const {getFieldDecorator} = props.form
  const params = new URLSearchParams(props.location.search)
  const [loading, setLoading] = useState(false)
  const user = useAuth()
  const profile = useProfile()
  const {t, i18n} = useTranslation()
  const defaultEmail = params.get('email') || ''

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
    notify.success(t('/auth.registered-successfully'))
  }

  async function resetPassword() {
    const {email} = await props.form.validateFields(['email'])
    await $auth.resetPassword(email)
    props.form.resetFields()
    notify.success(t('/auth.password-reset-successfully'))
    setLoading(false)
  }

  useEffect(() => {
    if (user && profile) {
      const diff = profile.expiresAt.toRelative({locale: i18n.language})
      const name = profile && profile.firstName ? profile.firstName.trim() : ''
      notify.info(t('/auth.logged-in-successfully', {name, date: diff}))
      props.history.push('/')
    }
  }, [user, profile, props.history])

  return (
    <div style={styles.container}>
      <Spin size="large" spinning={loading || isNull(user) || (user && isNull(profile))}>
        <Card
          id="auth"
          title={
            <div style={styles.title}>
              <Logo width={150} />
              <SelectLanguage style={styles.selectLanguage} />
              <div style={styles.subtitle}>{t('/auth.tagline')}</div>
            </div>
          }
        >
          <Form onSubmit={doAsyncTask(login)}>
            <Form.Item>
              {getFieldDecorator('email', {
                initialValue: defaultEmail,
                rules: [
                  {type: 'email', message: t('email-invalid')},
                  {required: true, message: t('email-required')},
                ],
              })(
                <Input
                  size="large"
                  prefix={<Icon type="user" style={{color: 'rgba(0, 0, 0, .25)'}} />}
                  suffix={
                    <Link to="/demo" tabindex="-1" style={{display: 'flex'}}>
                      {t('demo')} <Icon type="arrow-right" style={{marginTop: 5}} />
                    </Link>
                  }
                  placeholder={t('email')}
                  autoComplete="email"
                  autoFocus={!Boolean(defaultEmail)}
                />,
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [
                  {min: 6, message: t('password-too-short')},
                  {required: true, message: t('password-required')},
                ],
              })(
                <Input
                  size="large"
                  prefix={<Icon type="lock" style={{color: 'rgba(0, 0, 0, .25)'}} />}
                  type="password"
                  placeholder={t('password')}
                  autoComplete="current-password"
                  autoFocus={Boolean(defaultEmail)}
                />,
              )}
            </Form.Item>
            <div>
              <Button block size="large" type="primary" htmlType="submit" style={{marginBottom: 8}}>
                {t('sign-in')}
              </Button>
              <Button block type="dashed" onClick={doAsyncTask(register)} style={{marginBottom: 8}}>
                {t('sign-up')}
              </Button>
              <Button block type="link" to="/reset-password" onClick={doAsyncTask(resetPassword)}>
                {t('forgotten-password')}
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
  const login = useCallback(async () => {
    try {
      await $auth.login('demo@factae.fr', 'factae')
      props.history.push('/')
    } catch (error) {
      notify.error(error.message)
    }
  }, [props.history])

  useEffect(() => {
    login()
  }, [login])

  return <Loader />
}

Auth.Logout = Logout
Auth.Demo = Demo

export default Auth
