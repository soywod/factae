import {DateTime} from "luxon"
import defaults from "lodash/fp/defaults"
import fill from "lodash/fp/fill"
import filter from "lodash/fp/filter"
import groupBy from "lodash/fp/groupBy"
import isEmpty from "lodash/fp/isEmpty"
import isNil from "lodash/fp/isNil"
import last from "lodash/fp/last"
import mapBase from "lodash/fp/map"
import mapValues from "lodash/fp/mapValues"
import mean from "lodash/fp/mean"
import multiply from "lodash/fp/multiply"
import overSome from "lodash/fp/overSome"
import pipe from "lodash/fp/pipe"
import range from "lodash/fp/range"
import reject from "lodash/fp/reject"
import sortBy from "lodash/fp/sortBy"
import sumBy from "lodash/fp/sumBy"
import values from "lodash/fp/values"
import zipObject from "lodash/fp/zipObject"

const map = mapBase.convert({cap: false})
const isNilOrEmpty = overSome([isNil, isEmpty])

function getMostRecentMonth(invoices) {
  const sortByDate = invoices => sortBy(doc => doc.sentAt, invoices)
  const lastInvoice = pipe([sortByDate, last])(invoices)
  return DateTime.fromISO(lastInvoice.sentAt).month - 1
}

export function getTurnover(invoices, now) {
  if (isNilOrEmpty(invoices)) return null
  const mostRecentMonth = getMostRecentMonth(invoices)

  const firstDayOfYear = now.set({
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  })

  const lastDayOfYear = firstDayOfYear
    .plus({year: 1})
    .minus({day: 1})
    .set({hour: 23, minute: 59, second: 59, millisecond: 999})

  function filterByDate(doc) {
    const paidAt = DateTime.fromISO(doc.paidAt || doc.refundedAt)
    if (paidAt < firstDayOfYear) return false
    if (paidAt > lastDayOfYear) return false
    return true
  }

  const mapByMonth = doc => ({
    month: DateTime.fromISO(doc.paidAt || doc.refundedAt).month,
    total: doc.totalHT,
  })

  // Set default turnover for each month
  const defaultData = zipObject(range(1, 13), fill(0, 12, [], null))

  // Set undefined for each month > most recent invoice month
  const mapByActiveMonth = (turnover, index) =>
    index > mostRecentMonth ? undefined : turnover || 0

  return pipe([
    filter(filterByDate),
    map(mapByMonth),
    groupBy("month"),
    mapValues(sumBy("total")),
    defaults(defaultData),
    values,
    map(mapByActiveMonth),
  ])(invoices)
}

export function getCumulativeTurnover(invoices, turnover) {
  if (isNilOrEmpty(invoices)) return null
  const mostRecentMonth = getMostRecentMonth(invoices)

  // Set undefined for each month > most recent invoice month
  const mapByActiveMonth = (sum, index) => (index > mostRecentMonth ? undefined : sum)

  function reduceBySum(sums, turnover) {
    const currTurnover = turnover || 0
    const lastTurnover = last(sums) || 0
    return [...sums, currTurnover + lastTurnover]
  }

  return turnover.reduce(reduceBySum, []).map(mapByActiveMonth)
}

export function getTheoricCumulativeTurnover(turnover) {
  if (isNilOrEmpty(turnover)) return null
  const turnoverMean = pipe([reject(isNil), mean])(turnover)
  return range(1, 13).map(multiply(turnoverMean))
}
