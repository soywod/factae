import React, {forwardRef} from 'react'
import {useTranslation} from 'react-i18next'
import Select from 'antd/es/select'
import kebabCase from 'lodash/fp/kebabCase'

const AutoCompletePaymentMethod = forwardRef((props, ref) => {
  const {t} = useTranslation()

  return (
    <Select ref={ref} size="large" {...props}>
      {['bankTransfert', 'creditCard', 'cash', 'check', 'ewallet'].map(paymentMethod => (
        <Select.Option key={paymentMethod} value={paymentMethod}>
          {t(kebabCase(paymentMethod))}
        </Select.Option>
      ))}
    </Select>
  )
})

export default AutoCompletePaymentMethod
