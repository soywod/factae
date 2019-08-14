import React, {useEffect, useMemo, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {Chart as ChartJS} from 'chart.js'
import _ from 'lodash/fp'
import {DateTime} from 'luxon'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import range from 'lodash/fp/range'

import {toEuro} from '../../common/currency'
import {FormCardTitle} from '../../common/components/FormCard'
import {useDocuments} from '../../document/hooks'
import {useFirstAndLastDayOfYear} from '../hooks'
import ModuleMonthlyTurnover from './ModuleMonthlyTurnover'
import ModuleQuarterlyTurnover from './ModuleQuarterlyTurnover'

function Chart() {
  const ref = useRef()
  const chart = useRef()
  const documents = useDocuments()
  const invoices = _.isNull(documents) ? null : _.filter({type: 'invoice'}, documents)
  const [firstDayOfYear, lastDayOfYear] = useFirstAndLastDayOfYear()
  const {t, i18n} = useTranslation()
  const months = range(1, 13).map(month =>
    DateTime.local()
      .setLocale(i18n.language)
      .set({month})
      .toFormat('LLLL'),
  )

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
            data: totals,
            label: t('real-turnover'),
            borderWidth: 3,
            borderColor: '#52c41a',
            pointBackgroundColor: '#52c41a',
            pointBorderColor: '#52c41a',
            pointHitRadius: 20,
            pointBorderWidth: 2,
            pointRadius: 2,
            pointHoverBorderWidth: 3,
            pointHoverRadius: 3,
            lineTension: 0,
          },
          {
            data: turnovers,
            label: t('cumulative-turnover'),
            borderWidth: 3,
            borderColor: '#1890ff',
            pointBackgroundColor: '#1890ff',
            pointBorderColor: '#1890ff',
            pointHitRadius: 20,
            pointBorderWidth: 2,
            pointRadius: 2,
            pointHoverBorderWidth: 3,
            pointHoverRadius: 3,
            lineTension: 0,
          },
          {
            data: theoricTurnovers,
            label: t('theoric-cumulative-turnover'),
            fill: false,
            borderWidth: 2,
            borderDash: [5, 5],
            borderColor: 'rgba(245, 34, 45, .2)',
            pointBackgroundColor: 'rgba(245, 34, 45, .2)',
            pointBorderColor: 'rgba(245, 34, 45, .2)',
            pointBorderWidth: 2,
            pointRadius: 0,
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
  }, [invoices])

  return (
    <>
      <Row gutter={15} style={{marginBottom: 15}}>
        <Col xs={24}>
          <Card
            title={
              <FormCardTitle title={'fiscal-year'} titleData={{year: DateTime.local().year}} />
            }
          >
            <div>
              <canvas ref={ref} height="400" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={15} style={{marginBottom: 15}}>
        <ModuleMonthlyTurnover />
        <ModuleQuarterlyTurnover />
      </Row>
    </>
  )
}

export default Chart
