import React, {forwardRef} from 'react'
import {useTranslation} from 'react-i18next'
import DatePicker from 'antd/lib/date-picker'

const formats = {
  fr: 'DD/MM/YYYY',
  en: 'YYYY-MM-DD',
}

const CustomDatePicker = forwardRef((props, ref) => {
  const {i18n} = useTranslation()

  return (
    <DatePicker
      ref={ref}
      size="large"
      placeholder=""
      format={formats[i18n.language]}
      style={{width: '100%'}}
      {...props}
    />
  )
})

export default CustomDatePicker
