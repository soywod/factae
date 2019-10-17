import React from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/lib/button'
import Dropdown from 'antd/lib/dropdown'
import Icon from 'antd/lib/icon'
import Menu from 'antd/lib/menu'

const styles = {
  button: {
    color: 'rgba(255, 255, 255, .65)',
    background: '#001529',
    borderColor: 'rgba(255, 255, 255, .65)',
  },
}

function SelectLanguage({style = styles.button, placement = 'bottomCenter'}) {
  const {i18n} = useTranslation()

  function changeLanguage(lang) {
    i18n.changeLanguage(lang)
    window.location.reload()
  }

  return (
    <Dropdown
      placement={placement}
      overlay={
        <Menu>
          {['fr', 'en'].map(lang => (
            <Menu.Item key={lang} onClick={() => changeLanguage(lang)}>
              {lang}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Button size="small" type="dashed" style={style}>
        {i18n.language}
        <Icon type={`caret-${placement.startsWith('bottom') ? 'down' : 'up'}`} />
      </Button>
    </Dropdown>
  )
}

export default SelectLanguage
