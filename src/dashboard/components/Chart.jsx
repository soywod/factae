import React, {useEffect, useMemo, useRef} from 'react'
import {Chart as ChartJS} from 'chart.js'
import _ from 'lodash/fp'
import {DateTime} from 'luxon'

import {useDocuments} from '../../document/hooks'
import {toEuro} from '../../common/currency'
import {useThresholds, useFirstAndLastDayOfYear} from '../hooks'

const months = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

function Chart() {
  const ref = useRef()
  const chart = useRef()
  const documents = useDocuments()
  const [lowTVA, highTVA, AE] = useThresholds()
  const invoices = _.isNull(documents) ? null : _.filter({type: 'invoice'}, documents)
  const [firstDayOfYear, lastDayOfYear] = useFirstAndLastDayOfYear()

  function isNullOrEmpty(invoices) {
    return _.pipe([_.filter({status: 'paid'}), _.overSome([_.isNull, _.isEmpty])])(invoices)
  }

  const totals = useMemo(() => {
    if (isNullOrEmpty(invoices)) return []

    const monthIds = _.range(1, 13)
    const totals = _.fill(0)(12)([])(null)
    const defaultData = _.zipObject(monthIds, totals)

    function byStatusAndCreatedAt(invoice) {
      if (_.isNull(invoice.createdAt)) return false
      if (invoice.status !== 'paid') return false
      if (DateTime.fromISO(invoice.createdAt) < firstDayOfYear) return false
      if (DateTime.fromISO(invoice.createdAt) > lastDayOfYear) return false

      return true
    }

    function byMonth(invoice) {
      if (_.isNull(invoice.createdAt)) {
        return null
      }

      return {
        month: DateTime.fromISO(invoice.createdAt).month,
        total: invoice.totalHT,
      }
    }

    return _.pipe([
      _.filter(byStatusAndCreatedAt),
      _.map(byMonth),
      _.groupBy('month'),
      _.mapValues(_.sumBy('total')),
      _.defaults(defaultData),
      _.values,
    ])(invoices)
  }, [invoices, firstDayOfYear, lastDayOfYear])

  const turnovers = useMemo(() => {
    if (isNullOrEmpty(invoices)) return []

    function bySum(sums, total) {
      const currTotal = total || 0
      const lastSum = _.last(sums) || 0
      return [...sums, currTotal + lastSum]
    }

    function byMask(sum, index) {
      return totals[index] ? sum : null
    }

    return totals.reduce(bySum, []).map(byMask)
  }, [totals])

  const theoricTurnovers = useMemo(() => {
    if (isNullOrEmpty(invoices)) return []

    const currCreatedAt = _.pipe([
      _.filter({status: 'paid'}),
      _.sortBy('createdAt'),
      _.first,
      _.get('createdAt'),
    ])(invoices)

    const currMonth = DateTime.fromISO(currCreatedAt).month

    const prevMonth = Math.max(0, currMonth - 1)
    const emptyTurnovers = _.fill(0, prevMonth, null, Array(prevMonth))
    const turnoversMean = _.pipe([_.compact, _.mean])(totals)
    const turnoversSum = _.range(0, 12 - prevMonth)
      .map(_.multiply(turnoversMean))
      .map(_.add(Math.round(turnovers[prevMonth])))

    return _.concat(emptyTurnovers)(turnoversSum)
  }, [totals])

  useEffect(() => {
    if (_.isNull(ref.current)) return
    if (chart.current) chart.current.destroy()

    chart.current = new ChartJS(ref.current, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            data: _.fill(0)(12)(lowTVA)(Array(12)),
            label: `Plafond TVA (bas)`,
            fill: false,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, .33)',
            pointHitRadius: 20,
            pointBorderWidth: 0,
            pointRadius: 0,
          },
          {
            data: _.fill(0)(12)(highTVA)(Array(12)),
            label: `Plafond TVA (haut)`,
            fill: false,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, .66)',
            pointHitRadius: 20,
            pointBorderWidth: 0,
            pointRadius: 0,
          },
          {
            data: _.fill(0)(12)(AE)(Array(12)),
            label: `Plafond micro-entrepreneur`,
            fill: false,
            borderWidth: 1,
            borderColor: 'black',
            pointHitRadius: 20,
            pointBorderWidth: 0,
            pointRadius: 0,
          },
          {
            data: totals,
            label: `CA réel`,
            fill: false,
            borderWidth: 3,
            borderColor: '#1890ff',
            pointBackgroundColor: '#1890ff',
            pointBorderColor: '#1890ff',
            pointHitRadius: 20,
            pointBorderWidth: 2,
            pointRadius: 2,
            pointHoverBorderWidth: 3,
            pointHoverRadius: 3,
          },
          {
            data: turnovers,
            label: `CA cumulé`,
            fill: false,
            borderWidth: 3,
            borderColor: '#f5222d',
            pointBackgroundColor: '#f5222d',
            pointBorderColor: '#f5222d',
            pointHitRadius: 20,
            pointBorderWidth: 2,
            pointRadius: 2,
            pointHoverBorderWidth: 3,
            pointHoverRadius: 3,
          },
          {
            data: theoricTurnovers,
            label: `CA cumulé théorique`,
            fill: false,
            borderWidth: 2,
            borderDash: [5, 5],
            borderColor: 'rgba(0, 0, 0, .1)',
            pointBackgroundColor: 'rgba(0, 0, 0, .2)',
            pointBorderColor: 'rgba(0, 0, 0, .2)',
            pointBorderWidth: 2,
            pointRadius: 2,
            pointHoverBorderWidth: 3,
            pointHoverRadius: 3,
            pointHitRadius: 20,
          },
        ],
      },
      options: {
        animation: {
          duration: 0,
        },
        hover: {
          animationDuration: 0,
        },
        responsiveAnimationDuration: 0,
        maintainAspectRatio: false,
        tooltips: {
          callbacks: {
            label: label => toEuro(label.yLabel),
          },
        },
        scales: {
          yAxes: [
            {
              ticks: {
                callback: toEuro,
              },
            },
          ],
        },
      },
    })
  }, [invoices, lowTVA])

  return (
    <>
      <h2>Chiffre d'affaire</h2>
      <div>
        <canvas ref={ref} height="400" style={{background: '#f0f2f5'}} />
      </div>
    </>
  )
}

export default Chart
