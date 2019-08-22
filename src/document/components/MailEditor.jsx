import React from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Row from 'antd/es/row'
import Tabs from 'antd/es/tabs'
import find from 'lodash/fp/find'

import {validateFields} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'

function MailEditor({form, document, visible, onClose: close}) {
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
    let data = await validateFields(form)
    data.message = getHtmlMessage(data.message)
    close(data)
  }

  const footer = (
    <>
      <Button type="default" onClick={() => close()}>
        {t('cancel')}
      </Button>
      <Button
        type="dashed"
        href={document.pdf}
        download={document.number}
        style={{margin: '0 6px'}}
      >
        <Icon type="download" />
        {t('download')}
      </Button>
      <Button htmlType="submit" type="primary" onClick={submit}>
        <Icon type="mail" />
        {t('send')}
      </Button>
    </>
  )

  if (!profile || !clients) {
    return null
  }

  const client = find({id: document.client}, clients)

  return (
    <Modal
      title={t('presend')}
      visible={visible}
      footer={footer}
      closable={false}
      bodyStyle={{paddingTop: 0}}
    >
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab={t('editor')} key="1">
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
                    initialValue: client ? `${client.name} <${client.email}>` : '',
                    rules: [{required: true, message: t('field-required')}],
                  })(<Input size="large" />)}
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
                  })(<Input.TextArea rows={8} autoFocus />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('preview')} key="2">
          <div dangerouslySetInnerHTML={{__html: getHtmlMessage()}} />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
}

export default Form.create()(MailEditor)
