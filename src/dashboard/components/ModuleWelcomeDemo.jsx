import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Modal from 'antd/es/modal'

import {useProfile} from '../../profile/hooks'
import $profile from '../../profile/service'
import {isDemo} from '../demo'

const STORAGE_KEY = 'demo'

function ModuleWelcomeDemo() {
  const profile = useProfile()
  const [visible, setVisible] = useState(false)
  const {t} = useTranslation()

  useEffect(() => {
    if (profile && !isDemo(profile) && !profile.welcomed) {
      setVisible(true)
    }
  }, [profile])

  useEffect(() => {
    if (profile && isDemo(profile)) {
      setVisible(!localStorage.getItem(STORAGE_KEY))
    }
  }, [profile])

  if (!profile) {
    return null
  }

  function closeModal() {
    setVisible(false)
    $profile.set({...profile, welcomed: true})
    localStorage.setItem(STORAGE_KEY, true)
  }

  return (
    <Modal
      title={t('/dashboard.modal-title')}
      visible={visible}
      cancelText={t('close')}
      onCancel={closeModal}
      onOk={closeModal}
      okButtonProps={{style: {display: 'none'}}}
    >
      <p dangerouslySetInnerHTML={{__html: t('/dashboard.modal-content-1')}} />
      <p style={{margin: 0}} dangerouslySetInnerHTML={{__html: t('/dashboard.modal-content-2')}} />
    </Modal>
  )
}

export default ModuleWelcomeDemo
