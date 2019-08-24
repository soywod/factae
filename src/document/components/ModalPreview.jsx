import React from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Icon from 'antd/es/icon'
import Spin from 'antd/es/spin'
import Modal from 'antd/es/modal'

function Preview({document, visible, loading, onClose: close}) {
  const {t} = useTranslation()

  const footer = (
    <Button.Group>
      <Button onClick={() => close(false)} disabled={loading}>
        {t('cancel')}
      </Button>
      <Button type="dashed" href={document.pdf} download={document.number} disabled={loading}>
        <Icon type="download" />
        {t('download')}
      </Button>
      <Button type="primary" onClick={() => close(true)} disabled={loading}>
        <Icon type={loading ? 'loading' : 'mail'} />
        {t('send')}
      </Button>
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
      <Spin size="large" spinning={loading}>
        <div style={{minHeight: 600}}>
          {!loading && (
            <iframe
              title={t('preview')}
              frameBorder="1"
              src={document.pdf}
              width="100%"
              height={600}
            />
          )}
        </div>
      </Spin>
    </Modal>
  )
}

export default Preview
