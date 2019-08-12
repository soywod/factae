import React from 'react'
import {useTranslation} from 'react-i18next'
import Select from 'antd/es/select'

function SelectLanguage(props) {
  const {i18n} = useTranslation()

  return (
    <Select
      size="small"
      defaultValue={i18n.language}
      onSelect={lang => i18n.changeLanguage(lang)}
      {...props}
    >
      {['fr', 'en'].map(lang => (
        <Select.Option key={lang} value={lang}>
          {lang}
        </Select.Option>
      ))}
    </Select>
  )
}

export default SelectLanguage
