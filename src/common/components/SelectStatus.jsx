import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import moment from 'moment'
import Button from 'antd/lib/button'
import Col from 'antd/lib/col'
import Dropdown from 'antd/lib/dropdown'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Menu from 'antd/lib/menu'
import Modal from 'antd/lib/modal'
import Row from 'antd/lib/row'
import kebabCase from 'lodash/fp/kebabCase'

import AutoCompleteNature from './AutoCompleteNature'
import DatePicker from './DatePicker'
import SelectPaymentMethod from './SelectPaymentMethod'
import {validateFields} from './FormCard'

function getStatusFromDocument(document) {
  if (document.cancelledAt) return 'cancelled'
  if (document.type === 'quotation' && document.signedAt) return 'signed'
  if (document.type === 'invoice' && document.paidAt) return 'paid'
  if (document.type === 'credit' && document.refundedAt) return 'refunded'
  if (document.sentAt) return 'sent'
  return 'draft'
}

function SelectStatus(props) {
  const {form, document, onChange: handleStatusChange, ...customProps} = props
  const {getFieldDecorator} = form
  const prevStatus = getStatusFromDocument(document)
  const [status, setStatus] = useState(prevStatus)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const {t} = useTranslation()

  async function submitConfirm(event) {
    if (event) event.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      const {date: nextDate, ...fields} = await validateFields(form)
      await handleStatusChange({[`${status}At`]: nextDate.toISOString(), ...fields})
      setLoading(false)
      closeConfirm()
    } catch (e) {
      setLoading(false)
    }
  }

  function closeConfirm() {
    setStatus(prevStatus)
    setConfirmVisible(false)
  }

  function handleChange(event) {
    setStatus(event.key)

    if (event.key !== 'draft') {
      setConfirmVisible(true)
      form.resetFields()
    }
  }

  const footer = (
    <Button.Group>
      <Button onClick={closeConfirm} disabled={loading}>
        {t('cancel')}
      </Button>
      <Button
        type="primary"
        htmlType="submit"
        onClick={submitConfirm}
        loading={loading}
        style={{marginLeft: 4}}
      >
        {t('confirm')}
      </Button>
    </Button.Group>
  )

  const menu = (
    <Menu onClick={handleChange}>
      {prevStatus === 'draft' && <Menu.Item key="sent">{t('sent')}</Menu.Item>}
      {prevStatus === 'sent' && document.type === 'quotation' && (
        <Menu.Item key="signed">{t('signed')}</Menu.Item>
      )}
      {prevStatus === 'sent' && document.type === 'invoice' && (
        <Menu.Item key="paid">{t('paid')}</Menu.Item>
      )}
      {prevStatus === 'sent' && document.type === 'credit' && (
        <Menu.Item key="refunded">{t('refunded')}</Menu.Item>
      )}
      {prevStatus !== 'draft' && <Menu.Item key="cancelled">{t('cancelled')}</Menu.Item>}
    </Menu>
  )

  return (
    <>
      <Dropdown overlay={menu} {...customProps}>
        <Button>
          <Icon type="tag" />
          {t('mark-as')}
        </Button>
      </Dropdown>

      {confirmVisible && (
        <Modal
          title={t('please-confirm-information')}
          visible={confirmVisible}
          destroyOnClose
          footer={footer}
          closable={!loading}
          onCancel={() => !loading && closeConfirm()}
        >
          <Form noValidate layout="vertical" onSubmit={submitConfirm}>
            <Row gutter={15}>
              <Col xs={24}>
                <Form.Item label={t(kebabCase(`${status}-at`))}>
                  {getFieldDecorator('date', {
                    initialValue: moment(),
                    rules: [{required: true, message: t('field-required')}],
                  })(<DatePicker disabled={loading} />)}
                </Form.Item>

                {['paid', 'refunded'].includes(status) && (
                  <>
                    <Form.Item label={t('payment-method')}>
                      {getFieldDecorator('paymentMethod', {
                        initialValue: 'bankTransfert',
                        rules: [{required: true, message: t('field-required')}],
                      })(<SelectPaymentMethod disabled={loading} />)}
                    </Form.Item>
                    <Form.Item label={t('nature')}>
                      {getFieldDecorator('nature', {
                        rules: [{required: true, message: t('field-required')}],
                      })(<AutoCompleteNature disabled={loading} />)}
                    </Form.Item>
                  </>
                )}
              </Col>
            </Row>
          </Form>
        </Modal>
      )}
    </>
  )
}

export default Form.create()(SelectStatus)
