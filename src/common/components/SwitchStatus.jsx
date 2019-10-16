import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import moment from 'moment'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Modal from 'antd/es/modal'
import Row from 'antd/es/row'
import Switch from 'antd/es/switch'
import Tooltip from 'antd/es/tooltip'
import kebabCase from 'lodash/fp/kebabCase'

import AutoCompleteNature from './AutoCompleteNature'
import DatePicker from './DatePicker'
import SelectPaymentMethod from './SelectPaymentMethod'
import {validateFields} from './FormCard'

function SwitchStatus(props) {
  const {form, name: status, disabled, onChange: handleStatusChange} = props
  const {getFieldDecorator} = form
  const [confirmVisible, setConfirmVisible] = useState(false)
  const {t, i18n} = useTranslation()
  const date = props.date ? DateTime.fromISO(props.date, {locale: i18n.language}) : null
  const [checked, setChecked] = useState(Boolean(date))

  async function submitConfirm() {
    const {date: nextDate, ...fields} = await validateFields(form)
    setChecked(true)
    handleStatusChange({[`${status}At`]: nextDate.toISOString(), ...fields})
    closeConfirm()
  }

  function closeConfirm() {
    setConfirmVisible(false)
  }

  function handleSwitchChange(nextChecked) {
    if (nextChecked) {
      setConfirmVisible(true)
    } else {
      setChecked(false)
      handleStatusChange({[`${status}At`]: null})
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
      <Form.Item label={t(kebabCase(status))} help={help}>
        <Switch
          checked={checked}
          onChange={handleSwitchChange}
          disabled={disabled}
          checkedChildren={<Icon type="check" />}
          unCheckedChildren={<Icon type="close" />}
        />
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

export default Form.create()(SwitchStatus)
