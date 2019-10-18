export function getCurrStatus(document) {
  if (document.cancelledAt) return 'cancelled'
  if (document.type === 'quotation' && document.signedAt) return 'signed'
  if (document.type === 'invoice' && document.paidAt) return 'paid'
  if (document.type === 'credit' && document.refundedAt) return 'refunded'
  if (document.sentAt) return 'sent'
  return 'draft'
}

export function getNextStatus(document) {
  const status = getCurrStatus(document)

  switch (status) {
    case 'draft':
      return 'sent'

    case 'sent':
      if (document.type === 'quotation') return 'signed'
      if (document.type === 'invoice') return 'paid'
      if (document.type === 'credit') return 'refunded'
      return status

    default:
      return status
  }
}

export default {getCurrStatus, getNextStatus}
