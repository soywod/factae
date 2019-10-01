import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Tabs from 'antd/es/tabs'

import EditAccount from '../../profile/components/EditAccount'
import EditEnterprise from '../../profile/components/EditEnterprise'
import EditInvoicing from '../../profile/components/EditInvoicing'
import {useNotification} from '../../utils/notification'
import $profile from '../../profile/service'
import {validateFields} from './FormCard'
import Container from './Container'
import Title from './Title'

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 24},
    md: {span: 24},
    lg: {span: 5},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 24},
    md: {span: 24},
    lg: {span: 19},
  },
}

function Settings(props) {
  const defaultActiveKey = props.match.params.tab || 'account'
  const [activeKey, setActiveKey] = useState(defaultActiveKey)
  const [loading, setLoading] = useState(false)
  const tryAndNotify = useNotification()
  const {t} = useTranslation()

  function changeTab(tab) {
    props.history.push(`/settings/${tab}`)
  }

  async function saveProfile(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)

    await tryAndNotify(async () => {
      const nextProfile = await validateFields(props.form)
      await $profile.set(nextProfile)
      return t('/profile.updated-successfully')
    })

    setLoading(false)
  }

  useEffect(() => {
    setActiveKey(props.match.params.tab)
  }, [props.match.params.tab])

  return (
    <Container>
      <Form noValidate {...formItemLayout} onSubmit={saveProfile}>
        <Title label={t('settings')}>
          <Button type="primary" htmlType="submit" disabled={loading}>
            <Icon type={loading ? 'loading' : 'save'} />
            {t('save')}
          </Button>
        </Title>

        <Tabs
          type="card"
          defaultActiveKey={defaultActiveKey}
          activeKey={activeKey}
          onChange={changeTab}
        >
          <Tabs.TabPane tab={t('my-account')} key="account">
            <EditAccount form={props.form} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('my-enterprise')} key="enterprise">
            <EditEnterprise form={props.form} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('my-invoicing')} key="invoicing">
            <EditInvoicing form={props.form} />
          </Tabs.TabPane>
        </Tabs>
      </Form>
    </Container>
  )
}

export default Form.create()(Settings)
