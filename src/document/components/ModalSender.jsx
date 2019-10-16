import React from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Row from 'antd/es/row'
import find from 'lodash/fp/find'
import getOr from 'lodash/fp/getOr'

import {validateFields} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'

function ModalSender({form, document, visible, loading, onClose: close}) {
  const {getFieldDecorator} = form
  const profile = useProfile()
  const clients = useClients()
  const {t} = useTranslation()

  function getHtmlMessage() {
    const textMessage = form.getFieldValue('html') || ''
    const htmlMessage = textMessage.replace(/\n/g, '<br />')
    const textSignature = (profile && profile.signature) || ''
    const htmlSignature = textSignature.replace(/\n/g, '<br />')

    return htmlMessage + '<br />' + htmlSignature
  }

  async function submit() {
    if (loading) return
    const fields = await validateFields(form)
    close({
      ...fields,
      message: getHtmlMessage(fields.message),
      attachments: [
        {
          path: document.pdf,
          filename: document.number + '.pdf',
        },
      ],
    })
  }

  const footer = (
    <Button.Group>
      <Button onClick={() => close()} disabled={loading}>
        {t('cancel')}
      </Button>
      <Button
        htmlType="submit"
        type="primary"
        onClick={submit}
        disabled={loading}
        style={{marginLeft: 4}}
      >
        <Icon type={loading ? 'loading' : 'mail'} />
        {t('send')}
      </Button>
    </Button.Group>
  )

  if (!profile || !clients) {
    return null
  }

  const client = find({id: document.client}, clients)
  const contact = getOr(null, 'contacts.0', client)

  return (
    <Modal
      title={t('send')}
      visible={visible}
      footer={footer}
      closable={!loading}
      onCancel={() => close()}
    >
      <Form noValidate layout="vertical">
        <Row gutter={15}>
          <Col xs={24}>
            <Form.Item label={t('from')}>
              {getFieldDecorator('from', {
                initialValue: `${profile.firstName} ${profile.lastName} <${profile.email}>`,
                rules: [{required: true, message: t('field-required')}],
              })(<Input size="large" />)}
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label={t('to')}>
              {getFieldDecorator('to', {
                initialValue: contact ? `${contact.name} <${contact.email}>` : '',
                rules: [{required: true, message: t('field-required')}],
              })(<Input size="large" autoFocus />)}
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label={t('subject')}>
              {getFieldDecorator('subject', {
                initialValue: profile.subject,
                rules: [{required: true, message: t('field-required')}],
              })(<Input size="large" />)}
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label={t('message')}>
              {getFieldDecorator('html', {
                rules: [{required: true, message: t('field-required')}],
              })(<Input.TextArea rows={8} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default Form.create()(ModalSender)
