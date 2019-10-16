import {DateTime} from 'luxon'
import filter from 'lodash/fp/filter'
import isEmpty from 'lodash/fp/isEmpty'
import isNil from 'lodash/fp/isNil'
import overSome from 'lodash/fp/overSome'
import pipe from 'lodash/fp/pipe'
import sum from 'lodash/fp/sum'
import sumBy from 'lodash/fp/sumBy'

const isNilOrEmpty = overSome([isNil, isEmpty])

function getSignByDocumentType(type) {
  switch (type) {
    default:
    case 'invoice':
      return 1

    case 'credit':
      return -1
  }
}

export function getTurnover(documents, now, monthShift) {
  if (isNilOrEmpty(documents)) return null

  const firstDay = now
    .minus({month: monthShift})
    .set({day: 1, hour: 0, minute: 0, second: 0, millisecond: 0})

  function filterByStatusAndDate(document) {
    if (!['invoice', 'credit'].includes(document.type)) return false
    if (document.type === 'invoice' && !document.paidAt) return false
    if (document.type === 'credit' && !document.refundedAt) return false
    if (DateTime.fromISO(document.paidAt) < firstDay) return false
    return true
  }

  function sumByTotalHT(documents) {
    const totals = documents.map(d => d.totalHT * getSignByDocumentType(d.type))
    return sum(totals)
  }

  return pipe([filter(filterByStatusAndDate), sumByTotalHT])(documents)
}

export function getMonthlyTurnover(documents, now = DateTime.local()) {
  return getTurnover(documents, now, 0)
}

export function getQuarterlyTurnover(documents, now = DateTime.local()) {
  return getTurnover(documents, now, 2)
}

export function getPendingQuotationsTurnover(documents) {
  function filterByTypeAndStatus(document) {
    if (document.type !== 'quotation') return false
    if (!document.sentAt) return false
    if (document.signedAt) return false
    return true
  }

  return pipe([filter(filterByTypeAndStatus), sumBy('totalHT')])(documents)
}

export function getPendingInvoicesTurnover(documents) {
  function filterByTypeAndStatus(document) {
    if (document.type !== 'invoice') return false
    if (!document.sentAt) return false
    if (document.paidAt) return false
    return true
  }

  return pipe([filter(filterByTypeAndStatus), sumBy('totalHT')])(documents)
}
