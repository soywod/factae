import React from 'react'
import {useTranslation} from 'react-i18next'
import Input from 'antd/lib/input'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Typography from 'antd/lib/typography'
import Form from 'antd/lib/form'
import Divider from 'antd/lib/divider'

import DocumentThemePicker from '../../common/components/DocumentThemePicker'
import FormItems from '../../common/components/FormItems'
import {useProfile} from '../hooks'
import Subscription from './Subscription'

const styles = {
  title: {
    fontSize: '1.2rem',
    margin: '0 0 15px 0',
  },
}

function EditAccount({form}) {
  const {t} = useTranslation()
  const profile = useProfile()

  if (!profile) {
    return null
  }

  const requiredRules = {rules: [{required: true, message: t('field-required')}]}

  const personalIdentityFields = [
    {name: 'firstName', Component: <Input size="large" autoFocus />, ...requiredRules},
    {name: 'lastName', ...requiredRules},
    {name: 'address', ...requiredRules},
    {name: 'zip', ...requiredRules},
    {name: 'city', ...requiredRules},
    {name: 'email', Component: <Input size="large" disabled />, ...requiredRules},
    {name: 'phone'},
  ]

  return (
    <Row gutter={24}>
      <Col xs={24} sm={24} md={24} lg={12}>
        <Typography.Title level={2} style={styles.title}>
          {t('personal-information')}
        </Typography.Title>
        <FormItems form={form} model={profile} fields={personalIdentityFields} />
      </Col>
      <Col xs={24} sm={24} md={24} lg={12}>
        <Typography.Title level={2} style={styles.title}>
          {t('subscription')}
        </Typography.Title>
        <Subscription />

        <Divider />

        <Typography.Title level={2} style={styles.title}>
          {t('documents-theme')}
        </Typography.Title>
        <Form.Item wrapperCol={{xs: {span: 24}}}>
          {form.getFieldDecorator('documentsTheme', {
            initialValue: profile.documentsTheme || 'default',
            ...requiredRules,
          })(
            <DocumentThemePicker
              preview={form.getFieldValue('documentsTheme') || profile.documentsTheme}
            />,
          )}
        </Form.Item>

        <Divider />

        <Typography.Title level={2} style={styles.title}>
          {t('edit-password')}
        </Typography.Title>
        <div>{t('soon')}</div>

        <Divider />

        <Typography.Title level={2} style={styles.title}>
          {t('delete-account')}
        </Typography.Title>
        <div>{t('soon')}</div>
      </Col>
    </Row>
  )
}

export default EditAccount
