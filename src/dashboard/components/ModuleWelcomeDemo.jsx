import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Modal from 'antd/es/modal'

import {useProfile} from '../../profile/hooks'
import {isDemo} from '../demo'

const STORAGE_KEY = 'demo'

function ModuleWelcomeDemo() {
  const profile = useProfile()
  const [hidden, setHidden] = useState(Boolean(localStorage.getItem(STORAGE_KEY)))
  const {t} = useTranslation()

  function closeModal() {
    setHidden(true)
    localStorage.setItem(STORAGE_KEY, true)
  }

  if (!profile || !isDemo(profile)) {
    return null
  }

  return (
    <Modal
      title={t('/dashboard.modal-title')}
      visible={!hidden}
      cancelText={t('close')}
      okButtonProps={{style: {display: 'none'}}}
      onCancel={closeModal}
    >
      <p dangerouslySetInnerHTML={{__html: t('/dashboard.modal-content-1')}} />
      <p style={{margin: 0}} dangerouslySetInnerHTML={{__html: t('/dashboard.modal-content-2')}} />
    </Modal>
  )
}

export default ModuleWelcomeDemo
