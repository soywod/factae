import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/lib/button'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Tabs from 'antd/lib/tabs'

import {useOnboarding} from '../../utils/onboarding'
import EditAccount from '../../profile/components/EditAccount'
import EditEnterprise from '../../profile/components/EditEnterprise'
import EditInvoicing from '../../profile/components/EditInvoicing'
import {useNotification} from '../../utils/notification'
import $profile from '../../profile/service'
import {validateFields} from './FormCard'
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
  const onboarding = useOnboarding()
  const {t} = useTranslation()

  useEffect(() => {
    setActiveKey(props.match.params.tab)
  }, [props.match.params.tab])

  if (!onboarding) {
    return null
  }

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

  function getTab(section) {
    if (onboarding.isDone) {
      return t('my-' + section)
    }

    let icon = (
      <Icon className="success" theme="filled" type="check-circle" style={{marginRight: 8}} />
    )

    if (
      (section === 'account' && !onboarding.hasValidAccountProfile) ||
      (section === 'enterprise' && !onboarding.hasValidEnterpriseProfile)
    ) {
      icon = <Icon className="error" theme="filled" type="close-circle" style={{marginRight: 8}} />
    }

    return (
      <>
        {icon}
        {t(`my-${section}`)}
      </>
    )
  }

  return (
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
        <Tabs.TabPane tab={getTab('account')} key="account">
          <EditAccount form={props.form} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={getTab('enterprise')} key="enterprise">
          <EditEnterprise form={props.form} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={getTab('invoicing')} key="invoicing">
          <EditInvoicing form={props.form} />
        </Tabs.TabPane>
      </Tabs>
    </Form>
  )
}

export default Form.create()(Settings)
