import React from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/lib/button'
import Icon from 'antd/lib/icon'
import Spin from 'antd/lib/spin'
import Modal from 'antd/lib/modal'

function Preview({document, visible, loading, onClose: close}) {
  const {t} = useTranslation()

  const footer = (
    <Button.Group>
      <Button onClick={() => close(false)} disabled={loading}>
        {t('cancel')}
      </Button>
      <Button
        type="dashed"
        href={document.pdf}
        download={document.number}
        disabled={loading}
        style={{marginLeft: 4}}
      >
        <Icon type="download" />
        {t('download')}
      </Button>
      <Button type="primary" onClick={() => close(true)} disabled={loading} style={{marginLeft: 4}}>
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
          {!loading && <iframe title={t('preview')} src={document.pdf} width="100%" height={600} />}
        </div>
      </Spin>
    </Modal>
  )
}

export default Preview
