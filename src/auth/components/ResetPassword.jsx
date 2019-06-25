import React, {useState} from 'react'
import {withRouter} from 'react-router-dom'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Button from 'antd/es/button'
import Card from 'antd/es/card'

import service from '../service'
import Logo from '../../common/components/Logo'

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
  button: {
    width: '100%',
  },
  action: {
    marginBottom: 0,
  },
}

function ResetPasswordForm(props) {
  const {getFieldDecorator} = props.form
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setLoading(true)
      const {email} = await props.form.validateFields()
      await service.resetPassword(email)
      props.history.push('/login')
    } catch (e) {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <Card
        title={
          <div style={styles.title}>
            <Logo />
          </div>
        }
        style={styles.card}
      >
        <Form onSubmit={handleSubmit}>
          <Form.Item>
            {getFieldDecorator('email', {
              rules: [{required: true, message: 'Veuillez saisir votre email'}],
            })(
              <Input
                prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}} />}
                placeholder="Email"
                autoComplete="email"
                autoFocus
              />,
            )}
          </Form.Item>
          <div>
            <Button type="danger" htmlType="submit" loading={loading} style={styles.button}>
              Réinitialiser mon mot de passe
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Form.create({name: 'reset-password'})(withRouter(ResetPasswordForm))
