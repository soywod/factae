import React from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/lib/button'
import Icon from 'antd/lib/icon'
import Modal from 'antd/lib/modal'

import ChangeStatus from '../../common/components/ChangeStatus'

function ModalPreview({document, visible, loading, onClose: close}) {
  const {t} = useTranslation()

  const footer = (
    <Button.Group>
      <Button type="link" onClick={() => close({source: 'cancel'})} disabled={loading}>
        {t('cancel')}
      </Button>
      <Button onClick={() => close({source: 'send'})} disabled={loading} style={{marginLeft: 4}}>
        <Icon type="mail" />
        {t('send')}
      </Button>
      <ChangeStatus document={document} onConfirm={data => close({source: 'mark-as-sent', data})}>
        {showConfirm => (
          <Button
            type="primary"
            onClick={showConfirm('sent')}
            disabled={loading}
            style={{marginLeft: 4}}
          >
            <Icon type={loading ? 'loading' : 'check'} />
            {t('mark-as-sent')}
          </Button>
        )}
      </ChangeStatus>
    </Button.Group>
  )

  return (
    <Modal
      title={t('preview')}
      visible={visible}
      footer={footer}
      onCancel={() => close(false)}
      width={600}
    >
      <div style={{minHeight: 600}}>
        <iframe title={t('preview')} src={document.pdf} width="100%" height={600} />
      </div>
    </Modal>
  )
}

export default ModalPreview
