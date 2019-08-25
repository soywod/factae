import React, {forwardRef} from 'react'
import {useTranslation} from 'react-i18next'
import Icon from 'antd/es/icon'
import Select from 'antd/es/select'

import Link from './Link'
import {useThemes, getThemeUrl} from '../../utils/themes'

const DocumentThemePicker = forwardRef(({preview, ...props}, ref) => {
  const {t} = useTranslation()
  const themes = useThemes()

  return (
    <div style={{textAlign: 'right'}}>
      <Select size="large" ref={ref} {...props}>
        {themes.map(theme => (
          <Select.Option key={theme} value={theme}>
            {theme}
          </Select.Option>
        ))}
      </Select>
      {preview && (
        <Link to={getThemeUrl(preview)}>
          <Icon type="eye" />
          {t('preview')}
        </Link>
      )}
    </div>
  )
})

export default DocumentThemePicker
