import React, {useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import moment from 'moment'
import Button from 'antd/lib/button'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
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
  const {document, onConfirm: handleConfirm, children} = props
  const {getFieldDecorator} = props.form
  const prevStatus = getStatusFromDocument(document)
  const [status, setStatus] = useState(prevStatus)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const {t} = useTranslation()

  async function submitConfirm(event) {
    if (event) event.preventDefault()
    const {date: nextDate, ...fields} = await validateFields(props.form)
    closeConfirm()
    await handleConfirm({[`${status}At`]: nextDate.toISOString(), ...fields})
  }

  function closeConfirm() {
    setConfirmVisible(false)
    setStatus(prevStatus)
  }

  const showConfirm = nextStatus => () => {
    setStatus(nextStatus)

    if (nextStatus !== 'draft') {
      setConfirmVisible(true)
      props.form.resetFields()
    }
  }

  const footer = (
    <Button.Group>
      <Button onClick={closeConfirm}>{t('cancel')}</Button>
      <Button type="primary" htmlType="submit" onClick={submitConfirm} style={{marginLeft: 4}}>
        {t('confirm')}
      </Button>
    </Button.Group>
  )

  const button = useMemo(() => children(showConfirm), [children])

  return (
    <>
      {button}
      <Modal
        title={t('please-confirm-information')}
        visible={confirmVisible}
        destroyOnClose
        footer={footer}
        onCancel={() => closeConfirm()}
      >
        <Form noValidate layout="vertical" onSubmit={submitConfirm}>
          <Row gutter={15}>
            <Col xs={24}>
              <Form.Item label={t(kebabCase(`${status}-at`))}>
                {getFieldDecorator('date', {
                  initialValue: moment(),
                  rules: [{required: true, message: t('field-required')}],
                })(<DatePicker />)}
              </Form.Item>

              {['paid', 'refunded'].includes(status) && (
                <>
                  <Form.Item label={t('payment-method')}>
                    {getFieldDecorator('paymentMethod', {
                      initialValue: 'bankTransfert',
                      rules: [{required: true, message: t('field-required')}],
                    })(<SelectPaymentMethod />)}
                  </Form.Item>
                  <Form.Item label={t('nature')}>
                    {getFieldDecorator('nature', {
                      rules: [{required: true, message: t('field-required')}],
                    })(<AutoCompleteNature />)}
                  </Form.Item>
                </>
              )}
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default Form.create()(SelectStatus)
