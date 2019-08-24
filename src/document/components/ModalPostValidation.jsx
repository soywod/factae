import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import moment from 'moment'
import Button from 'antd/es/button'
import AutoComplete from 'antd/es/auto-complete'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Modal from 'antd/es/modal'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import kebabCase from 'lodash/fp/kebabCase'

import {validateFields} from '../../common/components/FormCard'
import DatePicker from '../../common/components/DatePicker'

function ModalPostValidation({form, status, visible, loading, onSubmit: close}) {
  const {getFieldDecorator} = form
  const {t} = useTranslation()

  useEffect(() => {
    form.resetFields()
  }, [visible])

  async function submit() {
    if (loading) return
    const {date, ...fields} = await validateFields(form)
    close({[`${status}At`]: date.toISOString(), ...fields})
  }

  const footer = (
    <Button.Group>
      <Button type="primary" loading={loading} onClick={submit}>
        {t('confirm')}
      </Button>
    </Button.Group>
  )

  return (
    <Modal
      title={t('please-confirm-information')}
      visible={visible}
      closable={false}
      footer={footer}
      bodyStyle={{paddingBottom: 0}}
    >
      <Form noValidate layout="vertical" onSubmit={submit}>
        <Row gutter={15}>
          <Col xs={24}>
            <Form.Item label={t(`${status}-at`)}>
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
                  })(
                    <Select size="large">
                      {['bankTransfert', 'creditCard', 'cash', 'check', 'ewallet'].map(
                        paymentMethod => (
                          <Select.Option key={paymentMethod} value={paymentMethod}>
                            {t(kebabCase(paymentMethod))}
                          </Select.Option>
                        ),
                      )}
                    </Select>,
                  )}
                </Form.Item>
                <Form.Item label={t('nature')}>
                  {getFieldDecorator('nature', {
                    rules: [{required: true, message: t('field-required')}],
                  })(<AutoComplete size="large" />)}
                </Form.Item>
              </>
            )}
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default Form.create()(ModalPostValidation)
