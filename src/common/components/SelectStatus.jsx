import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import moment from 'moment'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
// import Icon from 'antd/es/icon'
import Modal from 'antd/es/modal'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import Tooltip from 'antd/es/tooltip'
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
  const defaultStatus = getStatusFromDocument(document)
  const [status, setStatus] = useState(defaultStatus)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const {t, i18n} = useTranslation()
  const date = props.date ? DateTime.fromISO(props.date, {locale: i18n.language}) : null

  async function submitConfirm() {
    const {date: nextDate, ...fields} = await validateFields(form)
    handleStatusChange({...document, [`${status}At`]: nextDate.toISOString(), ...fields})
    closeConfirm()
  }

  function closeConfirm() {
    setStatus(defaultStatus)
    setConfirmVisible(false)
  }

  function handleSelectChange(status) {
    setStatus(status)

    if (status !== 'draft') {
      setConfirmVisible(true)
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

  const help = date ? (
    <Tooltip title={date.toFormat(t('date-format-short'))} placement="bottomLeft">
      <em className="ant-form-explain" style={{cursor: 'default'}}>
        {date.toRelative()}
      </em>
    </Tooltip>
  ) : null

  return (
    <>
      <Form.Item label={t('status')} help={help} {...customProps}>
        <Select size="large" value={defaultStatus} onChange={handleSelectChange}>
          {['draft'].includes(defaultStatus) && (
            <Select.Option value="draft">{t('draft')}</Select.Option>
          )}
          {['draft', 'sent'].includes(defaultStatus) && (
            <Select.Option value="sent">{t('sent')}</Select.Option>
          )}
          {['sent', 'signed'].includes(defaultStatus) && document.type === 'quotation' && (
            <Select.Option value="signed">{t('signed')}</Select.Option>
          )}
          {['sent', 'paid'].includes(defaultStatus) && document.type === 'invoice' && (
            <Select.Option value="paid">{t('paid')}</Select.Option>
          )}
          {['sent', 'refunded'].includes(defaultStatus) && document.type === 'credit' && (
            <Select.Option value="refunded">{t('refunded')}</Select.Option>
          )}
          {defaultStatus !== 'draft' && (
            <Select.Option value="cancelled">{t('cancelled')}</Select.Option>
          )}
        </Select>
      </Form.Item>

      <Modal
        title={t('please-confirm-information')}
        visible={confirmVisible}
        footer={footer}
        onCancel={closeConfirm}
      >
        <Form noValidate layout="vertical">
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
