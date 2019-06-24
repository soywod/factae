import React, {useState} from 'react'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Button from 'antd/es/button'
import Row from 'antd/es/row'
import Col from 'antd/es/col'
import Card from 'antd/es/card'

import {login} from '../../utils/firebase'
import Logo from '../../common/components/Logo'
import Link from '../../common/components/Link'

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
  forgot: {
    float: 'right',
  },
  button: {
    width: '100%',
  },
  action: {
    marginBottom: 0,
  },
}

function LoginForm(props) {
  const {getFieldDecorator} = props.form
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const {email, password} = await props.form.validateFields()
      await login(email, password)
    } catch (e) {}

    setLoading(false)
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
                type="email"
                placeholder="Email"
                autoFocus
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{required: true, message: 'Veuillez saisir votre mot de passe'}],
            })(
              <Input
                prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}} />}
                type="password"
                placeholder="Mot de passe"
              />,
            )}
          </Form.Item>
          <div>
            <Button type="primary" htmlType="submit" loading={loading} style={styles.button}>
              Se connecter
            </Button>
            <Row>
              <Col xs={24} sm={12}>
                <Link to="/register" style={styles.button}>
                  Créer un compte
                </Link>
              </Col>
              <Col xs={24} sm={12}>
                <Link to="/reset-password" style={styles.button}>
                  Mot de passe oublié
                </Link>
              </Col>
            </Row>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Form.create({name: 'login'})(LoginForm)
