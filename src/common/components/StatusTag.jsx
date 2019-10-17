import React from 'react'
import {useTranslation} from 'react-i18next'
import Tag from 'antd/lib/tag'

const style = {
  cursor: 'inherit',
  textTransform: 'lowercase',
  marginLeft: 12,
}

function StatusTag({document}) {
  const {t} = useTranslation()

  if (document.cancelledAt) {
    return (
      <Tag color="red" style={style}>
        {t('cancelled')}
      </Tag>
    )
  }

  if (document.signedAt) {
    return (
      <Tag color="green" style={style}>
        {t('signed')}
      </Tag>
    )
  }

  if (document.paidAt) {
    return (
      <Tag color="green" style={style}>
        {t('paid')}
      </Tag>
    )
  }

  if (document.refundedAt) {
    return (
      <Tag color="orange" style={style}>
        {t('refunded')}
      </Tag>
    )
  }

  if (document.sentAt) {
    return (
      <Tag color="blue" style={style}>
        {t('sent')}
      </Tag>
    )
  }

  return null
}

export default StatusTag
