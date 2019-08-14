import {DateTime} from 'luxon'
import filter from 'lodash/fp/filter'
import isEmpty from 'lodash/fp/isEmpty'
import isNil from 'lodash/fp/isNil'
import mapValues from 'lodash/fp/mapValues'
import overEvery from 'lodash/fp/overEvery'
import pipe from 'lodash/fp/pipe'
import sum from 'lodash/fp/sum'
import reduce from 'lodash/fp/reduce'
import sumBy from 'lodash/fp/sumBy'
import values from 'lodash/fp/values'

const isNilOrEmpty = overEvery([isNil, isEmpty])

export function getTurnover(documents, now, monthShift) {
  if (isNilOrEmpty(documents)) return null
  const firstDay = now
    .minus({month: monthShift})
    .set({day: 1, hour: 0, minute: 0, second: 0, millisecond: 0})

  function byStatusAndCreatedAt(document) {
    if (isNil(document.createdAt)) return false
    if (DateTime.fromISO(document.createdAt) < firstDay) return false
    if (document.type !== 'invoice') return false
    if (document.status === 'draft') return false
    return true
  }

  function groupByStatus(map, document) {
    map[document.status].push(document)
    return map
  }

  const turnover = pipe([
    filter(byStatusAndCreatedAt),
    reduce(groupByStatus, {paid: [], sent: []}),
    mapValues(sumBy('totalHT')),
    values,
  ])(documents)

  if (sum(turnover) === 0) {
    return null
  }

  return turnover
}

export function getMonthlyTurnover(documents, now = DateTime.local()) {
  return getTurnover(documents, now, 0)
}

export function getQuarterlyTurnover(documents, now = DateTime.local()) {
  return getTurnover(documents, now, 2)
}
