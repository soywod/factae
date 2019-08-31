import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Select from 'antd/es/select'

import {useNotification} from '../../utils/notification'
import $document from '../../document/service'
import {useProfile} from '../../profile/hooks'
import Title from './Title'
import FormCard, {validateFields} from './FormCard'
import Container from './Container'

const categories = ['question', 'feedback', 'bug', 'feature', 'other']

function Help(props) {
  const profile = useProfile()
  const [loading, setLoading] = useState(false)
  const tryAndNotify = useNotification()
  const {t} = useTranslation()
  const requiredRules = {rules: [{required: true, message: t('field-required')}]}

  if (!profile) {
    return null
  }

  async function sendMail(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)

    await tryAndNotify(
      async () => {
        const {subject, message} = await validateFields(props.form)
        await $document.sendMail({
          from: profile.email,
          to: 'contact@mail.factae.fr',
          cc: profile.email,
          subject: '[factAE] ' + subject,
          text: message,
        })

        props.history.push('/')
        return t('/help.sent-successfully')
      },
      () => setLoading(false),
    )
  }

  const fields = [
    {
      name: 'subject',
      Component: (
        <Select size="large">
          {categories.map(c => (
            <Select.Option key={c} value={t('/help.' + c)}>
              {t('/help.' + c)}
            </Select.Option>
          ))}
        </Select>
      ),
      fluid: true,
      ...requiredRules,
    },
    {name: 'message', Component: <Input.TextArea rows={5} />, fluid: true, ...requiredRules},
  ]

  return (
    <Container>
      <Form noValidate layout="vertical" onSubmit={sendMail}>
        <Title label="help">
          <Button type="primary" htmlType="submit" disabled={loading}>
            <Icon type={loading ? 'loading' : 'mail'} />
            {t('send')}
          </Button>
        </Title>

        <FormCard form={props.form} model={{}} fields={fields} />
      </Form>
    </Container>
  )
}

export default Form.create()(Help)
